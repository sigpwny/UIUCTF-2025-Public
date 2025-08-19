#! /bin/sh

qemu-system-x86_64 \
  -no-reboot \
  -cpu max \
  -net none \
  -serial stdio \
  -display none \
  -monitor none \
  -vga none \
  -kernel bzImage \
  -initrd initrd.cpio.gz \
  -virtfs local,multidevs=remap,path=/secret,security_model=none,mount_tag=flag,readonly=on \
  -append "console=ttyS0" \
