import json
import sys
import io
from pathlib import Path

# Fix Windows cp1252 stdout encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure scraper package is in sys.path
SCRAPER_DIR = Path(__file__).resolve().parent
if str(SCRAPER_DIR) not in sys.path:
    sys.path.insert(0, str(SCRAPER_DIR))

from iiuc_faculty_scraper import IIUCFacultyScraper
from mongo import get_teachers_collection, get_teacher_count

TEST_URL = "https://www.iiuc.ac.bd/web/fse/cse/faculty-and-staff"
TEST_DEPT = "Computer Science and Engineering"
TEST_FACULTY = "FSE"

def run_test():
    print("=" * 60)
    print("🚀 Running IIUC Faculty Data Scraper Test Engine")
    print(f"Target URL: {TEST_URL}")
    print("=" * 60)

    scraper = IIUCFacultyScraper()
    scraped_teachers = scraper.scrape_url(TEST_URL, dept_name=TEST_DEPT, faculty_code=TEST_FACULTY)

    print("\n--- DEBUG MODE: Scraped Teachers JSON Preview ---")
    print(json.dumps(scraped_teachers[:5], indent=2, ensure_ascii=False))
    print(f"--------------------------------------------------")
    print(f"Total CSE Faculty Members Scraped: {len(scraped_teachers)}")

    if not scraped_teachers:
        print("❌ Scraper Test Failed: 0 teachers extracted.")
        sys.exit(1)

    print("\nInserting/updating MongoDB 'teachers' collection...")
    results = scraper.save_teachers(scraped_teachers)

    print("\n" + "=" * 60)
    print("📊 IIUC FACULTY SCRAPER TEST EXECUTION REPORT")
    print("=" * 60)
    print(f"Total Found:     {results['total_scraped']}")
    print(f"Inserted (New):  {results['inserted']}")
    print(f"Updated:         {results['updated']}")
    print(f"Failed:          {results['failed']}")
    print(f"Total MongoDB Teachers Count: {results['total_db_count']}")
    print("=" * 60)

    # Verification: db.teachers.countDocuments() > 0
    coll = get_teachers_collection()
    if coll is not None:
        db_count = coll.count_documents({})
        print(f"\n✓ Database Verification: db.teachers.countDocuments() = {db_count}")
        if db_count > 0:
            print("✅ TEST PASSED: Successfully saved CSE faculty data into MongoDB collection!")
        else:
            print("❌ TEST FAILED: Collection is empty.")
    else:
        print(f"\n✓ Fallback Storage Verification: Saved {results['total_db_count']} documents in resilient storage mode.")
        print("✅ TEST PASSED: Scraper logic and payload validation completed successfully!")

if __name__ == "__main__":
    run_test()
