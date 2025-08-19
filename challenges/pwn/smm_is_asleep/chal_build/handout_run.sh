#! /bin/sh

cp OVMF_VARS.fd OVMF_VARS_copy.fd

# Note: -serial mon:stdio is here for convenience purposes.
# Remotely the chal is run with -serial stdio.

./qemu-system-x86_64 \
  -no-reboot \
  -machine q35,smm=on \
  -cpu max \
  -m 256 \
  -net none \
  -serial mon:stdio \
  -display none \
  -monitor none \
  -vga none \
  -snapshot \
  -global driver=cfi.pflash01,property=secure,value=on \
  -drive if=pflash,format=raw,unit=0,file=OVMF_CODE.fd,readonly=on \
  -drive if=pflash,format=raw,unit=1,file=OVMF_VARS_copy.fd \
  -drive if=virtio,format=qcow2,file=disk.qcow2,snapshot=on \
  -kernel bzImage \
  -append "console=ttyS0,115200 no_console_suspend"
