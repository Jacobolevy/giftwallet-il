# buyme_db_sync.py
# Scrapes BuyMe gift card products (starting with "Buyme") and their accepted stores
# Syncs directly to PostgreSQL

import os
import json
import time
import uuid
import logging
import re
from datetime import datetime
from typing import Dict, List, Set, Tuple
import psycopg2
from psycopg2.extras import execute_values
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Database connection from environment variable
DATABASE_URL = os.environ.get('DATABASE_URL')


class BuyMeDBSyncer:
    """
    Scrapes BuyMe.co.il for gift card products that start with "Buyme"
    (e.g., Buyme Chef, Buyme Fashion, Buyme Digital, etc.)
    and their accepted stores, then syncs to PostgreSQL.
    
    This script:
    1. Finds all gift card products (suppliers) starting with "Buyme"
    2. For each Buyme product, scrapes the stores where it can be redeemed
    3. Upserts CardProducts (Buyme gift cards) in the database
    4. Upserts Stores (businesses) in the database
    5. Links them via CardProductStore
    6. Removes outdated links for stores no longer listed
    """
    
    ISSUER_ID = 'buyme'  # Must match your DB issuer ID
    BUYME_PREFIX = 'buyme'  # Filter products starting with this (case-insensitive)
    
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
    
    def discover_buyme_products(self) -> Dict[str, str]:
        """
        Discover all gift card products starting with "Buyme" from BuyMe website.
        
        Returns:
            Dictionary mapping product names to their URLs
        """
        logger.info(f"Discovering Buyme products from {self.base_url}")
        
        buyme_products = {}
        
        try:
            # Try multiple pages to find Buyme products
            pages_to_check = [
                self.base_url,
                f"{self.base_url}/search",
                f"{self.base_url}/categories/גיפט%20קארד",
                f"{self.base_url}/categories/הצג%20הכל",
            ]
            
            for page_url in pages_to_check:
                logger.info(f"Checking page: {page_url}")
                try:
                    self.driver.get(page_url)
                    time.sleep(3)
                    
                    # Scroll to load all content
                    for _ in range(3):
                        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                        time.sleep(1)
                    
                    # Find all supplier links
                    supplier_links = self.driver.find_elements(By.CSS_SELECTOR, 'a[href*="/supplier/"]')
                    
                    for link in supplier_links:
                        try:
                            # Get supplier name from various sources
                            supplier_name = None
                            supplier_url = link.get_attribute('href')
                            
                            # Try image alt text
                            imgs = link.find_elements(By.TAG_NAME, 'img')
                            for img in imgs:
                                alt = img.get_attribute('alt')
                                if alt and alt.strip():
                                    supplier_name = alt.strip()
                                    break
                            
                            # Try link text
                            if not supplier_name:
                                text = link.text.strip()
                                if text and len(text) < 100:
                                    supplier_name = text
                            
                            # Check if it starts with "Buyme" (case-insensitive)
                            if supplier_name and supplier_name.lower().startswith(self.BUYME_PREFIX):
                                if supplier_name not in buyme_products:
                                    buyme_products[supplier_name] = supplier_url
                                    logger.info(f"Found Buyme product: {supplier_name}")
                                    
                        except Exception:
                            continue
                            
                except Exception as e:
                    logger.warning(f"Error checking page {page_url}: {e}")
                    continue
            
            logger.info(f"Discovered {len(buyme_products)} Buyme products")
            return buyme_products
            
        except Exception as e:
            logger.error(f"Error discovering Buyme products: {e}")
            return {}
    
    def scrape_stores_from_product(self, product_url: str) -> Set[str]:
        """
        Scrape stores/businesses where a Buyme product can be redeemed.
        
        Args:
            product_url: URL of the Buyme product page
            
        Returns:
            Set of store names where the product can be used
        """
        logger.info(f"Scraping stores from {product_url}")
        
        stores = set()
        
        try:
            self.driver.get(product_url)
            time.sleep(3)
            
            # Scroll to load all content
            for _ in range(3):
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1)
            
            # Look for store/business names in various elements
            # BuyMe typically shows "איפה אפשר לממש" (Where can you redeem)
            
            # Method 1: Look for specific sections about redemption locations
            redemption_selectors = [
                '[class*="redeem"]',
                '[class*="location"]',
                '[class*="store"]',
                '[class*="branch"]',
                '[class*="business"]',
                '[class*="partner"]',
            ]
            
            for selector in redemption_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    for element in elements:
                        text = element.text.strip()
                        if text and len(text) < 100 and not text.lower().startswith('buyme'):
                            stores.add(text)
                except Exception:
                    continue
            
            # Method 2: Look for lists of businesses
            try:
                list_items = self.driver.find_elements(By.CSS_SELECTOR, 'ul li, ol li')
                for item in list_items:
                    text = item.text.strip()
                    # Filter out navigation items, prices, etc.
                    if (text and 
                        len(text) < 80 and 
                        len(text) > 2 and
                        not text.lower().startswith('buyme') and
                        not re.match(r'^[\d₪\s\.,]+$', text) and  # Not just numbers/prices
                        not text.startswith('http')):
                        stores.add(text)
            except Exception:
                pass
            
            # Method 3: Look for headings that might be store names
            try:
                headings = self.driver.find_elements(By.CSS_SELECTOR, 'h3, h4, h5, h6')
                for heading in headings:
                    text = heading.text.strip()
                    if (text and 
                        len(text) < 60 and 
                        len(text) > 2 and
                        not text.lower().startswith('buyme')):
                        stores.add(text)
            except Exception:
                pass
            
            # Method 4: Look for links to external store websites
            try:
                external_links = self.driver.find_elements(By.CSS_SELECTOR, 'a[target="_blank"]')
                for link in external_links:
                    text = link.text.strip()
                    if (text and 
                        len(text) < 60 and 
                        len(text) > 2 and
                        not text.lower().startswith('buyme') and
                        not text.startswith('http')):
                        stores.add(text)
            except Exception:
                pass
            
            # Clean up stores - remove common non-store items
            non_stores = {
                'חזרה', 'הבא', 'קודם', 'סגור', 'פתח', 'הוסף', 'קנה',
                'שתף', 'share', 'close', 'next', 'prev', 'back',
                'תנאי שימוש', 'מדיניות פרטיות', 'צור קשר', 'אודות',
                'terms', 'privacy', 'contact', 'about',
            }
            stores = {s for s in stores if s.lower() not in non_stores}
            
            logger.info(f"Found {len(stores)} stores")
            return stores
            
        except Exception as e:
            logger.error(f"Error scraping product {product_url}: {e}")
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
        
        - Upserts CardProducts (Buyme gift cards)
        - Upserts Stores (businesses)  
        - Creates CardProductStore links
        - Removes outdated links
        """
        cursor = self.conn.cursor()
        
        try:
            for product_name, product_info in scraped_data['products'].items():
                product_url = product_info['url']
                stores = product_info['stores']
                
                # 1. Upsert CardProduct (Buyme gift card)
                card_product_id = str(uuid.uuid4())
                cursor.execute("""
                    INSERT INTO card_products (id, issuer_id, name, source_url, last_verified_at)
                    VALUES (%s, %s, %s, %s, NOW())
                    ON CONFLICT (issuer_id, name) 
                    DO UPDATE SET source_url = EXCLUDED.source_url, last_verified_at = NOW()
                    RETURNING id
                """, (card_product_id, self.ISSUER_ID, product_name, product_url))
                
                result = cursor.fetchone()
                card_product_id = result[0] if result else card_product_id
                
                logger.info(f"Synced CardProduct: {product_name} ({card_product_id})")
                
                active_store_ids = []
                
                # 2. Upsert Stores and link them
                for store_name in stores:
                    # Find existing store (case-insensitive)
                    cursor.execute("""
                        SELECT id FROM stores WHERE LOWER(name) = LOWER(%s)
                    """, (store_name,))
                    
                    store_result = cursor.fetchone()
                    
                    if store_result:
                        store_id = store_result[0]
                    else:
                        # Create new store
                        store_id = str(uuid.uuid4())
                        cursor.execute("""
                            INSERT INTO stores (id, name)
                            VALUES (%s, %s)
                        """, (store_id, store_name))
                        logger.info(f"  + Created new store: {store_name}")
                    
                    active_store_ids.append(store_id)
                    
                    # Link store to card product
                    cursor.execute("""
                        INSERT INTO card_product_stores (card_product_id, store_id, type)
                        VALUES (%s, %s, 'both')
                        ON CONFLICT (card_product_id, store_id) DO NOTHING
                    """, (card_product_id, store_id))
                
                # 3. Remove old links (stores no longer listed)
                if active_store_ids:
                    cursor.execute("""
                        DELETE FROM card_product_stores 
                        WHERE card_product_id = %s AND store_id != ALL(%s)
                    """, (card_product_id, active_store_ids))
                    deleted = cursor.rowcount
                    if deleted > 0:
                        logger.info(f"  - Removed {deleted} outdated store links from {product_name}")
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
        logger.info("Starting BuyMe DB Syncer (Buyme Products Only)...")
        logger.info("=" * 70)
        
        try:
            self.setup_driver()
            self.connect_db()
            
            # Ensure issuer exists
            self.ensure_issuer_exists()
            
            # Discover Buyme products
            buyme_products = self.discover_buyme_products()
            if not buyme_products:
                logger.warning("No Buyme products found! Trying alternative approach...")
                # Fallback: manually define known Buyme products
                buyme_products = self.get_known_buyme_products()
            
            if not buyme_products:
                logger.error("No Buyme products found! The website structure may have changed.")
                return
            
            scraped_data = {'products': {}}
            
            for product_name, product_url in buyme_products.items():
                logger.info(f"Processing product: {product_name}")
                stores = self.scrape_stores_from_product(product_url)
                scraped_data['products'][product_name] = {
                    'url': product_url,
                    'stores': sorted(list(stores))
                }
                time.sleep(2)  # Politeness delay
            
            # Sync to database
            self.sync_to_database(scraped_data)
            
            # Summary
            total_stores = sum(len(prod['stores']) for prod in scraped_data['products'].values())
            logger.info("=" * 70)
            logger.info("SUMMARY:")
            logger.info(f"  Total Buyme products: {len(scraped_data['products'])}")
            logger.info(f"  Total stores: {total_stores}")
            for product_name, product_info in scraped_data['products'].items():
                logger.info(f"    - {product_name}: {len(product_info['stores'])} stores")
            logger.info("=" * 70)
            
        except Exception as e:
            logger.error(f"Error during sync: {e}")
            import traceback
            traceback.print_exc()
            raise
        finally:
            self.close_driver()
            self.close_db()
    
    def get_known_buyme_products(self) -> Dict[str, str]:
        """
        Fallback method: Return known Buyme product URLs.
        Update this list as new Buyme products are discovered.
        """
        logger.info("Using known Buyme products as fallback...")
        
        # These are typical Buyme gift card products
        known_products = {
            "Buyme": f"{self.base_url}/supplier/buyme",
            "Buyme Chef": f"{self.base_url}/supplier/buyme-chef",
            "Buyme Fashion": f"{self.base_url}/supplier/buyme-fashion", 
            "Buyme Beauty": f"{self.base_url}/supplier/buyme-beauty",
            "Buyme Digital": f"{self.base_url}/supplier/buyme-digital",
            "Buyme Home": f"{self.base_url}/supplier/buyme-home",
            "Buyme Kids": f"{self.base_url}/supplier/buyme-kids",
            "Buyme Experience": f"{self.base_url}/supplier/buyme-experience",
        }
        
        # Verify which URLs actually exist
        valid_products = {}
        for name, url in known_products.items():
            try:
                self.driver.get(url)
                time.sleep(2)
                # Check if page loaded successfully (not a 404)
                if "404" not in self.driver.title.lower() and "not found" not in self.driver.page_source.lower():
                    valid_products[name] = url
                    logger.info(f"Verified Buyme product: {name}")
            except Exception:
                continue
        
        return valid_products


if __name__ == "__main__":
    syncer = BuyMeDBSyncer()
    syncer.run()
