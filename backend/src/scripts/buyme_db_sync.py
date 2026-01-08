# buyme_db_sync.py
# Scrapes BuyMe gift card categories and suppliers, syncing directly to PostgreSQL

import os
import json
import time
import uuid
import logging
from datetime import datetime
from typing import Dict, List, Set
import psycopg2
from psycopg2.extras import execute_values
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Database connection from environment variable
DATABASE_URL = os.environ.get('DATABASE_URL')


class BuyMeDBSyncer:
    """
    Scrapes BuyMe.co.il for gift card categories and their accepted suppliers,
    then syncs the data directly to the PostgreSQL database.
    
    This script:
    1. Discovers all categories from the BuyMe website
    2. Scrapes suppliers (businesses) for each category
    3. Upserts CardProducts (categories) in the database
    4. Upserts Stores (suppliers) in the database
    5. Links them via CardProductStore
    6. Removes outdated links for suppliers no longer listed
    """
    
    ISSUER_ID = 'buyme'  # Must match your DB issuer ID
    
    def __init__(self):
        self.base_url = "https://buyme.co.il"
        self.driver = None
        self.conn = None
        
    def connect_db(self):
        """Connect to PostgreSQL database."""
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL environment variable is not set")
        self.conn = psycopg2.connect(DATABASE_URL)
        logger.info("Connected to database")
        
    def close_db(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")
        
    def setup_driver(self):
        """Setup Selenium WebDriver with Chrome in headless mode."""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.driver.implicitly_wait(10)
        logger.info("Chrome WebDriver initialized")
        
    def close_driver(self):
        """Close the WebDriver."""
        if self.driver:
            self.driver.quit()
            logger.info("WebDriver closed")
    
    def discover_categories(self) -> Dict[str, str]:
        """
        Discover all gift card categories from BuyMe website.
        
        Returns:
            Dictionary mapping category names to their URLs
        """
        logger.info(f"Discovering categories from {self.base_url}")
        
        try:
            self.driver.get(self.base_url)
            time.sleep(3)
            
            categories = {}
            
            # Find all category links - BuyMe has categories in navigation
            category_links = self.driver.find_elements(By.CSS_SELECTOR, 'a[href*="/categories/"]')
            
            for link in category_links:
                try:
                    name = link.text.strip()
                    url = link.get_attribute('href')
                    
                    if name and url and '/categories/' in url:
                        if name not in categories:
                            categories[name] = url
                            logger.info(f"Found category: {name}")
                except Exception:
                    continue
            
            logger.info(f"Discovered {len(categories)} categories")
            return categories
            
        except Exception as e:
            logger.error(f"Error discovering categories: {e}")
            return {}
    
    def scrape_suppliers_from_category(self, category_url: str) -> Set[str]:
        """
        Scrape suppliers/businesses from a category page.
        
        Args:
            category_url: URL of the category page
            
        Returns:
            Set of business/supplier names
        """
        logger.info(f"Scraping suppliers from {category_url}")
        
        try:
            self.driver.get(category_url)
            time.sleep(3)
            
            # Scroll to load lazy content
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
            suppliers = set()
            
            # BuyMe shows suppliers as cards/tiles with links
            supplier_elements = self.driver.find_elements(By.CSS_SELECTOR, 'a[href*="/supplier/"]')
            
            for element in supplier_elements:
                try:
                    supplier_name = None
                    
                    # Try getting alt text from images first
                    imgs = element.find_elements(By.TAG_NAME, 'img')
                    for img in imgs:
                        alt = img.get_attribute('alt')
                        if alt and alt.strip():
                            supplier_name = alt.strip()
                            break
                    
                    # Fallback to text content
                    if not supplier_name:
                        text = element.text.strip()
                        if text and len(text) < 100:
                            supplier_name = text
                    
                    # Extract from URL as last resort
                    if not supplier_name:
                        supplier_url = element.get_attribute('href')
                        if supplier_url:
                            supplier_id = supplier_url.split('/supplier/')[-1].split('/')[0]
                            supplier_name = f"Supplier_{supplier_id}"
                    
                    if supplier_name:
                        suppliers.add(supplier_name)
                        
                except Exception:
                    continue
            
            # Also look for supplier names in card elements
            cards = self.driver.find_elements(By.CSS_SELECTOR, '[class*="supplier"], [class*="card"], [class*="business"]')
            for card in cards:
                try:
                    headings = card.find_elements(By.CSS_SELECTOR, 'h1, h2, h3, h4, h5, h6, .title, .name')
                    for heading in headings:
                        name = heading.text.strip()
                        if name and len(name) < 100:
                            suppliers.add(name)
                except Exception:
                    continue
            
            logger.info(f"Found {len(suppliers)} suppliers")
            return suppliers
            
        except Exception as e:
            logger.error(f"Error scraping category {category_url}: {e}")
            return set()

    def ensure_issuer_exists(self):
        """Ensure the BuyMe issuer exists in the database."""
        cursor = self.conn.cursor()
        try:
            cursor.execute("""
                INSERT INTO issuers (id, name, website_url, logo_url)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (self.ISSUER_ID, 'Buyme', 'https://buyme.co.il/', 'https://buyme.co.il/logo.png'))
            self.conn.commit()
            logger.info(f"Ensured issuer '{self.ISSUER_ID}' exists")
        finally:
            cursor.close()

    def sync_to_database(self, scraped_data: Dict):
        """
        Sync scraped data to PostgreSQL database.
        
        - Upserts CardProducts (categories)
        - Upserts Stores (suppliers)  
        - Creates CardProductStore links
        - Removes outdated links
        """
        cursor = self.conn.cursor()
        
        try:
            for category_name, category_info in scraped_data['categories'].items():
                category_url = category_info['url']
                suppliers = category_info['suppliers']
                
                # 1. Upsert CardProduct (category)
                card_product_id = str(uuid.uuid4())
                cursor.execute("""
                    INSERT INTO card_products (id, issuer_id, name, source_url, last_verified_at)
                    VALUES (%s, %s, %s, %s, NOW())
                    ON CONFLICT (issuer_id, name) 
                    DO UPDATE SET source_url = EXCLUDED.source_url, last_verified_at = NOW()
                    RETURNING id
                """, (card_product_id, self.ISSUER_ID, category_name, category_url))
                
                result = cursor.fetchone()
                card_product_id = result[0] if result else card_product_id
                
                logger.info(f"Synced CardProduct: {category_name} ({card_product_id})")
                
                active_store_ids = []
                
                # 2. Upsert Stores and link them
                for supplier_name in suppliers:
                    # Find existing store (case-insensitive)
                    cursor.execute("""
                        SELECT id FROM stores WHERE LOWER(name) = LOWER(%s)
                    """, (supplier_name,))
                    
                    store_result = cursor.fetchone()
                    
                    if store_result:
                        store_id = store_result[0]
                    else:
                        # Create new store
                        store_id = str(uuid.uuid4())
                        cursor.execute("""
                            INSERT INTO stores (id, name)
                            VALUES (%s, %s)
                        """, (store_id, supplier_name))
                        logger.info(f"  + Created new store: {supplier_name}")
                    
                    active_store_ids.append(store_id)
                    
                    # Link store to card product
                    cursor.execute("""
                        INSERT INTO card_product_stores (card_product_id, store_id, type)
                        VALUES (%s, %s, 'both')
                        ON CONFLICT (card_product_id, store_id) DO NOTHING
                    """, (card_product_id, store_id))
                
                # 3. Remove old links (suppliers no longer listed)
                if active_store_ids:
                    cursor.execute("""
                        DELETE FROM card_product_stores 
                        WHERE card_product_id = %s AND store_id != ALL(%s)
                    """, (card_product_id, active_store_ids))
                    deleted = cursor.rowcount
                    if deleted > 0:
                        logger.info(f"  - Removed {deleted} outdated store links from {category_name}")
                else:
                    # No stores found, remove all links for this product
                    cursor.execute("""
                        DELETE FROM card_product_stores WHERE card_product_id = %s
                    """, (card_product_id,))
            
            self.conn.commit()
            logger.info("Database sync complete!")
            
        except Exception as e:
            self.conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            cursor.close()

    def run(self):
        """Run the complete scraping and database sync process."""
        logger.info("=" * 70)
        logger.info("Starting BuyMe DB Syncer...")
        logger.info("=" * 70)
        
        try:
            self.setup_driver()
            self.connect_db()
            
            # Ensure issuer exists
            self.ensure_issuer_exists()
            
            # Discover categories
            categories = self.discover_categories()
            if not categories:
                logger.error("No categories found! The website structure may have changed.")
                return
            
            scraped_data = {'categories': {}}
            
            for category_name, category_url in categories.items():
                logger.info(f"Processing category: {category_name}")
                suppliers = self.scrape_suppliers_from_category(category_url)
                scraped_data['categories'][category_name] = {
                    'url': category_url,
                    'suppliers': sorted(list(suppliers))
                }
                time.sleep(2)  # Politeness delay
            
            # Sync to database
            self.sync_to_database(scraped_data)
            
            # Summary
            total_suppliers = sum(len(cat['suppliers']) for cat in scraped_data['categories'].values())
            logger.info("=" * 70)
            logger.info("SUMMARY:")
            logger.info(f"  Total categories: {len(scraped_data['categories'])}")
            logger.info(f"  Total suppliers: {total_suppliers}")
            logger.info("=" * 70)
            
        except Exception as e:
            logger.error(f"Error during sync: {e}")
            import traceback
            traceback.print_exc()
            raise
        finally:
            self.close_driver()
            self.close_db()


if __name__ == "__main__":
    syncer = BuyMeDBSyncer()
    syncer.run()
