#! /bin/sh

rm -rf rootfs_copy; cp -r rootfs rootfs_copy
rm -rf tpm0_copy; cp -r tpm0 tpm0_copy
cp OVMF_CODE.fd OVMF_CODE_copy.fd
cp OVMF_VARS.fd OVMF_VARS_copy.fd
cp disk.qcow2 disk_copy.qcow2

swtpm socket \
  -td \
  --tpm2 \
  --tpmstate dir=tpm0_copy \
  --ctrl type=unixio,path=swtpm-sock \
  --log level=0

# Stage 1: Installing bootkit.
# Because you need keyboard access, and the secret disks "detach themselves as
# soon as any keyboard input is detected during boot", this is simulated by
# having the disk detached during this boot.
#
# Note: -serial mon:stdio is here for convenience purposes.
# Remotely the chal is run with -serial stdio.

./qemu-system-x86_64 \
  -no-reboot \
  -machine q35,smm=on \
  -cpu max \
  -m 512 \
  -net none \
  -serial mon:stdio \
  -display none \
  -monitor none \
  -vga none \
  -global driver=cfi.pflash01,property=secure,value=on \
  -fw_cfg name=opt/org.tianocore/FirmwareSetupSupport,string=no \
  -fw_cfg name=opt/org.tianocore/EFIShellSupport,string=no \
  -fw_cfg name=opt/org.tianocore/EnableLegacyLoader,string=no \
  -drive if=pflash,format=raw,unit=0,file=OVMF_CODE_copy.fd \
  -drive if=pflash,format=raw,unit=1,file=OVMF_VARS_copy.fd \
  -drive format=raw,file=fat:rw:rootfs_copy \
  -chardev socket,id=chrtpm,path=swtpm-sock \
  -tpmdev emulator,id=tpm0,chardev=chrtpm \
  -device tpm-tis,tpmdev=tpm0

# Wait for swtpm to exit
sleep 1

# Stage 2: Running bootkit.
# The secret disk is attached at this phase, but remotely, the serial console
# becomes read-only.

swtpm socket \
  -td \
  --tpm2 \
  --tpmstate dir=tpm0_copy \
  --ctrl type=unixio,path=swtpm-sock \
  --log level=0

./qemu-system-x86_64 \
  -no-reboot \
  -machine q35,smm=on \
  -cpu max \
  -m 512 \
  -net none \
  -serial mon:stdio \
  -display none \
  -monitor none \
  -vga none \
  -global driver=cfi.pflash01,property=secure,value=on \
  -fw_cfg name=opt/org.tianocore/FirmwareSetupSupport,string=no \
  -fw_cfg name=opt/org.tianocore/EFIShellSupport,string=no \
  -fw_cfg name=opt/org.tianocore/EnableLegacyLoader,string=no \
  -drive if=pflash,format=raw,unit=0,file=OVMF_CODE_copy.fd \
  -drive if=pflash,format=raw,unit=1,file=OVMF_VARS_copy.fd \
  -drive if=virtio,format=qcow2,file=disk_copy.qcow2 \
  -drive if=ide,format=raw,file=fat:rw:rootfs_copy \
  -chardev socket,id=chrtpm,path=swtpm-sock \
  -tpmdev emulator,id=tpm0,chardev=chrtpm \
  -device tpm-tis,tpmdev=tpm0
