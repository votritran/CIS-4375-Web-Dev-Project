from flask import Flask, request, jsonify, Blueprint
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables (secure email credentials)
load_dotenv()

# app = Flask(__name__)
email_blueprint = Blueprint("email", __name__)
# Email configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_SENDER = os.getenv("EMAIL_SENDER", "your-email@gmail.com")  # Your SMTP account
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "your-app-password")  # Use Google App Password
EMAIL_RECEIVER = "parissweet08@gmail.com"  # Paris Sweet Patisserie's email

@email_blueprint.route('/send_email', methods=['POST'])
def send_email():
    try:
        # Get form data from the request
        data = request.json
        name = data.get("name")
        email = data.get("email")  # User's email from the form
        phone = data.get("phone")
        contact_type = data.get("contactType")
        language = data.get("Language")
        subject = data.get("Subject")
        message = data.get("message")

        if not all([name, email, phone, contact_type, language, subject, message]):
            return jsonify({"error": "All fields are required."}), 400

        # Email subject and body
        email_subject = f"New Contact Form Submission: {subject}"
        body = f"""
        Name: {name}
        Email: {email}
        Phone: {phone}
        Preferred Contact Method: {contact_type}
        Preferred Language: {language}
        Subject: {subject}
        Message: {message}
        """

        # Create email message
        msg = MIMEMultipart()
        msg['From'] = EMAIL_SENDER  # Your authenticated Gmail
        msg['To'] = EMAIL_RECEIVER  # Paris Sweet Patisserie's email
        msg['Subject'] = email_subject
        msg.attach(MIMEText(body, 'plain'))

        # Send email via Gmail SMTP
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.sendmail(EMAIL_SENDER, EMAIL_RECEIVER, msg.as_string())
        server.quit()

        return jsonify({"message": "Your message has been sent successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500