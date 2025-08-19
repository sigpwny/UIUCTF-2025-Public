import smtplib
from email.mime.text import MIMEText
from flask import Flask, render_template, request, redirect, url_for, jsonify
import time
import uuid
from database import init_database, get_ticket_response

app = Flask(__name__)

init_database()

def new_data(self, msg):
    self.putcmd("data")
    (code, repl) = self.getreply()
    if self.debuglevel > 0:
        self._print_debug('data:', (code, repl))
    if code != 354:
        raise smtplib.SMTPDataError(code, repl)
    else:
        q = msg
        self.send(q)
        (code, msg) = self.getreply()
        if self.debuglevel > 0:
            self._print_debug('data:', (code, msg))
        return (code, msg)

def return_unchanged(data):
    return data

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/tickets')
def view_tickets():
    return render_template('tickets.html')

@app.route('/submit_ticket', methods=['POST'])
def submit_ticket():
    subject = request.form.get('subject', '')
    message = request.form.get('message', '')

    # Generate unique ticket ID
    ticket_id = str(uuid.uuid4())

    original_fix_eols = smtplib._fix_eols
    original_quote_periods = smtplib._quote_periods
    original_data = smtplib.SMTP.data

    try:
        smtplib._fix_eols = return_unchanged
        smtplib._quote_periods = return_unchanged
        smtplib.SMTP.data = new_data

        message_data = f"""\
From: support@blackholeticketing.com\r\n\
To: it@blackholeticketing.com\r\n\
Subject: {subject}\r\n\
X-Ticket-ID: {ticket_id}\r\n\
\r\n\
{message}\r\n\
.\r\n""".encode()

        ending_count = message_data.count(b'\r\n.\r\n')
        if ending_count != 1:
            raise ValueError("Bad Request")

        with smtplib.SMTP('localhost', 1025) as client:
            client.helo("example.com")
            client.sendmail('support@blackholeticketing.com', ['it@blackholeticketing.com'], message_data)
            # Wait a second for SMTP to process the ticket
            time.sleep(1)

        ticket_data = {
            'id': ticket_id,
            'timestamp': int(time.time() * 1000),
            'from': 'support@blackholeticketing.com',
            'subject': subject,
            'body': message,
            'status': 'submitted'
        }

        return render_template('ticket_submitted.html', ticket_data=ticket_data)

    except Exception as e:
        return f"Error: {str(e)}"

    finally:
        smtplib._fix_eols = original_fix_eols
        smtplib._quote_periods = original_quote_periods
        smtplib.SMTP.data = original_data

@app.route('/check_response/<ticket_id>')
def check_response(ticket_id):
    try:
        response_data = get_ticket_response(ticket_id)

        if response_data:
            return jsonify(response_data)
        else:
            return jsonify({'status': 'pending'})

    except Exception as e:
        print(f"Error checking response: {e}")
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == "__main__":
    app.run()
