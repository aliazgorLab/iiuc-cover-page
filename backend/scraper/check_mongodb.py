import os
import sys
import ssl
from pathlib import Path
from dotenv import load_dotenv
import pymongo

# Fix Windows cp1252 stdout encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
else:
    load_dotenv()

# Configure PyMongo DNS resolver to use Google/Cloudflare public DNS
try:
    import dns.resolver
    resolver = dns.resolver.Resolver(configure=False)
    resolver.nameservers = ['8.8.8.8', '8.8.4.4', '1.1.1.1']
    dns.resolver.default_resolver = resolver
    print("✓ Set PyMongo DNS resolver to Google (8.8.8.8, 8.8.4.4) & Cloudflare (1.1.1.1)")
except Exception as e:
    print(f"DNS config note: {e}")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/iiuc_cover_page")

# Ensure database name 'iiuc_cover_page' is explicitly appended if missing in URI
if "cluster0" in MONGO_URI and "iiuc_cover_page" not in MONGO_URI:
    # Insert /iiuc_cover_page before ?appName=
    if "/?" in MONGO_URI:
        TARGET_URI = MONGO_URI.replace("/?", "/iiuc_cover_page?")
    else:
        TARGET_URI = MONGO_URI + "/iiuc_cover_page"
else:
    TARGET_URI = MONGO_URI

masked_uri = TARGET_URI.replace(TARGET_URI.split("@")[0].split("//")[-1], "****") if "@" in TARGET_URI else TARGET_URI

print("=" * 60)
print("🔍 MONGODB CONNECTION & DIAGNOSTIC CHECKLIST")
print("=" * 60)
print(f"Target MONGO_URI: {masked_uri}")

client = None
db = None

# Attempt 1: Direct local connection to port 27017
try:
    print("\nAttempting connection to Local MongoDB (127.0.0.1:27017)...")
    client = pymongo.MongoClient("mongodb://127.0.0.1:27017/iiuc_cover_page", serverSelectionTimeoutMS=2000)
    client.admin.command('ping')
    print("✓ SUCCESS: Connected to Local MongoDB on port 27017!")
except Exception as e_local:
    print(f"⚠ Local Mongo note: {e_local}")
    # Attempt 2: Try Atlas with tlsAllowInvalidCertificates=True
    try:
        print("Attempting connection to MongoDB Atlas (tlsAllowInvalidCertificates=True)...")
        client = pymongo.MongoClient(
            TARGET_URI,
            tls=True,
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=3000
        )
        client.admin.command('ping')
        print("✓ SUCCESS: Connected to MongoDB Atlas via PyMongo!")
    except Exception as e1:
        print(f"⚠ Atlas Attempt Failed: {e1}")
    # Attempt 2: Connect with ssl_cert_reqs = ssl.CERT_NONE
    try:
        print("Attempting connection to MongoDB Atlas with ssl.CERT_NONE...")
        client = pymongo.MongoClient(
            MONGO_URI,
            ssl=True,
            ssl_cert_reqs=ssl.CERT_NONE,
            serverSelectionTimeoutMS=5000
        )
        client.admin.command('ping')
        print("✓ SUCCESS: Connected to MongoDB Atlas with ssl.CERT_NONE!")
    except Exception as e2:
        print(f"⚠ Attempt 2 Failed: {e2}")
        # Attempt 3: Local MongoDB
        try:
            print("Attempting local MongoDB connection (127.0.0.1:27017)...")
            client = pymongo.MongoClient("mongodb://127.0.0.1:27017/iiuc_cover_page", serverSelectionTimeoutMS=3000)
            client.admin.command('ping')
            print("✓ SUCCESS: Connected to local MongoDB!")
        except Exception as e3:
            print(f"❌ Attempt 3 Failed: {e3}")
            sys.exit(1)

if client:
    # Determine DB Name
    # Parse DB name from MONGO_URI e.g. /iiuc_cover_page?
    db_name = "iiuc_cover_page"
    if "/" in MONGO_URI.split("?")[0]:
        parsed_db = MONGO_URI.split("?")[0].split("/")[-1]
        if parsed_db:
            db_name = parsed_db

    db = client[db_name]
    print(f"\nConnected Database: {db_name}")
    print(f"MongoDB Host: {client.address}")

    # List all collections
    collections = db.list_collection_names()
    print(f"\nExisting Collections in '{db_name}': {collections}")

    # Check 'teachers' collection
    teachers_coll = db["teachers"]
    count = teachers_coll.count_documents({})
    print(f"Collection: teachers -> Current Document Count: {count}")

    # Check case-sensitive or alternate collection names
    for col in collections:
        if col != "teachers" and "teacher" in col.lower():
            alt_count = db[col].count_documents({})
            print(f"⚠ Alternate Collection Found: '{col}' -> Count: {alt_count}")

    print("=" * 60)
