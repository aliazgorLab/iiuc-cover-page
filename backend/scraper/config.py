import os
from pathlib import Path
from dotenv import load_dotenv

# Find backend/.env file
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
else:
    load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/iiuc_cover_page")
DB_NAME = "iiuc_cover_page"

FACULTY_SOURCES = [
    {
        "url": "https://www.iiuc.ac.bd/web/fse/cse/faculty-and-staff",
        "key": "cse",
        "dept": "Dept. of CSE, IIUC",
        "faculty": "FSE",
    },
    {
        "url": "https://www.iiuc.ac.bd/web/fse/cce/faculty-and-staff",
        "key": "cce",
        "dept": "Dept. of CCE, IIUC",
        "faculty": "FSE",
    },
    {
        "url": "https://www.iiuc.ac.bd/web/fse/eee/faculty-and-staff",
        "key": "eee",
        "dept": "Dept. of EEE, IIUC",
        "faculty": "FSE",
    },
    {
        "url": "https://www.iiuc.ac.bd/web/fse/ete/faculty-and-staff",
        "key": "ete",
        "dept": "Dept. of ETE, IIUC",
        "faculty": "FSE",
    },
    {
        "url": "https://www.iiuc.ac.bd/web/fse/ce/faculty-and-staff",
        "key": "ce",
        "dept": "Dept. of CE, IIUC",
        "faculty": "FSE",
    },
    {
        "url": "https://www.iiuc.ac.bd/web/fbs/bba/faculty-and-staff",
        "key": "bba",
        "dept": "Dept. of Business Administration, IIUC",
        "faculty": "FBS",
    },
    {
        "url": "https://www.iiuc.ac.bd/web/fbs/finance",
        "key": "finance",
        "dept": "Dept. of Finance and Banking, IIUC",
        "faculty": "FBS",
    },
    {
        "url": "https://www.iiuc.ac.bd/web/flaw/law/faculty-and-staff",
        "key": "law",
        "dept": "Dept. of Law, IIUC",
        "faculty": "FLAW",
    },
    {
        "url": "https://www.iiuc.ac.bd/web/fae/ell/faculty-and-staff",
        "key": "ell",
        "dept": "Dept. of ELL, IIUC",
        "faculty": "FAE",
    },
    {
        "url": "https://www.iiuc.ac.bd/web/fae/all/faculty-and-staff",
        "key": "all",
        "dept": "Dept. of Arabic Language and Literature, IIUC",
        "faculty": "FAE",
    },
    {
        "url": "https://www.iiuc.ac.bd/web/fsis/qsis/faculty-and-staff",
        "key": "qsis",
        "dept": "Dept. of QSIS, IIUC",
        "faculty": "FSIS",
    },
    {
        "url": "https://www.iiuc.ac.bd/web/fsis/dis/faculty-and-staff",
        "key": "dis",
        "dept": "Dept. of DIS, IIUC",
        "faculty": "FSIS",
    },
    {
        "url": "https://www.iiuc.ac.bd/web/fsis/shis/faculty-and-staff",
        "key": "shis",
        "dept": "Dept. of SHIS, IIUC",
        "faculty": "FSIS",
    },
    {
        "url": "https://www.iiuc.ac.bd/web/fss/eb/faculty-and-staff",
        "key": "eb",
        "dept": "Dept. of Economics and Banking, IIUC",
        "faculty": "FSS",
    },
]
