from datetime import date


def validate_sa_id(id_number: str) -> dict:
    """Validate a South African ID number using the Luhn algorithm
    and extract demographic information.

    SA ID format: YYMMDD SSSS C A Z
    - YYMMDD: date of birth
    - SSSS: sequence number (0000-4999 = female, 5000-9999 = male)
    - C: citizenship (0 = SA citizen, 1 = permanent resident)
    - A: usually 8 (legacy)
    - Z: Luhn check digit
    """
    result = {
        "is_valid": False,
        "date_of_birth": None,
        "gender": None,
        "is_citizen": None,
        "error": None,
    }

    if not id_number or len(id_number) != 13 or not id_number.isdigit():
        result["error"] = "ID number must be exactly 13 digits"
        return result

    # Extract date of birth
    year = int(id_number[0:2])
    month = int(id_number[2:4])
    day = int(id_number[4:6])

    # Determine century: 00-24 = 2000s, 25-99 = 1900s
    current_year = date.today().year % 100
    if year <= current_year:
        full_year = 2000 + year
    else:
        full_year = 1900 + year

    try:
        dob = date(full_year, month, day)
        result["date_of_birth"] = dob
    except ValueError:
        result["error"] = "Invalid date of birth in ID number"
        return result

    # Gender from sequence number
    sequence = int(id_number[6:10])
    result["gender"] = "Male" if sequence >= 5000 else "Female"

    # Citizenship
    citizenship = int(id_number[10])
    result["is_citizen"] = citizenship == 0

    # Luhn check
    if not _luhn_check(id_number):
        result["error"] = "Luhn check digit invalid"
        return result

    result["is_valid"] = True
    return result


def _luhn_check(number: str) -> bool:
    """Verify the Luhn check digit."""
    digits = [int(d) for d in number]
    checksum = 0
    reverse_digits = digits[::-1]

    for i, d in enumerate(reverse_digits):
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        checksum += d

    return checksum % 10 == 0


def generate_valid_sa_id(
    year: int, month: int, day: int, gender: str, is_citizen: bool, sequence: int
) -> str:
    """Generate a valid SA ID number with a correct Luhn check digit."""
    yy = f"{year % 100:02d}"
    mm = f"{month:02d}"
    dd = f"{day:02d}"

    if gender.lower() == "male":
        seq = 5000 + sequence
    else:
        seq = sequence

    citizen_digit = "0" if is_citizen else "1"
    legacy_digit = "8"

    partial = f"{yy}{mm}{dd}{seq:04d}{citizen_digit}{legacy_digit}"

    # Calculate Luhn check digit
    check = _calculate_luhn_check(partial)
    return partial + str(check)


def _calculate_luhn_check(partial: str) -> int:
    """Calculate the Luhn check digit for a 12-digit partial ID."""
    digits = [int(d) for d in partial]
    # Process from right to left; the check digit position is index 12 (rightmost)
    # For a 12-digit partial, we double every second digit from the right of the
    # eventual 13-digit number. Position 12 is the check digit; positions 11,10,...,0
    # are the partial digits. We double positions at even distance from the right
    # (i.e. positions 11, 9, 7, 5, 3, 1 of the 13-digit number, which correspond
    # to indices 0, 2, 4, 6, 8, 10 of the 12-digit partial).
    total = 0
    for i, d in enumerate(reversed(digits)):
        if i % 2 == 0:
            d *= 2
            if d > 9:
                d -= 9
        total += d

    return (10 - (total % 10)) % 10
