import re
from datetime import datetime, timezone
import pymongo
from config import MONGO_URI, DB_NAME

_client = None
_db = None
_collection = None
_attempted = False
_in_memory_fallback = {}

def get_db():
    global _client, _db, _attempted
    if _attempted:
        return _db

    _attempted = True
    print(f"Connecting PyMongo to MongoDB Atlas ({DB_NAME})...")

    try:
        _client = pymongo.MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            tlsAllowInvalidCertificates=True
        )
        _client.admin.command('ping')
        _db = _client[DB_NAME]
        print(f"✓ PyMongo connected to MongoDB Atlas ({DB_NAME}) successfully.")
        return _db
    except Exception as e:
        print(f"❌ MongoDB Atlas Connection Error: {e}")
        _db = None
        raise e

def get_teachers_collection():
    global _collection
    if _collection is not None:
        return _collection

    db = get_db()
    if db is not None:
        _collection = db["teachers"]
        return _collection
    return None

DEPARTMENT_MAP = {
    "CSE": "Dept. of CSE, IIUC",
    "Computer Science and Engineering": "Dept. of CSE, IIUC",
    "Dept. of CSE": "Dept. of CSE, IIUC",
    "EEE": "Dept. of EEE, IIUC",
    "Electrical and Electronic Engineering": "Dept. of EEE, IIUC",
    "Dept. of EEE": "Dept. of EEE, IIUC",
    "CCE": "Dept. of CCE, IIUC",
    "Computer and Communication Engineering": "Dept. of CCE, IIUC",
    "Dept. of CCE": "Dept. of CCE, IIUC",
    "CE": "Dept. of CE, IIUC",
    "Civil Engineering": "Dept. of CE, IIUC",
    "Dept. of CE": "Dept. of CE, IIUC",
    "ETE": "Dept. of ETE, IIUC",
    "Electronics and Telecommunication Engineering": "Dept. of ETE, IIUC",
    "Dept. of ETE": "Dept. of ETE, IIUC",
    "ELL": "Dept. of ELL, IIUC",
    "English Language and Literature": "Dept. of ELL, IIUC",
    "Dept. of ELL": "Dept. of ELL, IIUC",
    "LAW": "Dept. of Law, IIUC",
    "Law": "Dept. of Law, IIUC",
    "Dept. of Law": "Dept. of Law, IIUC",
    "Pharmacy": "Dept. of Pharmacy, IIUC",
    "CGED": "Dept. of CGED, IIUC",
    "BBA": "Dept. of Business Administration, IIUC",
    "Business Administration": "Dept. of Business Administration, IIUC",
    "Finance": "Dept. of Finance and Banking, IIUC",
    "Finance and Banking": "Dept. of Finance and Banking, IIUC",
    "Economics and Banking": "Dept. of Economics and Banking, IIUC",
    "EB": "Dept. of Economics and Banking, IIUC",
    "QSIS": "Dept. of QSIS, IIUC",
    "Quranic Sciences and Islamic Studies": "Dept. of QSIS, IIUC",
    "DIS": "Dept. of DIS, IIUC",
    "Dawah and Islamic Studies": "Dept. of DIS, IIUC",
    "SHIS": "Dept. of SHIS, IIUC",
    "Sciences of Hadith & Islamic Studies": "Dept. of SHIS, IIUC",
    "ALL": "Dept. of Arabic Language and Literature, IIUC",
    "Arabic Language and Literature": "Dept. of Arabic Language and Literature, IIUC",
}

