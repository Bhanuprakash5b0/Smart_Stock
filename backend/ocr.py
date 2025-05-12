# %%
import re
import easyocr
from PIL import Image
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

# Pattern to match actual dates and relative expiry formats
# Remove suffix like 'st', 'nd', 'rd', 'th'
def clean_date_string(date_str):
    # Remove suffixes like 'st', 'nd', etc.
    date_str = re.sub(r'(\d{1,2})(st|nd|rd|th)', r'\1', date_str.strip(), flags=re.IGNORECASE)

    # Remove extra spaces around separators
    date_str = re.sub(r'\s*([\/\-\.\s])\s*', r'\1', date_str)

    # Collapse multiple spaces into one
    date_str = re.sub(r'\s+', ' ', date_str)

    return date_str.strip()

# Try multiple known formats
def parse_date(date_str):
    date_str = clean_date_string(date_str)

    possible_formats = [
        "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", "%d %m %Y",
        "%d/%m/%y", "%d-%m-%y", "%d.%m.%y", "%d %m %y",
        "%d %b %Y", "%d %B %Y", "%b %d %Y", "%B %d %Y",
        "%d %b, %Y", "%d %B, %Y", "%b %d, %Y", "%B %d, %Y","%Y/%m/%d",
        "%Y-%m-%d", "%Y.%m.%d", "%Y %m %d","%d/%m/%y", "%d-%m-%y", "%d.%m.%y", "%d %m %y",
        "%y/%d/%m","%y-%d-%m","%y.%d.%m","%y %d %m"
    ]

    for fmt in possible_formats:
        try:
            parsed = datetime.strptime(date_str, fmt)
            if '%y' in fmt and parsed.year < 100:
              parsed = parsed.replace(year=parsed.year + 2000)
            return parsed.date()
        except ValueError:
            continue

    raise ValueError(f"Could not parse date from '{date_str}'")


def get_expiry_date(text, man_date_str):
    exp_date_pattern = r"""\b(
        \d{1,2}\s*(?:\/|\-|\.|\s)\s*\d{1,2}\s*(?:\/|\-|\.|\s)\s*\d{2,4} |
        \d{1,2}(?:st|nd|rd|th)?\s*(?:of\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|
        May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|
        Nov(?:ember)?|Dec(?:ember)?)\s+\d{2,4} |
        (?:best\s+before|use\s+before)?\s*(\d{1,2})\s*(days?|months?|years?)
    )\b"""

    matches = re.findall(exp_date_pattern, text, re.IGNORECASE | re.VERBOSE)

    for match in matches:
        full_match = match[0]
        num = match[1]
        unit = match[2]

        # Try to parse absolute dates
        for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", "%d %m %Y"):
            try:
                exp_date = datetime.strptime(full_match.strip(), fmt)
                return exp_date.strftime("%Y-%m-%d")
            except:
                continue

        # Try to parse relative durations (e.g., "12 months", "15 days")
        if num and unit:
            num = int(num)
            unit = unit.lower()

            if "day" in unit:
                exp_date = man_date + timedelta(days=num)
            elif "month" in unit:
                exp_date = man_date + relativedelta(months=num)
            elif "year" in unit:
                exp_date = man_date + relativedelta(years=num)
            else:
                continue

            return exp_date.strftime("%Y-%m-%d")

    return None  # No matching date found

# Initialize reader
reader = easyocr.Reader(['en'])  # English only

def extract_item_info(image_path_name,image_path_label):
    result = reader.readtext(image_path_label, detail=0)
    print("Raw OCR Output:", result)

    product_name = ""
    mfg_date = ""
    exp_date = ""

    # Merge text
    text = " ".join(result)
    print(text)
    man_date_pattern = r"\b(\d{1,2}\s*(?:\/|\-|\.|\s)\s*\d{1,2}\s*(?:\/|\-|\.|\s)\s*\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s*(?:of\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{2,4})\b"
    matches = re.findall(man_date_pattern, text, re.IGNORECASE)

    name=''
    name=extract_item_name(image_path_name).strip()

    manu_date = matches[0] if len(matches) > 0 else ''
    mfd = clean_date_string(manu_date)
    expiry = matches[1] if len(matches) > 1 else ''
    exp = clean_date_string(expiry)
    if manu_date and expiry!=None:
      try:
          mfd_date = parse_date(manu_date)
          expd_date = parse_date(expiry)

          if mfd_date < expd_date:
              return {
                  'product_name': name,
                  'mfg_date': mfd_date.strftime('%Y-%m-%d'),
                  'exp_date': expd_date.strftime('%Y-%m-%d')
              }
      except Exception as e:
          print(f"Date comparison failed: {e}")

    mfg_date = parse_date(manu_date)

    if expiry and not ((manu_date < datetime.strptime(expiry, '%d/%m/%Y').date()) or manu_date < datetime.strptime(expiry, '%d-%m-%Y').date()):
      exp_date = get_expiry_date(text,mfg_date)

    # exp_date = matches[1] if len(matches) > 1 else ''

    # exp_date_ptrn_2=r"\b([A-Z][a-zA-Z]{2,}[a-zA-Z]*[aeiouAEIOU][a-zA-Z]*)\b"
    # if(exp_date==''):
    #   exp_date=re.findall(exp_date_ptrn_2,text,re.IGNORECASE)
    #regex 4
    # mfg_match = re.search(r"(MFG|Manufacture Date)[:\s\-]*([\d\/\-\.]+)", text, re.IGNORECASE)
    # exp_match = re.search(r"(EXP|Expiry Date|Best Before)[:\s\-]*([\d\/\-\.]+)", text, re.IGNORECASE)

    # if mfg_match:
    #     mfg_date = mfg_match.group(2)
    # if exp_match:
    #     exp_date = exp_match.group(2)

    # if len(result) > 0:
    #     product_name = result[0]
    if not exp_date and mfg_date:
      exp_date = mfg_date + relativedelta(months=2)
    return {
    'product_name': name,
    'mfg_date': mfg_date.strftime('%Y-%m-%d') if mfg_date else None,
    'exp_date': exp_date.strftime('%Y-%m-%d') if exp_date else None
}



# %%
def extract_item_name(path):
    result = reader.readtext(path, detail=0)
    text = " ".join(result)  # Join list into one string for regex

    name_patterns = [
        r"\b([A-Z][a-zA-Z]{2,}[a-zA-Z]*[aeiouAEIOU][a-zA-Z]*)\b",
        r"^\s*([A-Z][a-zA-Z0-9\s\-&,]{3,})"
    ]

    matches = []
    for pattern in name_patterns:
        matches += re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)

    str1 = ''
    if matches:
        combined = ' '.join(match.strip() for match in matches)
        str1 = combined[:15]  # First 10 characters only

    return str1


# %%
# info = extract_item_info("bourbon-biscuit-500x500-front.webp","britannia-bourbon-biscuit-500x500 - Copy.webp")
# print(info)


