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
        
    def _get_expected_store_count(self) -> int:
        """
        Extract the expected store count from the page.
        BuyMe shows this in: <span class="brands-page__results-count"><span>61</span> בתי עסק</span>
        """
        try:
            # Try the specific BuyMe selector
            count_element = self.driver.find_element(By.CSS_SELECTOR, '.brands-page__results-count span')
            count_text = count_element.text.strip()
            return int(count_text)
        except Exception:
            pass
        
        try:
            # Alternative: look for text containing "בתי עסק"
            elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'בתי עסק')]")
            for el in elements:
                text = el.text.strip()
                # Extract number from text like "61 בתי עסק"
                match = re.search(r'(\d+)\s*בתי עסק', text)
                if match:
                    return int(match.group(1))
        except Exception:
            pass
        
        # Default: unknown count
        return 0
    
    def _is_valid_store_name(self, name: str) -> bool:
        """
        Check if a name is a valid store name (not a category, UI element, etc.)
        """
        if not name or len(name) < 2 or len(name) > 80:
            return False
        
        name_lower = name.lower().strip()
        
        # Skip if starts with Buyme (it's a product, not a store)
        if name_lower.startswith('buyme'):
            return False
        
        # Skip category names (Hebrew)
        categories = {
            'תינוקות וילדים', 'לבית', 'תרבות ופנאי', 'לגוף ולנפש',
            'סדנאות והעשרה', 'מלונות ונופש', 'חוויות', 'ספא וימי כיף',
            'מסעדות וקולינריה', 'מחבקים מילואימניקים', 'חדש על המדף',
            'אופנה', 'יופי וטיפוח', 'טכנולוגיה', 'ספורט', 'לילדים',
            'מתנות', 'גיפט קארד', 'הכל', 'הצג הכל', 'עוד',
            'מסעדות', 'קולינריה', 'בתי קפה', 'ברים',
        }
        if name_lower in categories or name in categories:
            return False
        
        # Skip UI elements
        ui_elements = {
            'חיפוש', 'search', 'חזרה', 'back', 'הבא', 'next', 'קודם', 'prev',
            'סגור', 'close', 'פתח', 'open', 'שתף', 'share', 'menu', 'תפריט',
            'מימוש אונליין', 'אזור', 'סנן', 'filter', 'area', 'location',
            'הוראות מימוש', 'תנאי שימוש', 'מדיניות פרטיות', 'צור קשר',
            'בתי עסק מכבדים', 'בתי עסק', 'איפה אפשר לממש',
            'logo', 'icon', 'image', 'photo', 'arrow', 'chevron',
        }
        if name_lower in ui_elements or name in ui_elements:
            return False
        
        # Skip if it's just numbers or prices
        if re.match(r'^[\d₪\s\.,\-]+$', name):
            return False
        
        # Skip URLs
        if name.startswith('http') or name.startswith('www.'):
            return False
        
        return True
    
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
        Uses the page's store count to verify completeness.
        """
        logger.info(f"Scraping stores from {product_url}")
        
        raw_stores = set()
        
        try:
            self.driver.get(product_url)
            time.sleep(4)
            
            # Get expected store count from the page
            expected_count = self._get_expected_store_count()
            logger.info(f"  Expected stores: {expected_count}")
            
            # Smart scrolling: scroll until we've loaded all stores
            scroll_attempts = 0
            max_scroll_attempts = min(expected_count // 5 + 20, 150) if expected_count > 0 else 50
            last_height = 0
            
            logger.info(f"  Scrolling to load all {expected_count} stores...")
            
            while scroll_attempts < max_scroll_attempts:
                # Scroll down
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1.2)
                
                # Get new scroll height
                new_height = self.driver.execute_script("return document.body.scrollHeight")
                
                # Check if we've reached the bottom
                if new_height == last_height:
                    time.sleep(0.5)
                    self.driver.execute_script("window.scrollBy(0, 300);")
                    time.sleep(0.8)
                    final_height = self.driver.execute_script("return document.body.scrollHeight")
                    if final_height == new_height:
                        logger.info(f"  Finished scrolling after {scroll_attempts} scrolls")
                        break
                
                last_height = new_height
                scroll_attempts += 1
                
                # Log progress every 20 scrolls
                if scroll_attempts % 20 == 0:
                    logger.info(f"  Scroll {scroll_attempts}/{max_scroll_attempts}...")
            
            # Ensure all content is rendered
            self.driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(0.5)
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(1)
            
            # FOCUSED METHOD: Only look for store links in the main content area
            # Stores on BuyMe are shown as links to /supplier/ pages with images
            # We need to be VERY selective to avoid capturing UI elements
            
            # Get the current product's supplier ID to exclude it
            current_supplier_id = product_url.split('/supplier/')[-1].split('?')[0] if '/supplier/' in product_url else ''
            current_brand_id = product_url.split('/brands/')[-1].split('?')[0] if '/brands/' in product_url else ''
            
            # Method 1: Look for supplier links that are NOT the current product
            try:
                supplier_links = self.driver.find_elements(By.CSS_SELECTOR, 'a[href*="/supplier/"]')
                for link in supplier_links:
                    try:
                        href = link.get_attribute('href') or ''
                        
                        # Skip if this is the current product
                        if current_supplier_id and current_supplier_id in href:
                            continue
                        
                        # Skip navigation/header links (usually have specific classes)
                        parent_classes = link.get_attribute('class') or ''
                        if any(x in parent_classes.lower() for x in ['nav', 'header', 'menu', 'footer']):
                            continue
                        
                        # Get store name from image alt (most reliable)
                        store_name = None
                        imgs = link.find_elements(By.TAG_NAME, 'img')
                        for img in imgs:
                            alt = img.get_attribute('alt')
                            if alt and alt.strip():
                                store_name = alt.strip()
                                break
                        
                        # Validate the store name
                        if store_name and self._is_valid_store_name(store_name):
                            raw_stores.add(store_name)
                            
                    except Exception:
                        continue
            except Exception:
                pass
            
            # Method 2: Look for brand links (alternative URL pattern)
            try:
                brand_links = self.driver.find_elements(By.CSS_SELECTOR, 'a[href*="/brands/"]')
                for link in brand_links:
                    try:
                        href = link.get_attribute('href') or ''
                        
                        # Skip if this is the current product
                        if current_brand_id and current_brand_id in href:
                            continue
                        
                        # Get store name from image alt
                        store_name = None
                        imgs = link.find_elements(By.TAG_NAME, 'img')
                        for img in imgs:
                            alt = img.get_attribute('alt')
                            if alt and alt.strip():
                                store_name = alt.strip()
                                break
                        
                        if store_name and self._is_valid_store_name(store_name):
                            raw_stores.add(store_name)
                            
                    except Exception:
                        continue
            except Exception:
                pass
            
            # Deduplicate using normalized names
            seen_normalized = set()
            clean_stores = set()
            
            for store in raw_stores:
                clean = self.get_display_name(store)
                normalized = self.normalize_store_name(clean)
                
                # Skip duplicates
                if normalized in seen_normalized:
                    continue
                
                # Double-check validity (in case something slipped through)
                if not self._is_valid_store_name(clean):
                    continue
                
                seen_normalized.add(normalized)
                clean_stores.add(clean)
            
            # Validate against expected count
            actual_count = len(clean_stores)
            if expected_count > 0:
                accuracy = (actual_count / expected_count) * 100
                if accuracy >= 90:
                    logger.info(f"  ✓ Found {actual_count}/{expected_count} stores ({accuracy:.0f}%)")
                elif accuracy >= 70:
                    logger.warning(f"  ⚠ Found {actual_count}/{expected_count} stores ({accuracy:.0f}%) - some may be missing")
                else:
                    logger.warning(f"  ✗ Found only {actual_count}/{expected_count} stores ({accuracy:.0f}%) - check scraping logic")
            else:
                logger.info(f"  Found {actual_count} stores (expected count unknown)")
            
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
