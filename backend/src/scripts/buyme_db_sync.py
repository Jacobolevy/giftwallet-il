# buyme_db_sync.py
# Scrapes BuyMe gift card products (starting with "Buyme") and their accepted stores
# Syncs directly to PostgreSQL with deduplication

import os
import json
import time
import uuid
import logging
import re
import unicodedata
from datetime import datetime
from typing import Dict, List, Set, Tuple, Optional
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
    
    Features:
    - Deduplication: Stores are normalized and matched to avoid duplicates
    - Case-insensitive matching for store names
    - Shared stores across multiple Buyme products are linked correctly
    """
    
    ISSUER_ID = 'buyme'  # Must match your DB issuer ID
    BUYME_PREFIX = 'buyme'  # Filter products starting with this (case-insensitive)
    
    def __init__(self):
        self.base_url = "https://buyme.co.il"
        self.driver = None
        self.conn = None
        # Cache for store names -> store IDs (to avoid duplicate DB queries)
        self.store_cache: Dict[str, str] = {}  # normalized_name -> store_id
        
    def normalize_store_name(self, name: str) -> str:
        """
        Normalize store name for comparison and deduplication.
        - Lowercase
        - Remove extra whitespace
        - Remove special characters
        - Normalize unicode characters
        """
        if not name:
            return ""
        
        # Normalize unicode (e.g., different types of spaces, dashes)
        name = unicodedata.normalize('NFKC', name)
        
        # Lowercase
        name = name.lower()
        
        # Remove extra whitespace
        name = ' '.join(name.split())
        
        # Remove common suffixes/prefixes that might vary
        name = name.strip()
        
        return name
    
    def get_display_name(self, name: str) -> str:
        """
        Get a clean display name for a store.
        Keeps proper capitalization but cleans up whitespace.
        """
        if not name:
            return ""
        
        # Normalize unicode
        name = unicodedata.normalize('NFKC', name)
        
        # Remove extra whitespace
        name = ' '.join(name.split())
        
        return name.strip()
        
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
    
    def load_existing_stores(self):
        """
        Load all existing stores from database into cache.
        This allows us to match stores across different Buyme products.
        """
        cursor = self.conn.cursor()
        try:
            cursor.execute("SELECT id, name FROM stores")
            for store_id, name in cursor.fetchall():
                normalized = self.normalize_store_name(name)
                self.store_cache[normalized] = store_id
            logger.info(f"Loaded {len(self.store_cache)} existing stores into cache")
        finally:
            cursor.close()
    
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
                                # Normalize the product name for consistency
                                clean_name = self.get_display_name(supplier_name)
                                normalized = self.normalize_store_name(clean_name)
                                
                                # Avoid duplicate products
                                if normalized not in [self.normalize_store_name(k) for k in buyme_products.keys()]:
                                    buyme_products[clean_name] = supplier_url
                                    logger.info(f"Found Buyme product: {clean_name}")
                                    
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
        Returns normalized, deduplicated store names.
        Handles lazy loading by scrolling until no new content loads.
        """
        logger.info(f"Scraping stores from {product_url}")
        
        raw_stores = set()
        
        try:
            self.driver.get(product_url)
            time.sleep(4)
            
            # Aggressive scrolling to load ALL stores (handles lazy loading)
            # Keep scrolling until no new content is loaded
            last_height = 0
            scroll_attempts = 0
            max_scroll_attempts = 100  # Safety limit for pages with 1000+ items
            
            logger.info("  Scrolling to load all stores (lazy loading)...")
            
            while scroll_attempts < max_scroll_attempts:
                # Scroll down
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1.5)  # Wait for content to load
                
                # Get new scroll height
                new_height = self.driver.execute_script("return document.body.scrollHeight")
                
                # Check if we've reached the bottom
                if new_height == last_height:
                    # Try scrolling a bit more to trigger any remaining lazy loads
                    self.driver.execute_script("window.scrollBy(0, 500);")
                    time.sleep(1)
                    final_height = self.driver.execute_script("return document.body.scrollHeight")
                    if final_height == new_height:
                        logger.info(f"  Finished scrolling after {scroll_attempts} scrolls")
                        break
                
                last_height = new_height
                scroll_attempts += 1
                
                # Log progress every 10 scrolls
                if scroll_attempts % 10 == 0:
                    # Count current stores found
                    current_count = len(self.driver.find_elements(By.CSS_SELECTOR, 'a[href*="/supplier/"], [class*="store"], [class*="business"], [class*="brand"]'))
                    logger.info(f"  Scroll {scroll_attempts}: found ~{current_count} elements so far...")
            
            # Scroll back to top and then down again to ensure all content is rendered
            self.driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(1)
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
            # Method 1: Look for supplier/brand links (most reliable for BuyMe)
            try:
                supplier_links = self.driver.find_elements(By.CSS_SELECTOR, 'a[href*="/supplier/"]')
                for link in supplier_links:
                    try:
                        # Get name from image alt
                        imgs = link.find_elements(By.TAG_NAME, 'img')
                        for img in imgs:
                            alt = img.get_attribute('alt')
                            if alt and alt.strip() and not alt.lower().startswith('buyme'):
                                raw_stores.add(alt.strip())
                        
                        # Get name from link text
                        text = link.text.strip()
                        if text and len(text) < 100 and not text.lower().startswith('buyme'):
                            # Split multi-line text and take first meaningful line
                            lines = [l.strip() for l in text.split('\n') if l.strip()]
                            for line in lines:
                                if len(line) > 2 and len(line) < 80 and not line.lower().startswith('buyme'):
                                    raw_stores.add(line)
                    except Exception:
                        continue
            except Exception:
                pass
            
            # Method 2: Look for brand links
            try:
                brand_links = self.driver.find_elements(By.CSS_SELECTOR, 'a[href*="/brands/"]')
                for link in brand_links:
                    try:
                        imgs = link.find_elements(By.TAG_NAME, 'img')
                        for img in imgs:
                            alt = img.get_attribute('alt')
                            if alt and alt.strip() and not alt.lower().startswith('buyme'):
                                raw_stores.add(alt.strip())
                        
                        text = link.text.strip()
                        if text and len(text) < 100 and not text.lower().startswith('buyme'):
                            lines = [l.strip() for l in text.split('\n') if l.strip()]
                            for line in lines:
                                if len(line) > 2 and len(line) < 80 and not line.lower().startswith('buyme'):
                                    raw_stores.add(line)
                    except Exception:
                        continue
            except Exception:
                pass
            
            # Method 3: Look for card/tile elements with store info
            card_selectors = [
                '[class*="card"]',
                '[class*="tile"]',
                '[class*="item"]',
                '[class*="store"]',
                '[class*="business"]',
                '[class*="brand"]',
                '[class*="partner"]',
            ]
            
            for selector in card_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    for element in elements:
                        # Look for name in headings within the card
                        try:
                            headings = element.find_elements(By.CSS_SELECTOR, 'h1, h2, h3, h4, h5, h6, .title, .name')
                            for heading in headings:
                                text = heading.text.strip()
                                if text and len(text) > 2 and len(text) < 80 and not text.lower().startswith('buyme'):
                                    raw_stores.add(text)
                        except Exception:
                            pass
                        
                        # Look for name in image alt
                        try:
                            imgs = element.find_elements(By.TAG_NAME, 'img')
                            for img in imgs:
                                alt = img.get_attribute('alt')
                                if alt and alt.strip() and len(alt) > 2 and len(alt) < 80 and not alt.lower().startswith('buyme'):
                                    raw_stores.add(alt.strip())
                        except Exception:
                            pass
                except Exception:
                    continue
            
            # Method 4: Look for lists of businesses
            try:
                list_items = self.driver.find_elements(By.CSS_SELECTOR, 'ul li, ol li')
                for item in list_items:
                    text = item.text.strip()
                    if (text and 
                        len(text) < 80 and 
                        len(text) > 2 and
                        not text.lower().startswith('buyme') and
                        not re.match(r'^[\d₪\s\.,]+$', text) and
                        not text.startswith('http')):
                        raw_stores.add(text)
            except Exception:
                pass
            
            # Method 5: Look for any image with meaningful alt text (store logos)
            try:
                all_images = self.driver.find_elements(By.TAG_NAME, 'img')
                for img in all_images:
                    alt = img.get_attribute('alt')
                    if (alt and 
                        len(alt.strip()) > 2 and 
                        len(alt.strip()) < 80 and 
                        not alt.lower().startswith('buyme') and
                        not alt.lower() in ['logo', 'icon', 'image', 'photo']):
                        raw_stores.add(alt.strip())
            except Exception:
                pass
            
            # Clean up and deduplicate stores
            non_stores = {
                # Navigation
                'חזרה', 'הבא', 'קודם', 'סגור', 'פתח', 'הוסף', 'קנה', 'חיפוש',
                'שתף', 'share', 'close', 'next', 'prev', 'back', 'search',
                # Footer/Legal
                'תנאי שימוש', 'מדיניות פרטיות', 'צור קשר', 'אודות',
                'terms', 'privacy', 'contact', 'about', 'home', 'menu',
                # Page sections
                'איפה אפשר לממש', 'מידע נוסף', 'תיאור', 'פרטים',
                'הוראות מימוש בבית העסק', 'בתי עסק מכבדים',
                # Categories (from BuyMe)
                'תינוקות וילדים', 'לבית', 'תרבות ופנאי', 'לגוף ולנפש',
                'סדנאות והעשרה', 'מלונות ונופש', 'חוויות', 'ספא וימי כיף',
                'מסעדות וקולינריה', 'מחבקים מילואימניקים', 'חדש על המדף',
                'אופנה', 'יופי וטיפוח', 'טכנולוגיה', 'ספורט',
                # UI elements
                'מימוש אונליין', 'אזור', 'סנן', 'filter', 'area',
                'logo', 'icon', 'image', 'photo', 'arrow',
                # Generic
                'עוד', 'more', 'all', 'הכל', 'ראה עוד', 'see more',
            }
            
            # Deduplicate using normalized names
            seen_normalized = set()
            clean_stores = set()
            
            for store in raw_stores:
                clean = self.get_display_name(store)
                normalized = self.normalize_store_name(clean)
                
                # Skip non-store items and duplicates
                if normalized in non_stores or normalized in seen_normalized:
                    continue
                    
                # Skip very short or empty names
                if len(normalized) < 2:
                    continue
                
                seen_normalized.add(normalized)
                clean_stores.add(clean)
            
            logger.info(f"Found {len(clean_stores)} unique stores")
            return clean_stores
            
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

    def get_or_create_store(self, cursor, store_name: str) -> str:
        """
        Get existing store ID or create new store.
        Uses cache to avoid duplicates across different Buyme products.
        
        Returns:
            Store ID
        """
        clean_name = self.get_display_name(store_name)
        normalized = self.normalize_store_name(clean_name)
        
        # Check cache first
        if normalized in self.store_cache:
            return self.store_cache[normalized]
        
        # Check database (in case cache missed it)
        cursor.execute("""
            SELECT id, name FROM stores WHERE LOWER(TRIM(name)) = LOWER(TRIM(%s))
        """, (clean_name,))
        
        result = cursor.fetchone()
        
        if result:
            store_id = result[0]
            self.store_cache[normalized] = store_id
            return store_id
        
        # Also try normalized comparison
        cursor.execute("SELECT id, name FROM stores")
        for existing_id, existing_name in cursor.fetchall():
            if self.normalize_store_name(existing_name) == normalized:
                self.store_cache[normalized] = existing_id
                return existing_id
        
        # Create new store
        store_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO stores (id, name)
            VALUES (%s, %s)
        """, (store_id, clean_name))
        
        self.store_cache[normalized] = store_id
        logger.info(f"  + Created new store: {clean_name}")
        
        return store_id

    def sync_to_database(self, scraped_data: Dict):
        """
        Sync scraped data to PostgreSQL database.
        
        - Upserts CardProducts (Buyme gift cards)
        - Upserts Stores (businesses) with deduplication
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
                
                # 2. Get or create stores and link them
                for store_name in stores:
                    store_id = self.get_or_create_store(cursor, store_name)
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
            
            # Load existing stores into cache for deduplication
            self.load_existing_stores()
            
            # Ensure issuer exists
            self.ensure_issuer_exists()
            
            # Discover Buyme products
            buyme_products = self.discover_buyme_products()
            if not buyme_products:
                logger.warning("No Buyme products found! Trying alternative approach...")
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
            total_store_links = sum(len(prod['stores']) for prod in scraped_data['products'].values())
            unique_stores = len(self.store_cache)
            
            logger.info("=" * 70)
            logger.info("SUMMARY:")
            logger.info(f"  Total Buyme products: {len(scraped_data['products'])}")
            logger.info(f"  Unique stores in DB: {unique_stores}")
            logger.info(f"  Total store-product links: {total_store_links}")
            logger.info("")
            logger.info("  Products breakdown:")
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
        """
        logger.info("Using known Buyme products as fallback...")
        
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
        
        valid_products = {}
        for name, url in known_products.items():
            try:
                self.driver.get(url)
                time.sleep(2)
                if "404" not in self.driver.title.lower() and "not found" not in self.driver.page_source.lower():
                    valid_products[name] = url
                    logger.info(f"Verified Buyme product: {name}")
            except Exception:
                continue
        
        return valid_products


if __name__ == "__main__":
    syncer = BuyMeDBSyncer()
    syncer.run()
