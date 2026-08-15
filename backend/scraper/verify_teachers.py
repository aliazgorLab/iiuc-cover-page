import sys
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

SCRAPER_DIR = Path(__file__).resolve().parent
if str(SCRAPER_DIR) not in sys.path:
    sys.path.insert(0, str(SCRAPER_DIR))

from mongo import get_db, get_teachers_collection

def verify_teachers():
    print("=" * 60)
    print("🔍 VERIFYING PHYSICAL MONGODB TEACHERS DATA")
    print("=" * 60)

    db = get_db()
    coll = get_teachers_collection()

    if coll is None:
        print("❌ Database collection unavailable.")
        sys.exit(1)

    count = coll.count_documents({})
    host_addr = db.client.address if hasattr(db, 'client') and db.client else '127.0.0.1:27017'
    print(f"MongoDB Host:       {host_addr}")
    print(f"Connected Database: {db.name}")
    print(f"Collection:         teachers")
    print(f"Document Count:     {count}\n")

    if count == 0:
        print("⚠ Collection is empty. Run scraper pipeline to populate teachers.")
        return

    teachers = list(coll.find().limit(5))
    print(f"--- First 5 Teachers Sample ---")
    for idx, t in enumerate(teachers, 1):
        print(f"\n{idx}.")
        print(f"Name:        {t.get('name')}")
        print(f"Department:  {t.get('department')}")
        print(f"Designation: {t.get('designation')}")
        print(f"Faculty:     {t.get('faculty', 'FSE')}")
        print(f"Email:       {t.get('email', 'N/A')}")
        print(f"ID:          {t.get('_id')}")

    print("=" * 60)
    print("✅ VERIFICATION COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    verify_teachers()
