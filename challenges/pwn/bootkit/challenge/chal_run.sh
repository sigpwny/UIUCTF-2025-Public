#! /bin/sh

cp -r rootfs /tmp/rootfs_copy
cp -r tpm0 /tmp/tpm0_copy
cp OVMF_CODE.fd /tmp/OVMF_CODE_copy.fd
cp OVMF_VARS.fd /tmp/OVMF_VARS_copy.fd
cp disk.qcow2 /tmp/disk_copy.qcow2

swtpm socket \
  -td \
  --tpm2 \
  --tpmstate dir=/tmp/tpm0_copy \
  --ctrl type=unixio,path=/tmp/swtpm-sock \
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
  -drive if=pflash,format=raw,unit=0,file=/tmp/OVMF_CODE_copy.fd \
  -drive if=pflash,format=raw,unit=1,file=/tmp/OVMF_VARS_copy.fd \
  -drive format=raw,file=fat:rw:/tmp/rootfs_copy \
  -chardev socket,id=chrtpm,path=/tmp/swtpm-sock \
  -tpmdev emulator,id=tpm0,chardev=chrtpm \
  -device tpm-tis,tpmdev=tpm0

exec < /dev/null
sleep 1

swtpm socket \
  -td \
  --tpm2 \
  --tpmstate dir=/tmp/tpm0_copy \
  --ctrl type=unixio,path=/tmp/swtpm-sock \
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
  -drive if=pflash,format=raw,unit=0,file=/tmp/OVMF_CODE_copy.fd \
  -drive if=pflash,format=raw,unit=1,file=/tmp/OVMF_VARS_copy.fd \
  -drive if=virtio,format=qcow2,file=/tmp/disk_copy.qcow2 \
  -drive if=ide,format=raw,file=fat:rw:/tmp/rootfs_copy \
  -chardev socket,id=chrtpm,path=/tmp/swtpm-sock \
  -tpmdev emulator,id=tpm0,chardev=chrtpm \
  -device tpm-tis,tpmdev=tpm0
