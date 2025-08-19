#! /bin/sh

./qemu-system-x86_64 \
  -no-reboot \
  -machine q35,smm=on \
  -cpu max \
  -m 256 \
  -net none \
  -serial stdio \
  -display none \
  -monitor none \
  -vga none \
  -snapshot \
  -debugcon file:/handout/edk2debug.log \
  -global isa-debugcon.iobase=0x402 \
  -global driver=cfi.pflash01,property=secure,value=on \
  -drive if=pflash,format=raw,unit=0,file=OVMF_CODE.fd,readonly=on \
  -drive if=pflash,format=raw,unit=1,file=OVMF_VARS.fd \
  -drive if=virtio,format=qcow2,file=disk.qcow2,snapshot=on \
  -kernel bzImage \
  -append "console=ttyS0,115200 no_console_suspend"
