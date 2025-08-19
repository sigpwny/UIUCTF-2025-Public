#! /bin/sh

# Stage 1: Enroll the secure boot keys

./qemu-system-x86_64 \
  -no-reboot \
  -machine q35,smm=on \
  -cpu max \
  -m 512 \
  -net none \
  -serial stdio \
  -display none \
  -monitor none \
  -vga none \
  -global ICH9-LPC.disable_s3=1 \
  -global driver=cfi.pflash01,property=secure,value=on \
  -drive if=pflash,format=raw,unit=0,file=OVMF_CODE.fd,readonly=on \
  -drive if=pflash,format=raw,unit=1,file=OVMF_VARS.fd \
  -kernel bzImage \
  -initrd initrd

# Stage 2: Encrypt the disk via TPM

# Also prime the boot order, since TPM PCR 4 is very sensitive
# This is sent via qemu system/bootdevice.c -> qemu hw/nvram/fw_cfg.c
# -> fw_cfg bootorder -> ovmf OvmfPkg/Library/QemuBootOrderLib

swtpm_setup \
  --tpm2 \
  --tpmstate tpm0 \
  --create-ek-cert \
  --create-platform-cert \
  --lock-nvram

swtpm socket \
  -td \
  --tpm2 \
  --tpmstate dir=tpm0 \
  --ctrl type=unixio,path=swtpm-sock \
  --log level=0

./qemu-system-x86_64 \
  -no-reboot \
  -machine q35,smm=on \
  -cpu max \
  -m 512 \
  -net none \
  -serial stdio \
  -display none \
  -monitor none \
  -vga none \
  -global driver=cfi.pflash01,property=secure,value=on \
  -fw_cfg name=opt/org.tianocore/FirmwareSetupSupport,string=no \
  -fw_cfg name=opt/org.tianocore/EFIShellSupport,string=no \
  -fw_cfg name=opt/org.tianocore/EnableLegacyLoader,string=no \
  -drive if=pflash,format=raw,unit=0,file=OVMF_CODE.fd,readonly=on \
  -drive if=pflash,format=raw,unit=1,file=OVMF_VARS.fd \
  -drive if=virtio,format=raw,file=disk.img,discard=unmap \
  -drive if=none,format=raw,file=fat:rw:rootfs,id=efidisk \
  -device ide-hd,drive=efidisk,bootindex=1 \
  -chardev socket,id=chrtpm,path=swtpm-sock \
  -tpmdev emulator,id=tpm0,chardev=chrtpm \
  -device tpm-tis,tpmdev=tpm0

# Wait for swtpm to exit
sleep 1