def normalize_department(dept_str):
    if not dept_str:
        return "Dept. of CSE, IIUC"
    trimmed = dept_str.strip()
    if trimmed in DEPARTMENT_MAP:
        return DEPARTMENT_MAP[trimmed]
    lower = trimmed.lower()
    for k, v in DEPARTMENT_MAP.items():
        if k.lower() == lower:
            return v
    if "computer science" in lower or "cse" in lower:
        return "Dept. of CSE, IIUC"
    if "electrical" in lower or "eee" in lower:
        return "Dept. of EEE, IIUC"
    if "communication" in lower or "cce" in lower:
        return "Dept. of CCE, IIUC"
    if "civil" in lower or lower == "ce":
        return "Dept. of CE, IIUC"
    if "telecommunication" in lower or "ete" in lower:
        return "Dept. of ETE, IIUC"
    if "english" in lower or "ell" in lower:
        return "Dept. of ELL, IIUC"
    if "law" in lower:
        return "Dept. of Law, IIUC"
    if "pharmacy" in lower:
        return "Dept. of Pharmacy, IIUC"
    if "cged" in lower:
        return "Dept. of CGED, IIUC"
    if "business" in lower or "bba" in lower:
        return "Dept. of Business Administration, IIUC"
    if "finance" in lower:
        return "Dept. of Finance and Banking, IIUC"
    if "economics" in lower or "eb" in lower:
        return "Dept. of Economics and Banking, IIUC"
    if "quranic" in lower or "qsis" in lower:
        return "Dept. of QSIS, IIUC"
    if "dawah" in lower or "dis" in lower:
        return "Dept. of DIS, IIUC"
    if "hadith" in lower or "shis" in lower:
        return "Dept. of SHIS, IIUC"
    if "arabic" in lower or lower == "all":
        return "Dept. of Arabic Language and Literature, IIUC"
    if not trimmed.endswith(", IIUC"):
        return f"{trimmed}, IIUC" if trimmed.startswith("Dept. of") else f"Dept. of {trimmed}, IIUC"
    return trimmed

def upsert_teacher(teacher_data):
    collection = get_teachers_collection()
    name = teacher_data.get("name", "").strip()
    raw_dept = teacher_data.get("department", "").strip()
    department = normalize_department(raw_dept)

    if not name or not department:
        return ("failed", "Missing required name or department")

    now = datetime.now(timezone.utc)
    doc_payload = {
        "name": name,
        "designation": teacher_data.get("designation", "Faculty Member").strip(),
        "department": department,
        "faculty": teacher_data.get("faculty", "FSE").strip(),
        "email": teacher_data.get("email", "").strip().lower(),
        "avatar": teacher_data.get("avatar", "").strip(),
        "profileImage": teacher_data.get("avatar", "").strip(),
        "sourceUrl": teacher_data.get("sourceUrl", "").strip(),
        "source": "IIUC Website",
        "updatedAt": now,
    }

    if collection is not None:
        try:
            # Case-insensitive search on name + department
            query = {
                "name": {"$regex": f"^{re.escape(name)}$", "$options": "i"},
                "department": department,
            }
            existing = collection.find_one(query)

            if existing:
                collection.update_one({"_id": existing["_id"]}, {"$set": doc_payload})
                return ("updated", str(existing["_id"]))
            else:
                doc_payload["createdAt"] = now
                doc_payload["status"] = "ACTIVE"
                res = collection.insert_one(doc_payload)
                return ("inserted", str(res.inserted_id))
        except Exception as err:
            print(f"  ✗ MongoDB Upsert Error for {name}: {err}")
            return ("failed", str(err))
    else:
        # Resilient in-memory storage mode if DB is disconnected
        key = f"{name.lower()}::{department.lower()}"
        if key in _in_memory_fallback:
            _in_memory_fallback[key].update(doc_payload)
            return ("updated", key)
        else:
            doc_payload["createdAt"] = now
            doc_payload["status"] = "ACTIVE"
            _in_memory_fallback[key] = doc_payload
            return ("inserted", key)

def get_teacher_count():
    collection = get_teachers_collection()
    if collection is not None:
        try:
            return collection.count_documents({})
        except Exception:
            return len(_in_memory_fallback)
    return len(_in_memory_fallback)

def save_import_log(log_data):
    db = get_db()
    if db is not None:
        try:
            log_coll = db["teacherimportlogs"]
            log_data["date"] = datetime.now(timezone.utc)
            log_coll.insert_one(log_data)
            print("✓ Import log saved to MongoDB 'teacherimportlogs' collection.")
        except Exception as e:
            print(f"⚠ Could not save import log: {e}")

