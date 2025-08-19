import sqlite3
import os
from contextlib import contextmanager

DATABASE_PATH = '/app/data/tickets.db'

def init_database():
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    
    with sqlite3.connect(DATABASE_PATH) as conn:
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tickets (
                id TEXT PRIMARY KEY,
                timestamp INTEGER NOT NULL,
                from_email TEXT NOT NULL,
                subject TEXT NOT NULL,
                body TEXT NOT NULL,
                response TEXT,
                processed_by TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()

@contextmanager
def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def save_ticket_response(ticket_id, from_email, subject, body, response, processed_by='it_bot'):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO tickets 
            (id, timestamp, from_email, subject, body, response, processed_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (ticket_id, int(time.time() * 1000), from_email, subject, body, response, processed_by))
        conn.commit()

def get_ticket_response(ticket_id):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM tickets WHERE id = ?', (ticket_id,))
        row = cursor.fetchone()
        
        if row:
            return {
                'from': row['from_email'],
                'subject': row['subject'],
                'body': row['body'],
                'response': row['response'],
                'timestamp': row['timestamp'],
                'processed_by': row['processed_by']
            }
        return None

def delete_ticket_response(ticket_id):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM tickets WHERE id = ?', (ticket_id,))
        conn.commit()
        return cursor.rowcount > 0

import time