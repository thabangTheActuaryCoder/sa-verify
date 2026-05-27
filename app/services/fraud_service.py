from sqlalchemy.orm import Session

from app.models.citizen import Citizen
from app.models.employment import Employment
from app.models.qualification import Qualification
from app.models.burial_society import BurialSocietyMembership
from app.models.criminal_record import CriminalRecord
from app.schemas.verification import FraudAlert


def detect_all_fraud(db: Session) -> list[FraudAlert]:
    alerts = []
    alerts.extend(detect_ghost_employees(db))
    alerts.extend(detect_sassa_anomalies(db))
    alerts.extend(detect_sassa_burial_society(db))
    alerts.extend(detect_deceased_grant_fraud(db))
    alerts.extend(detect_interpol_wanted(db))
    alerts.extend(detect_fake_qualifications(db))
    return alerts


def detect_ghost_employees(db: Session) -> list[FraudAlert]:
    """Detect citizens with multiple active (current) employments."""
    alerts = []
    citizens = db.query(Citizen).all()

    for citizen in citizens:
        active_jobs = [e for e in citizen.employments if e.is_current]
        if len(active_jobs) > 1:
            company_names = [e.company.name for e in active_jobs]
            alerts.append(
                FraudAlert(
                    alert_type="ghost_employee",
                    severity="high",
                    citizen_id_number=citizen.id_number,
                    citizen_name=f"{citizen.first_name} {citizen.last_name}",
                    description=(
                        f"Citizen has {len(active_jobs)} concurrent active employments "
                        f"at: {', '.join(company_names)}"
                    ),
                    details={
                        "active_employment_count": len(active_jobs),
                        "companies": company_names,
                    },
                )
            )

    return alerts


def detect_sassa_anomalies(db: Session) -> list[FraudAlert]:
    """Detect SASSA recipients with high salary brackets."""
    alerts = []
    high_brackets = {"R50k-R80k", "R80k-R120k", "R120k+"}

    recipients = db.query(Citizen).filter(Citizen.is_sassa_recipient.is_(True)).all()

    for citizen in recipients:
        for emp in citizen.employments:
            if emp.salary_bracket in high_brackets and emp.is_current:
                alerts.append(
                    FraudAlert(
                        alert_type="sassa_anomaly",
                        severity="critical",
                        citizen_id_number=citizen.id_number,
                        citizen_name=f"{citizen.first_name} {citizen.last_name}",
                        description=(
                            f"SASSA recipient currently employed at {emp.company.name} "
                            f"with salary bracket {emp.salary_bracket}. "
                            f"Social grant should be reviewed for cancellation. "
                            f"SARS and employer ({emp.company.name}) must be notified."
                        ),
                        details={
                            "company": emp.company.name,
                            "salary_bracket": emp.salary_bracket,
                            "job_title": emp.job_title,
                            "recommended_actions": [
                                "Flag for SASSA grant cancellation",
                                f"Notify SARS of undeclared income at {emp.company.name}",
                                f"Notify employer {emp.company.name} via email",
                            ],
                        },
                    )
                )

    return alerts


def detect_sassa_burial_society(db: Session) -> list[FraudAlert]:
    """Detect SASSA recipients who are active members of burial societies.

    A SASSA recipient paying burial society premiums indicates potential
    undisclosed income, as grant recipients are means-tested.
    This should trigger grant review, SARS notification, and employer notification.
    """
    alerts = []

    recipients = db.query(Citizen).filter(Citizen.is_sassa_recipient.is_(True)).all()

    for citizen in recipients:
        active_memberships = [
            m for m in citizen.burial_memberships if m.is_active
        ]
        if active_memberships:
            for membership in active_memberships:
                # Gather employer info for notifications
                current_employers = [
                    e.company.name for e in citizen.employments if e.is_current
                ]
                alerts.append(
                    FraudAlert(
                        alert_type="sassa_burial_society",
                        severity="critical",
                        citizen_id_number=citizen.id_number,
                        citizen_name=f"{citizen.first_name} {citizen.last_name}",
                        description=(
                            f"SASSA recipient is an active member of '{membership.society_name}' "
                            f"(membership: {membership.membership_number}, "
                            f"premium: R{membership.monthly_premium:.0f}/month). "
                            f"This indicates undisclosed income. "
                            f"Social grant must be reviewed for immediate cancellation."
                        ),
                        details={
                            "society_name": membership.society_name,
                            "membership_number": membership.membership_number,
                            "monthly_premium": membership.monthly_premium,
                            "join_date": membership.join_date.isoformat(),
                            "current_employers": current_employers,
                            "recommended_actions": [
                                "Immediate SASSA grant cancellation review",
                                "Notify SARS of potential undeclared income",
                            ] + [
                                f"Notify employer {emp} via email"
                                for emp in current_employers
                            ],
                        },
                    )
                )

    return alerts


