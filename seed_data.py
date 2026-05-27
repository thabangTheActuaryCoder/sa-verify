"""
Seed data for SA Verify prototype.

Creates 25 mock citizens with Luhn-valid SA ID numbers,
8 companies, employment records, qualifications, burial society memberships,
user accounts, and deliberate fraud anomalies.

Run: python seed_data.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from datetime import date, datetime

from app.config import settings
from app.database import engine, SessionLocal, Base
from app.models.citizen import Citizen
from app.models.company import Company
from app.models.employment import Employment
from app.models.qualification import Qualification
from app.models.user import User
from app.models.verification import VerificationRequest, VerificationItem
from app.models.audit import AuditLog
from app.models.burial_society import BurialSocietyMembership
from app.models.criminal_record import CriminalRecord
from app.models.credit_record import CreditRecord
from app.models.drivers_licence import DriversLicence
from app.models.professional_registration import ProfessionalRegistration
from app.models.address import Address
from app.models.reference import Reference
from app.models.dispute import Dispute
from app.models.blocked_company import BlockedCompany
from app.models.notification import Notification
from app.models.document import Document
from app.services.auth_service import hash_password
from app.services.id_validator import generate_valid_sa_id

import json


def seed():
    # Create all tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # ---- COMPANIES ----
        companies_data = [
            ("Discovery Limited", "1999/007789/06", True, "Financial Services"),
            ("Standard Bank Group", "1969/017128/06", True, "Banking"),
            ("Vodacom Group", "1993/003367/06", True, "Telecommunications"),
            ("Takealot Online", "2002/015986/07", True, "E-Commerce"),
            ("Sasol Limited", "1979/003231/06", True, "Energy & Chemicals"),
            ("Capitec Bank", "1999/025903/06", True, "Banking"),
            ("Acme Consulting", "2015/098765/07", True, "Consulting"),
            ("Bogus Academy", "2020/000001/24", False, "Education"),  # Unregistered
        ]

        companies = {}
        for name, reg, registered, sector in companies_data:
            c = Company(
                name=name,
                registration_number=reg,
                is_registered=registered,
                sector=sector,
            )
            db.add(c)
            db.flush()
            companies[name] = c

        # ---- CITIZENS (25 with valid SA IDs) ----
        citizens_data = [
            # (year, month, day, gender, is_citizen, seq, first, last, is_alive, is_sassa)
            (1990, 3, 15, "Male", True, 1, "Thabo", "Mokoena", True, False),
            (1988, 7, 22, "Female", True, 1, "Naledi", "Dlamini", True, False),
            (1985, 11, 8, "Male", True, 2, "Sipho", "Nkosi", True, False),
            (1992, 1, 30, "Female", True, 2, "Lerato", "Mahlangu", True, False),
            (1978, 5, 14, "Male", True, 3, "Bongani", "Zulu", True, False),
            (1995, 9, 3, "Female", True, 3, "Thandiwe", "Ndlovu", True, False),
            (1983, 12, 25, "Male", True, 4, "Mandla", "Khumalo", True, False),
            (1991, 6, 17, "Female", True, 4, "Nomvula", "Maseko", True, False),
            (1987, 2, 9, "Male", True, 5, "Sibusiso", "Mthembu", True, False),
            (1994, 8, 28, "Female", True, 5, "Ayanda", "Cele", True, False),
            (1980, 4, 11, "Male", True, 6, "Vusi", "Shabalala", True, False),
            (1993, 10, 7, "Female", True, 6, "Zanele", "Ngcobo", True, False),
            (1986, 3, 20, "Male", True, 7, "Jabu", "Sithole", True, True),  # SASSA recipient - anomaly
            (1996, 7, 1, "Female", True, 7, "Palesa", "Molefe", True, False),
            (1982, 11, 16, "Male", True, 8, "Tshepo", "Langa", True, False),
            (1989, 5, 23, "Female", True, 8, "Mpho", "Botha", True, False),
            (1977, 9, 30, "Male", True, 9, "Sifiso", "Radebe", True, False),
            (1998, 1, 12, "Female", True, 9, "Lindiwe", "Mkhize", True, False),
            (1984, 6, 5, "Male", True, 10, "Nhlanhla", "Zwane", True, False),
            (1997, 12, 18, "Female", True, 10, "Thandi", "Vilakazi", True, False),
            (1981, 8, 7, "Male", True, 11, "Kagiso", "Motsepe", True, False),
            (1990, 2, 14, "Female", True, 11, "Dineo", "Tau", True, False),
            (1976, 10, 22, "Male", True, 12, "Phila", "Gumede", False, True),  # Deceased but SASSA still active
            (1999, 4, 9, "Female", True, 12, "Nosipho", "Majola", True, False),
            (1988, 6, 30, "Male", True, 13, "Lungelo", "Mabaso", True, True),  # SASSA recipient
        ]

        citizens = []
        for year, month, day, gender, is_citizen, seq, first, last, alive, sassa in citizens_data:
            id_number = generate_valid_sa_id(year, month, day, gender, is_citizen, seq)
            c = Citizen(
                id_number=id_number,
                first_name=first,
                last_name=last,
                date_of_birth=date(year, month, day),
                gender=gender,
                is_sa_citizen=is_citizen,
                is_alive=alive,
                is_sassa_recipient=sassa,
            )
            db.add(c)
            db.flush()
            citizens.append(c)

        # ---- EMPLOYMENTS ----
        employment_data = [
            # (citizen_idx, company_name, title, start, end, is_current, bracket)
            (0, "Discovery Limited", "Software Developer", date(2018, 3, 1), None, True, "R30k-R50k"),
            (1, "Standard Bank Group", "Data Analyst", date(2016, 7, 1), None, True, "R30k-R50k"),
            (2, "Vodacom Group", "Network Engineer", date(2012, 1, 15), date(2020, 6, 30), False, "R50k-R80k"),
            (2, "Sasol Limited", "Senior Engineer", date(2020, 8, 1), None, True, "R80k-R120k"),
            (3, "Takealot Online", "UX Designer", date(2019, 5, 1), None, True, "R20k-R30k"),
            (4, "Discovery Limited", "Actuarial Manager", date(2005, 1, 1), None, True, "R120k+"),
            (5, "Capitec Bank", "Teller", date(2021, 2, 1), None, True, "R10k-R20k"),
            (6, "Standard Bank Group", "Branch Manager", date(2010, 4, 1), None, True, "R50k-R80k"),
            (7, "Vodacom Group", "Marketing Coordinator", date(2017, 9, 1), None, True, "R20k-R30k"),
            (8, "Discovery Limited", "Claims Assessor", date(2015, 6, 1), date(2022, 12, 31), False, "R20k-R30k"),
            (9, "Takealot Online", "Logistics Manager", date(2020, 1, 15), None, True, "R30k-R50k"),
            (10, "Sasol Limited", "Chemical Engineer", date(2008, 3, 1), None, True, "R80k-R120k"),
            (11, "Capitec Bank", "Financial Adviser", date(2019, 11, 1), None, True, "R20k-R30k"),
            # Ghost employee anomaly: Jabu Sithole (idx 12) has 2 current jobs
            (12, "Discovery Limited", "IT Support", date(2019, 1, 1), None, True, "R80k-R120k"),
            (12, "Acme Consulting", "Consultant", date(2021, 6, 1), None, True, "R50k-R80k"),
            (13, "Standard Bank Group", "Graduate Trainee", date(2022, 1, 15), None, True, "R10k-R20k"),
            (14, "Vodacom Group", "Senior Developer", date(2010, 5, 1), None, True, "R50k-R80k"),
            (15, "Discovery Limited", "HR Officer", date(2016, 8, 1), None, True, "R30k-R50k"),
            (16, "Sasol Limited", "Plant Operator", date(2000, 2, 1), date(2018, 12, 31), False, "R30k-R50k"),
            (17, "Takealot Online", "Customer Service", date(2023, 3, 1), None, True, "R10k-R20k"),
            (18, "Capitec Bank", "IT Administrator", date(2014, 7, 1), None, True, "R30k-R50k"),
            (19, "Acme Consulting", "Junior Consultant", date(2022, 9, 1), None, True, "R20k-R30k"),
            (20, "Discovery Limited", "Underwriter", date(2009, 1, 1), None, True, "R50k-R80k"),
            (21, "Standard Bank Group", "Compliance Officer", date(2018, 4, 1), None, True, "R30k-R50k"),
            (22, "Vodacom Group", "Technical Director", date(2005, 10, 1), None, True, "R120k+"),
            (23, "Capitec Bank", "App Developer", date(2023, 6, 1), None, True, "R20k-R30k"),
            # Lungelo Mabaso (idx 24) - SASSA recipient with high salary (anomaly)
            (24, "Sasol Limited", "Process Technician", date(2017, 4, 1), None, True, "R80k-R120k"),
        ]

        for cit_idx, comp_name, title, start, end, current, bracket in employment_data:
            e = Employment(
                citizen_id=citizens[cit_idx].id,
                company_id=companies[comp_name].id,
                job_title=title,
                start_date=start,
                end_date=end,
                is_current=current,
                salary_bracket=bracket,
            )
            db.add(e)

        # ---- QUALIFICATIONS ----
        qual_data = [
            (0, "BSc", "Computer Science", "University of Pretoria", 2017, True),
            (1, "BCom", "Statistics", "University of the Witwatersrand", 2015, True),
            (2, "BEng", "Electrical Engineering", "University of Cape Town", 2011, True),
            (3, "BA", "Design", "University of Johannesburg", 2018, True),
            (4, "BSc Honours", "Actuarial Science", "University of Cape Town", 2003, True),
            (5, "National Diploma", "Banking", "Tshwane University of Technology", 2020, True),
            (6, "MBA", "Business Administration", "University of Stellenbosch", 2014, True),
            (7, "BCom", "Marketing", "University of KwaZulu-Natal", 2016, True),
            (9, "BTech", "Supply Chain Management", "Durban University of Technology", 2019, True),
            (10, "BEng", "Chemical Engineering", "North-West University", 2007, True),
            (11, "BCom", "Finance", "University of the Free State", 2018, True),
            # Fake qualification from unregistered institution
            (12, "MBA", "Business Administration", "Bogus Academy", 2020, False),
            (13, "BCom", "Accounting", "University of Pretoria", 2021, True),
            (14, "BSc Honours", "Computer Science", "University of Cape Town", 2009, True),
            (15, "BA", "Industrial Psychology", "University of Johannesburg", 2015, True),
            (18, "National Diploma", "IT", "Cape Peninsula University of Technology", 2013, True),
            (20, "BCom", "Risk Management", "University of the Witwatersrand", 2008, True),
            (21, "LLB", "Law", "University of Pretoria", 2017, True),
            (22, "MEng", "Telecommunications", "University of Cape Town", 2004, True),
            # Another fake qualification
            (24, "Diploma", "Process Engineering", "Bogus Academy", 2016, False),
        ]

        for cit_idx, qtype, field, inst, year, registered in qual_data:
            q = Qualification(
                citizen_id=citizens[cit_idx].id,
                qualification_type=qtype,
                field_of_study=field,
                institution=inst,
                year_obtained=year,
                is_institution_registered=registered,
            )
            db.add(q)

        # ---- BURIAL SOCIETY MEMBERSHIPS ----
        burial_data = [
            # (citizen_idx, society_name, membership_number, start_date, is_active, monthly_premium)
            (5, "Ubuntu Burial Society", "UBS-2021-0034", date(2021, 3, 1), True, 150.00),
            (7, "Ithemba Funeral Society", "IFS-2019-0112", date(2019, 6, 15), True, 200.00),
            (11, "Masakhane Burial Club", "MBC-2020-0078", date(2020, 1, 1), True, 100.00),
            # SASSA recipients with burial society memberships (anomaly)
            (12, "Sizanani Burial Society", "SBS-2020-0045", date(2020, 5, 1), True, 250.00),
            (24, "Ubuntu Burial Society", "UBS-2018-0019", date(2018, 2, 1), True, 300.00),
            # Inactive membership (should not flag)
            (16, "Ithemba Funeral Society", "IFS-2015-0201", date(2015, 8, 1), False, 180.00),
            (3, "Masakhane Burial Club", "MBC-2022-0091", date(2022, 4, 1), True, 120.00),
            (9, "Sizanani Burial Society", "SBS-2021-0067", date(2021, 9, 1), True, 175.00),
        ]

        for cit_idx, society, member_no, start, active, premium in burial_data:
            b = BurialSocietyMembership(
                citizen_id=citizens[cit_idx].id,
                society_name=society,
                membership_number=member_no,
                join_date=start,
                is_active=active,
                monthly_premium=premium,
            )
            db.add(b)

        # ---- CRIMINAL RECORDS ----
        criminal_data = [
            # (citizen_idx, case_number, offence, severity, court, date_convicted, sentence, is_cleared,
            #  is_interpol_wanted, interpol_notice_type, wanted_countries_json, interpol_case_ref)
            (8, "CR-2015-0042", "Assault", "moderate", "Johannesburg Magistrate", date(2015, 9, 10), "Suspended sentence", True, False, None, None, None),
            (16, "CR-2010-0118", "Fraud", "serious", "Pretoria High Court", date(2010, 6, 15), "3 years imprisonment (served)", True, False, None, None, None),
            # Active criminal record
            (12, "CR-2022-0201", "Tax evasion", "serious", "Specialised Commercial Crimes Court", date(2022, 11, 20), "Under appeal", False, False, None, None, None),
            # Interpol wanted - fugitive from another country working in SA
            (19, "CR-2023-0089", "Money laundering", "serious", None, None, None, False, True, "red", json.dumps(["Nigeria", "United Kingdom"]), "INTERPOL-2023-RED-44521"),
        ]

        for cit_idx, case_no, offence, severity, court, convicted, sentence, cleared, interpol, notice, countries, case_ref in criminal_data:
            db.add(CriminalRecord(
                citizen_id=citizens[cit_idx].id,
                case_number=case_no,
                offence=offence,
                severity=severity,
                court=court,
                date_convicted=convicted,
                sentence=sentence,
                is_cleared=cleared,
                is_interpol_wanted=interpol,
                interpol_notice_type=notice,
                wanted_countries=countries,
                interpol_case_ref=case_ref,
            ))

        # ---- CREDIT RECORDS ----
        credit_data = [
            # (citizen_idx, score, band, defaults, judgements, insolvency, total_accts, good_accts)
            (0, 720, "good", False, False, False, 5, 5),
            (1, 680, "good", False, False, False, 4, 4),
            (2, 790, "excellent", False, False, False, 8, 8),
            (3, 620, "fair", True, False, False, 3, 2),
            (4, 810, "excellent", False, False, False, 12, 12),
            (5, 550, "poor", True, True, False, 2, 0),
            (6, 740, "excellent", False, False, False, 6, 6),
            (7, 660, "fair", False, False, False, 3, 3),
            (9, 710, "good", False, False, False, 4, 4),
            (10, 780, "excellent", False, False, False, 9, 9),
            (12, 450, "poor", True, True, False, 5, 1),
            (14, 750, "excellent", False, False, False, 7, 7),
            (20, 700, "good", False, False, False, 6, 6),
        ]

        for cit_idx, score, band, defaults, judgements, insolvency, total, good in credit_data:
            db.add(CreditRecord(
                citizen_id=citizens[cit_idx].id,
                credit_score=score,
                credit_score_band=band,
                has_defaults=defaults,
                has_judgements=judgements,
                has_insolvency=insolvency,
                total_accounts=total,
                accounts_in_good_standing=good,
            ))

        # ---- DRIVER'S LICENCES ----
        licence_data = [
            # (citizen_idx, licence_number, code, issue_date, expiry_date, is_valid, restrictions, endorsements)
            (0, "GP-DL-900315-001", "B", date(2012, 6, 1), date(2027, 6, 1), True, None, 0),
            (1, "GP-DL-880722-002", "B", date(2010, 3, 15), date(2025, 3, 15), True, "Corrective lenses", 0),
            (2, "WC-DL-851108-003", "EB", date(2008, 1, 20), date(2028, 1, 20), True, None, 0),
            (4, "GP-DL-780514-005", "B", date(2000, 5, 1), date(2025, 5, 1), True, None, 1),
            (6, "WC-DL-831225-007", "C", date(2005, 11, 1), date(2025, 11, 1), True, None, 0),
            (9, "KZN-DL-940828-010", "B", date(2016, 4, 1), date(2026, 4, 1), True, None, 0),
            (10, "MP-DL-800411-011", "EC", date(2002, 7, 1), date(2027, 7, 1), True, None, 0),
            (14, "GP-DL-821116-015", "B", date(2004, 9, 1), date(2024, 9, 1), False, None, 2),  # Expired
            (22, "EC-DL-761022-023", "EB", date(1998, 3, 1), date(2028, 3, 1), True, None, 0),
        ]

        for cit_idx, lic_no, code, issued, expiry, valid, restrict, endorse in licence_data:
            db.add(DriversLicence(
                citizen_id=citizens[cit_idx].id,
                licence_number=lic_no,
                licence_code=code,
                issue_date=issued,
                expiry_date=expiry,
                is_valid=valid,
                restrictions=restrict,
                endorsements=endorse,
            ))

        # ---- PROFESSIONAL REGISTRATIONS ----
        prof_data = [
            # (citizen_idx, body, reg_number, designation, reg_date, expiry, active, good_standing)
            (2, "ECSA", "ECSA-2012-PR-04521", "Professional Engineer", date(2012, 3, 1), None, True, True),
            (4, "Actuarial Society of SA", "ASSA-2005-FIA-00312", "Fellow", date(2005, 6, 1), None, True, True),
            (10, "ECSA", "ECSA-2009-PR-07234", "Professional Engineer", date(2009, 1, 15), None, True, True),
            (21, "Law Society of SA", "LSSA-2018-ATT-11045", "Attorney", date(2018, 5, 1), date(2025, 12, 31), True, True),
            (22, "ECSA", "ECSA-2006-PR-05678", "Professional Engineer", date(2006, 8, 1), None, True, False),  # Not in good standing
        ]

        for cit_idx, body, reg_no, desig, reg_date, exp, active, standing in prof_data:
            db.add(ProfessionalRegistration(
                citizen_id=citizens[cit_idx].id,
                body_name=body,
                registration_number=reg_no,
                designation=desig,
                registration_date=reg_date,
                expiry_date=exp,
                is_active=active,
                is_in_good_standing=standing,
            ))

        # ---- ADDRESSES ----
        address_data = [
            # (citizen_idx, type, street, suburb, city, province, code, is_current)
            (0, "residential", "42 Rivonia Road", "Sandton", "Johannesburg", "Gauteng", "2196", True),
            (1, "residential", "15 Commissioner Street", "Marshalltown", "Johannesburg", "Gauteng", "2001", True),
            (2, "residential", "8 Long Street", "City Centre", "Cape Town", "Western Cape", "8001", True),
            (3, "residential", "23 Buitengracht Street", "Bo-Kaap", "Cape Town", "Western Cape", "8001", True),
            (4, "residential", "100 Sandton Drive", "Sandton", "Johannesburg", "Gauteng", "2196", True),
            (5, "residential", "7 Church Street", "Arcadia", "Pretoria", "Gauteng", "0083", True),
            (6, "residential", "55 Adderley Street", "City Centre", "Cape Town", "Western Cape", "8001", True),
            (7, "residential", "12 Umhlanga Rocks Drive", "Umhlanga", "Durban", "KwaZulu-Natal", "4319", True),
            (9, "residential", "30 Florida Road", "Morningside", "Durban", "KwaZulu-Natal", "4001", True),
            (10, "residential", "3 Secunda Road", "Secunda", "Secunda", "Mpumalanga", "2302", True),
            (14, "residential", "67 Voortrekker Road", "Bellville", "Cape Town", "Western Cape", "7530", True),
            (20, "residential", "88 Jan Smuts Avenue", "Rosebank", "Johannesburg", "Gauteng", "2196", True),
            (0, "postal", "PO Box 1042", None, "Sandton", "Gauteng", "2146", True),
        ]

        for cit_idx, atype, street, suburb, city, province, code, current in address_data:
            db.add(Address(
                citizen_id=citizens[cit_idx].id,
                address_type=atype,
                street_address=street,
                suburb=suburb,
                city=city,
                province=province,
                postal_code=code,
                is_current=current,
            ))

        # ---- REFERENCES ----
        reference_data = [
            # (citizen_idx, company_name, referee_name, position, contact, relationship, text, rating, verified)
            (0, "Discovery Limited", "Sarah Naidoo", "Team Lead", "sarah.n@discovery.co.za", "Direct Manager", "Thabo is a diligent developer.", "excellent", True),
            (1, "Standard Bank Group", "James Fourie", "Head of Analytics", "j.fourie@standardbank.co.za", "Direct Manager", "Naledi shows strong analytical skills.", "good", True),
            (2, "Vodacom Group", "Peter Moloi", "Engineering Director", "p.moloi@vodacom.co.za", "Direct Manager", "Sipho was an excellent engineer.", "excellent", True),
            (2, "Sasol Limited", "Lindiwe Khumalo", "CTO", "l.khumalo@sasol.co.za", "Direct Manager", None, None, False),  # Unverified
            (6, "Standard Bank Group", "Ahmed Patel", "Regional Director", "a.patel@standardbank.co.za", "Direct Manager", "Mandla ran the branch effectively.", "good", True),
            (10, "Sasol Limited", "Dirk van Wyk", "Plant Manager", "d.vanwyk@sasol.co.za", "Direct Manager", "Vusi is highly competent.", "excellent", True),
        ]

        for cit_idx, comp_name, ref_name, ref_pos, contact, rel, text, rating, verified in reference_data:
            db.add(Reference(
                citizen_id=citizens[cit_idx].id,
                company_id=companies[comp_name].id,
                referee_name=ref_name,
                referee_position=ref_pos,
                referee_contact=contact,
                relationship_to_candidate=rel,
                reference_text=text,
                rating=rating,
                is_verified=verified,
                verified_at=datetime.utcnow() if verified else None,
            ))

        # ---- USER ACCOUNTS ----
        password_hash = hash_password("Demo@1234")
        admin_hash = hash_password("Admin@1234")

        users_data = [
            ("thabo.candidate", password_hash, "Thabo Mokoena", "candidate", 0, None),
            ("naledi.candidate", password_hash, "Naledi Dlamini", "candidate", 1, None),
            ("sipho.candidate", password_hash, "Sipho Nkosi", "candidate", 2, None),
            ("hr.discovery", password_hash, "Karabo Patel (Discovery HR)", "employer", None, "Discovery Limited"),
            ("hr.standardbank", password_hash, "Liam van der Merwe (Std Bank HR)", "employer", None, "Standard Bank Group"),
            ("admin", admin_hash, "System Administrator", "admin", None, None),
        ]

        users = {}
        for username, pw, fullname, role, cit_idx, comp_name in users_data:
            u = User(
                username=username,
                hashed_password=pw,
                full_name=fullname,
                role=role,
                citizen_id=citizens[cit_idx].id if cit_idx is not None else None,
                company_id=companies[comp_name].id if comp_name else None,
            )
            db.add(u)
            db.flush()
            users[username] = u

        # ---- PRE-SEEDED VERIFICATION REQUESTS ----

        # Request 1: Discovery HR verifying Thabo Mokoena (candidate 0)
        req1 = VerificationRequest(
            employer_user_id=users["hr.discovery"].id,
            candidate_id_number=citizens[0].id_number,
            reason="Job application - Senior Developer position",
            status="pending",
        )
        db.add(req1)
        db.flush()

        items1 = [
            ("id_verification", {}),
            ("employment_check", {"company_name": "Discovery Limited"}),
            ("salary_bracket", {"company_name": "Discovery Limited", "bracket": "R30k-R50k"}),
            ("qualification_check", {"qualification_type": "BSc", "institution": "University of Pretoria"}),
        ]
        for qtype, params in items1:
            db.add(VerificationItem(
                request_id=req1.id,
                query_type=qtype,
                query_params=json.dumps(params),
            ))

        # Request 2: Standard Bank HR verifying Naledi Dlamini (candidate 1)
        req2 = VerificationRequest(
            employer_user_id=users["hr.standardbank"].id,
            candidate_id_number=citizens[1].id_number,
            reason="Background check - Promotion to Senior Analyst",
            status="pending",
        )
        db.add(req2)
        db.flush()

        items2 = [
            ("id_verification", {}),
            ("employment_check", {"company_name": "Standard Bank Group"}),
            ("employment_period", {"company_name": "Standard Bank Group", "start_year": 2016, "end_year": 2024}),
        ]
        for qtype, params in items2:
            db.add(VerificationItem(
                request_id=req2.id,
                query_type=qtype,
                query_params=json.dumps(params),
            ))

        # Request 3: Discovery HR verifying Sipho Nkosi (candidate 2)
        req3 = VerificationRequest(
            employer_user_id=users["hr.discovery"].id,
            candidate_id_number=citizens[2].id_number,
            reason="Pre-employment screening - Engineering role",
            status="pending",
        )
        db.add(req3)
        db.flush()

        items3 = [
            ("employment_check", {"company_name": "Vodacom Group"}),
            ("employment_period", {"company_name": "Vodacom Group", "start_year": 2012, "end_year": 2020}),
            ("qualification_check", {"qualification_type": "BEng", "institution": "University of Cape Town"}),
        ]
        for qtype, params in items3:
            db.add(VerificationItem(
                request_id=req3.id,
                query_type=qtype,
                query_params=json.dumps(params),
            ))

        # Seed audit log entries
        db.add(AuditLog(
            user_id=users["admin"].id,
            username="admin",
            action="system_seed",
            resource_type="system",
            details=json.dumps({"message": "Database seeded with mock data"}),
        ))

        db.commit()
        print("Database seeded successfully!")
        print(f"  - {len(citizens_data)} citizens")
        print(f"  - {len(companies_data)} companies")
        print(f"  - {len(employment_data)} employment records")
        print(f"  - {len(qual_data)} qualifications")
        print(f"  - {len(burial_data)} burial society memberships")
        print(f"  - {len(criminal_data)} criminal records")
        print(f"  - {len(credit_data)} credit records")
        print(f"  - {len(licence_data)} driver's licences")
        print(f"  - {len(prof_data)} professional registrations")
        print(f"  - {len(address_data)} addresses")
        print(f"  - {len(reference_data)} references")
        print(f"  - {len(users_data)} user accounts")
        print(f"  - 3 pending verification requests")
        print()
        print("Fraud anomalies seeded:")
        print("  - Ghost employee: Jabu Sithole (2 concurrent active jobs)")
        print("  - SASSA anomaly: Jabu Sithole (SASSA + R80k-R120k salary)")
        print("  - SASSA anomaly: Lungelo Mabaso (SASSA + R80k-R120k salary)")
        print("  - SASSA + burial society: Jabu Sithole & Lungelo Mabaso")
        print("  - Deceased + SASSA: Phila Gumede (declared dead, grant still active)")
        print("  - Deceased + employment: Phila Gumede (declared dead, still on payroll)")
        print("  - Fake qualifications: Jabu Sithole & Lungelo Mabaso (Bogus Academy)")
        print("  - Interpol wanted: Thandi Vilakazi (Red Notice, wanted in USA/UK/Germany)")
        print()
        print("Demo accounts:")
        print("  thabo.candidate / Demo@1234  (Candidate)")
        print("  naledi.candidate / Demo@1234  (Candidate)")
        print("  sipho.candidate / Demo@1234  (Candidate)")
        print("  hr.discovery / Demo@1234  (Employer)")
        print("  hr.standardbank / Demo@1234  (Employer)")
        print("  admin / Admin@1234  (Admin)")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
