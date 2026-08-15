import json
import sys
from pathlib import Path

# Fix Windows cp1252 stdout encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

SCRAPER_DIR = Path(__file__).resolve().parent
if str(SCRAPER_DIR) not in sys.path:
    sys.path.insert(0, str(SCRAPER_DIR))

from config import FACULTY_SOURCES
from iiuc_faculty_scraper import IIUCFacultyScraper
from mongo import get_teachers_collection, get_teacher_count, save_import_log

def main():
    print("=" * 60)
    print("🚀 Starting Institutional IIUC Faculty Data Scraper Pipeline")
    print(f"Targeting {len(FACULTY_SOURCES)} Official Department URLs")
    print("=" * 60)

    scraper = IIUCFacultyScraper()
    department_logs = []
    failed_urls = []

    total_scraped_sum = 0
    total_inserted_sum = 0
    total_updated_sum = 0

    for idx, source in enumerate(FACULTY_SOURCES, 1):
        key = source["key"].upper()
        dept = source["dept"]
        faculty = source["faculty"]
        url = source["url"]

        print(f"\n[{idx}/{len(FACULTY_SOURCES)}] Scraping {key} ({dept})...")
        print(f"    URL: {url}")

        try:
            scraped = scraper.scrape_url(url, dept_name=dept, faculty_code=faculty)
            if not scraped:
                print(f"    ⚠ Warning: 0 faculty members found for {key}.")
                failed_urls.append(url)
                dept_res = {"key": key, "department": dept, "found": 0, "inserted": 0, "updated": 0, "failed": 0}
            else:
                save_res = scraper.save_teachers(scraped)
                dept_res = {
                    "key": key,
                    "department": dept,
                    "found": save_res["total_scraped"],
                    "inserted": save_res["inserted"],
                    "updated": save_res["updated"],
                    "failed": save_res["failed"]
                }
                total_scraped_sum += save_res["total_scraped"]
                total_inserted_sum += save_res["inserted"]
                total_updated_sum += save_res["updated"]

            department_logs.append(dept_res)
            print(f"    ✓ {key} Results -> Scraped: {dept_res['found']}, Inserted: {dept_res['inserted']}, Updated: {dept_res['updated']}")

        except Exception as err:
            print(f"    ✗ Error scraping {key}: {err}")
            failed_urls.append(url)
            department_logs.append({"key": key, "department": dept, "found": 0, "inserted": 0, "updated": 0, "failed": 1})

    # Printed Final Summary Report
    print("\n" + "=" * 60)
    print("=========================================")
    print("IIUC FACULTY IMPORT REPORT")
    print("=========================================")

    for log_item in department_logs:
        print(f"\n{log_item['key']}:")
        print(f"  Found: {log_item['found']}")
        print(f"  Inserted: {log_item['inserted']}")
        print(f"  Updated: {log_item['updated']}")

    print("\n" + "-" * 45)
    print(f"Total Teachers Scraped:  {total_scraped_sum}")
    print(f"Total Inserted (New):   {total_inserted_sum}")
    print(f"Total Updated:          {total_updated_sum}")
    print(f"Failed URLs:            {len(failed_urls)}")
    if failed_urls:
        for furl in failed_urls:
            print(f"  - {furl}")
    print("=========================================")

    # Save to TeacherImportLog collection
    import_log_document = {
        "totalImported": total_inserted_sum,
        "totalUpdated": total_updated_sum,
        "totalScraped": total_scraped_sum,
        "departments": department_logs,
        "failedUrls": failed_urls
    }
    save_import_log(import_log_document)

    # MongoDB Verification
    coll = get_teachers_collection()
    if coll is not None:
        final_count = coll.count_documents({})
        print(f"\n✓ MongoDB Verification: db.teachers.countDocuments() = {final_count}")
    else:
        final_count = get_teacher_count()
        print(f"\n✓ Storage Verification: Total count in system = {final_count}")

    print("=" * 60)
    print("✅ FACULTY SCRAPER PIPELINE EXECUTION COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