def detect_deceased_grant_fraud(db: Session) -> list[FraudAlert]:
    """Detect deceased citizens who still have active SASSA grants or active employment.

    When Home Affairs declares someone deceased, their social grant should be
    automatically cut and any active employment flagged. SASSA, SARS, and the
    employer must all be notified immediately.
    """
    alerts = []

    deceased = db.query(Citizen).filter(Citizen.is_alive.is_(False)).all()

    for citizen in deceased:
        if citizen.is_sassa_recipient:
            alerts.append(
                FraudAlert(
                    alert_type="deceased_grant_fraud",
                    severity="critical",
                    citizen_id_number=citizen.id_number,
                    citizen_name=f"{citizen.first_name} {citizen.last_name}",
                    description=(
                        f"Home Affairs records show {citizen.first_name} {citizen.last_name} "
                        f"is deceased, but SASSA grant is still active. "
                        f"Grant must be cancelled immediately."
                    ),
                    details={
                        "home_affairs_status": "deceased",
                        "sassa_grant_active": True,
                        "recommended_actions": [
                            "Immediate SASSA grant cancellation review",
                            "Notify SARS of deceased status for tax record closure",
                        ],
                    },
                )
            )

        active_jobs = [e for e in citizen.employments if e.is_current]
        if active_jobs:
            company_names = [e.company.name for e in active_jobs]
            alerts.append(
                FraudAlert(
                    alert_type="deceased_active_employment",
                    severity="critical",
                    citizen_id_number=citizen.id_number,
                    citizen_name=f"{citizen.first_name} {citizen.last_name}",
                    description=(
                        f"Home Affairs records show {citizen.first_name} {citizen.last_name} "
                        f"is deceased, but still listed as actively employed at: "
                        f"{', '.join(company_names)}. "
                        f"Employers must be notified to remove from payroll."
                    ),
                    details={
                        "home_affairs_status": "deceased",
                        "active_companies": company_names,
                        "recommended_actions": [
                            "Notify SARS of deceased status for tax record closure",
                        ] + [
                            f"Notify employer {c} via email to remove from payroll"
                            for c in company_names
                        ],
                    },
                )
            )

    return alerts


def detect_interpol_wanted(db: Session) -> list[FraudAlert]:
    """Detect citizens who are wanted by Interpol or other countries.

    Cross-references criminal records with Interpol red notices and
    international wanted flags. Flags any citizen currently employed
    in South Africa who has an active international warrant.
    """
    alerts = []

    wanted_records = (
        db.query(CriminalRecord)
        .filter(CriminalRecord.is_interpol_wanted.is_(True))
        .all()
    )

    for record in wanted_records:
        citizen = record.citizen
        current_employers = [
            e.company.name for e in citizen.employments if e.is_current
        ]
        import json as _json
        countries = _json.loads(record.wanted_countries) if record.wanted_countries else []
        countries_str = ", ".join(countries) if countries else "undisclosed countries"

        alerts.append(
            FraudAlert(
                alert_type="interpol_wanted",
                severity="critical",
                citizen_id_number=citizen.id_number,
                citizen_name=f"{citizen.first_name} {citizen.last_name}",
                description=(
                    f"Interpol {record.interpol_notice_type.upper()} notice: "
                    f"{citizen.first_name} {citizen.last_name} is wanted by {countries_str}. "
                    f"Case ref: {record.interpol_case_ref or 'N/A'}. "
                    f"Offence: {record.offence}."
                    + (f" Currently employed at: {', '.join(current_employers)}." if current_employers else "")
                ),
                details={
                    "interpol_notice_type": record.interpol_notice_type,
                    "case_reference": record.interpol_case_ref,
                    "offence": record.offence,
                    "wanted_countries": countries,
                    "current_employers": current_employers,
                    "recommended_actions": [
                        "Alert SAPS Interpol National Central Bureau",
                        "Flag for immigration hold at all ports of entry",
                    ] + [
                        f"Notify employer {emp} via email"
                        for emp in current_employers
                    ],
                },
            )
        )

    return alerts


def detect_fake_qualifications(db: Session) -> list[FraudAlert]:
    """Detect qualifications from unregistered institutions."""
    alerts = []
    fake_quals = (
        db.query(Qualification)
        .filter(Qualification.is_institution_registered.is_(False))
        .all()
    )

    for qual in fake_quals:
        citizen = qual.citizen
        alerts.append(
            FraudAlert(
                alert_type="fake_qualification",
                severity="medium",
                citizen_id_number=citizen.id_number,
                citizen_name=f"{citizen.first_name} {citizen.last_name}",
                description=(
                    f"Qualification '{qual.qualification_type} in {qual.field_of_study}' "
                    f"from unregistered institution '{qual.institution}'"
                ),
                details={
                    "institution": qual.institution,
                    "qualification": qual.qualification_type,
                    "field": qual.field_of_study,
                    "year": qual.year_obtained,
                },
            )
        )

    return alerts
