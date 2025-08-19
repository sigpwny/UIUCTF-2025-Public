#! /bin/sh

cp OVMF_VARS.fd OVMF_VARS_copy.fd

# Note: rootfs is read-only on remote
rm -rf rootfs_copy; cp -r rootfs rootfs_copy

qemu-system-x86_64 \
  -no-reboot \
  -machine q35,smm=on \
  -cpu max \
  -m 256 \
  -net none \
  -serial stdio \
  -display none \
  -monitor none \
  -vga none \
  -global ICH9-LPC.disable_s3=1 \
  -global driver=cfi.pflash01,property=secure,value=on \
  -fw_cfg name=opt/org.tianocore/FirmwareSetupSupport,string=no \
  -fw_cfg name=opt/org.tianocore/EFIShellSupport,string=no \
  -fw_cfg name=opt/org.tianocore/EnableLegacyLoader,string=no \
  -drive if=pflash,format=raw,unit=0,file=OVMF_CODE.fd,readonly=on \
  -drive if=pflash,format=raw,unit=1,file=OVMF_VARS_copy.fd \
  -drive format=raw,file=fat:rw:rootfs_copy \
  -virtfs local,multidevs=remap,path=secret,security_model=none,mount_tag=flag,readonly=on
