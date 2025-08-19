### Setup

This RISC-V challenge revolves around two binaries:
- main.elf: Runs in S-mode (Supervisor mode).
- child elf (called hello in my codebase): Embedded within main.elf, runs in U-mode (User mode), sharing the same memory space.

---

### Challenge

- The core of challenge revolves around triggering exceptions and letting the exception handler in main.elf to do things, or as I call it, memory mapped syscall.

- Since by default in qemu virt machine address 0x0-0x1000 is unmapped, so by reading and writing into these addresses the program will go into exception handler with error code, memory address, etc. There is also a small address re-map in there to make it less obvious.  

- Through this mechanism, I essentially built a stack based calculator in main.elf, that child ELF can access and obtain the result. The IO is also delegated to main.elf. In my implementation, access to memory address that are not a part of any "syscall" will silently halt the machine, so it is also used as a stop mechanism.

- There are garbage code in the beginning and end of child ELF to purely confuse decompilers, that either doesn't get executed or do nothing to affect the program flow.

---

### Algorithm

- First, the program fills the stack with 128 bytes (16 uint64_t) of garbage, since these bytes are used by "special operation", so it doesn't matter

- Then, the program takes in the flag one character at a time and multiply it by -1. The special operation does the following:
For each slot, it fills the buffer in that order (so 1 and 3 are reversed)
```
Slot 0: 0-31, each byte ^ 0x29
Slot 1: 63-32, each byte + 0xae
Slot 2: 64-95, each byte ^ (corresponding byte from 1 - corresponding byte from 0)
Slot 3: 96-127, each byte swap nibbles ( byte << 4 | byte >> 4)
```

- By looking at its memory access pattern, we can see that any character after 32 will result in overwriting and accessing out of bounds.

- After filling the stack, it is accessed like 16 uint64_t values since we can just pop them off the stack. To check these values, we use the following algorithm:
```
for i from 1 to 7 (inclusive)
	stack top element cyclic left shift i*i bits
	XOR with magic number 0x9e3779b97f4a7c15
	then add with next number

The top of the stack should have number 4034066512636806762

then for i from 8 to 12 (inclusive)
	stack top element cyclic left shift i^2 bits
	XOR with magic number 0x9e3779b97f4a7c15
	then subtract with next number (this number subtract next number, and then replace it)

This is checked with 546867345586458711

then for i from 13 to 14 (inclusive)
	stack top element cyclic left shift i^2 bits
	XOR with magic number 0x9e3779b97f4a7c15
	then subtract with next number (this number subtract next number, and then replace it)

This is checked with 6860906515746073210
```

- After these checks it will tell you correct. Due to the way I coded this technically you can skip the third one and just check the second one with the third number, but I find that running the z3 script with two numbers is very difficult and doesn't produce a result within 10 minutes, which should convince people that it is wrong.

