#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Copyright 2022-2025 Google LLC
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

import pwnlib.tubes
import base64
import re


def printraw(c):
    print(c.decode(), end='')


r = pwnlib.tubes.process.process('cd /home/user/run; ./run.sh', shell=True)

printraw(r.recvuntil(b'uiuctf-2025:/root# '))
r.send(b'base64 -d > Makefile << EOF\n')
with open('/home/user/Makefile', 'rb') as f:
    r.send(base64.b64encode(f.read()))
r.send(b'\nEOF\n')

printraw(r.recvuntil(b'uiuctf-2025:/root# '))
r.send(b'base64 -d > solution.c << EOF\n')
with open('/home/user/solution.c', 'rb') as f:
    r.send(base64.b64encode(f.read()))
r.send(b'\nEOF\n')

printraw(r.recvuntil(b'uiuctf-2025:/root# '))
r.send(b'make\n')

printraw(r.recvuntil(b'uiuctf-2025:/root# '))
r.send(b'base64 solution.ko\n')

data = r.recvuntil(b'uiuctf-2025:/root# ')
printraw(data)

data = data.replace(b'\r', b'')
# https://stackoverflow.com/a/14693789
data = re.sub(rb'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])', b'', data)

with open('/home/user/solution', 'wb') as f:
    f.write(data[len(b'base64 solution.ko\n'):-len(b'uiuctf-2025:/root# ')])

exit(0)
