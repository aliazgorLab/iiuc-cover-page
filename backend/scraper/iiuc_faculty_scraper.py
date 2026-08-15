import re
import requests
from bs4 import BeautifulSoup
from mongo import upsert_teacher, get_teacher_count

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

class IIUCFacultyScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def scrape_url(self, url, dept_name="Computer Science and Engineering", faculty_code="FSE"):
        teachers = []
        try:
            print(f"fetching URL: {url}...")
            response = self.session.get(url, timeout=15)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, "html.parser")

            # Look for card containers, table rows, or profile elements
            card_containers = soup.find_all(
                ["div", "tr"],
                class_=lambda c: c and any(cls in c for cls in ["rounded-3xl", "shadow-lg", "card", "bg-white"]),
            )

            if not card_containers:
                # Fallback to all div containers or tr rows
                card_containers = soup.find_all(["div", "tr"])

            seen_names = set()

            for container in card_containers:
                name = None

                # Extract Name from font-bold text, h3, h4, or img alt
                name_elem = container.find(class_=lambda c: c and "font-bold" in c and "text-black" in c)
                if name_elem:
                    name = name_elem.get_text(strip=True)

                if not name:
                    h_elem = container.find(["h3", "h4", "h5"])
                    if h_elem:
                        name = h_elem.get_text(strip=True)

                if not name:
                    img_elem = container.find("img", alt=True)
                    if img_elem:
                        alt_val = img_elem["alt"].strip()
                        if alt_val and not any(k in alt_val.lower() for k in ["logo", "pattern", "banner", "vector"]):
                            name = alt_val

                if not name or len(name) < 3:
                    continue

                # Filter out generic titles or page headers
                name_lower = name.lower()
                if any(header_word in name_lower for header_word in ["search", "faculty member", "home", "international", "chittagong"]):
                    continue

                if name_lower in seen_names:
                    continue

                seen_names.add(name_lower)

                # Extract Designation
                designation = None
                desig_elem = container.find(class_=lambda c: c and "text-xs" in c and "text-gray-600" in c)
                if desig_elem:
                    designation = desig_elem.get_text(strip=True)

                if not designation or len(designation) > 80:
                    text_content = container.get_text()
                    if "Professor" in text_content:
                        designation = "Professor"
                    elif "Associate Professor" in text_content:
                        designation = "Associate Professor"
                    elif "Assistant Professor" in text_content:
                        designation = "Assistant Professor"
                    elif "Lecturer" in text_content:
                        designation = "Lecturer"
                    else:
                        designation = "Faculty Member"

                # Extract Email
                email = ""
                mailto_link = container.find("a", href=re.compile(r"^mailto:", re.I))
                if mailto_link:
                    email = mailto_link["href"].replace("mailto:", "").strip().lower()
                else:
                    text = container.get_text()
                    email_match = re.search(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b", text)
                    if email_match:
                        email = email_match.group(0).lower()

                # Extract Avatar / Profile Image
                avatar = ""
                img_tag = container.find("img", src=True)
                if img_tag:
                    src = img_tag["src"].strip()
                    if not any(k in src.lower() for k in ["vector", "pattern", "logo", "backpattern"]):
                        if src.startswith("http"):
                            avatar = src
                        elif src.startswith("/"):
                            avatar = f"https://www.iiuc.ac.bd{src}"

                teachers.append({
                    "name": name,
                    "designation": designation,
                    "department": dept_name,
                    "faculty": faculty_code,
                    "email": email,
                    "avatar": avatar,
                    "sourceUrl": url,
                    "source": "IIUC Website",
                })

        except Exception as e:
            print(f"✗ Scraper Error fetching {url}: {e}")

        return teachers

    def save_teachers(self, teachers_data):
        inserted = 0
        updated = 0
        failed = 0

        for t_data in teachers_data:
            status, _id = upsert_teacher(t_data)
            if status == "inserted":
                inserted += 1
            elif status == "updated":
                updated += 1
            else:
                failed += 1

        total_in_db = get_teacher_count()

        return {
            "total_scraped": len(teachers_data),
            "inserted": inserted,
            "updated": updated,
            "failed": failed,
            "total_db_count": total_in_db,
        }
