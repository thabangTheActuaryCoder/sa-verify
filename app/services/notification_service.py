"""
Notification service for SA Verify.

In production this would integrate with an email gateway (SendGrid, AWS SES, etc.)
and the SARS eFiling API. For the prototype, notifications are logged to the
audit trail and returned in the API response so they can be displayed on the
admin dashboard.
"""

import json
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.audit import AuditLog
from app.schemas.verification import FraudAlert


def notify_fraud_alert(db: Session, alert: FraudAlert) -> dict:
    """Process a fraud alert and generate notifications.

    Returns a dict describing what notifications were dispatched.
    In production, each notification type would call the relevant external API.
    """
    notifications = []

    actions = alert.details.get("recommended_actions", [])

    for action in actions:
        notification = _build_notification(alert, action)
        if notification:
            notifications.append(notification)
            # Log each notification to the audit trail
            db.add(AuditLog(
                username="system",
                action="fraud_notification_sent",
                resource_type="notification",
                details=json.dumps(notification),
            ))

    if notifications:
        db.commit()

    return {
        "alert_type": alert.alert_type,
        "citizen": alert.citizen_name,
        "notifications_sent": notifications,
    }


def _build_notification(alert: FraudAlert, action: str) -> dict | None:
    """Build a notification record from a recommended action string."""
    now = datetime.utcnow().isoformat()

    if "SARS" in action:
        return {
            "type": "sars_notification",
            "recipient": "SARS eFiling System",
            "channel": "email",
            "subject": f"Income Anomaly Report - {alert.citizen_id_number}",
            "body": (
                f"Automated alert: {alert.citizen_name} ({alert.citizen_id_number}) "
                f"has been flagged for potential undeclared income. "
                f"Details: {alert.description}"
            ),
            "status": "sent (simulated)",
            "timestamp": now,
        }

    if "Notify employer" in action:
        employer_name = action.replace("Notify employer ", "").replace(" via email", "")
        return {
            "type": "employer_notification",
            "recipient": employer_name,
            "channel": "email",
            "subject": f"Employee Verification Alert - {alert.citizen_id_number}",
            "body": (
                f"Dear {employer_name} HR Department,\n\n"
                f"This is an automated notification from SA Verify. "
                f"An anomaly has been detected regarding employee "
                f"{alert.citizen_name} ({alert.citizen_id_number}).\n\n"
                f"Alert type: {alert.alert_type.replace('_', ' ').title()}\n"
                f"Details: {alert.description}\n\n"
                f"Please review this employee's records and take appropriate action.\n\n"
                f"Regards,\nSA Verify System"
            ),
            "status": "sent (simulated)",
            "timestamp": now,
        }

    if "SASSA" in action:
        return {
            "type": "sassa_notification",
            "recipient": "SASSA Grant Administration",
            "channel": "email",
            "subject": f"Grant Review Required - {alert.citizen_id_number}",
            "body": (
                f"Automated alert: {alert.citizen_name} ({alert.citizen_id_number}) "
                f"is flagged for social grant cancellation review. "
                f"Reason: {alert.description}"
            ),
            "status": "sent (simulated)",
            "timestamp": now,
        }

    return None


def process_all_fraud_notifications(db: Session, alerts: list[FraudAlert]) -> list[dict]:
    """Process all fraud alerts and send notifications for each."""
    results = []
    for alert in alerts:
        result = notify_fraud_alert(db, alert)
        if result["notifications_sent"]:
            results.append(result)
    return results
