### Platform

The hardware platform for this challenge is a MicroBlaze soft processor implemented on an FPGA. The platform utilizes VDMA (Video DMA) to transfer pixel data from RAM directly to the video output.

---

### Challenge

- Image Split and Display:  
  I used a Python script to break a single image into two separate frames. The two frames are constructed in such a way that their average forms the true image which contains the flag. - Talbot-Plateau law
  The FPGA repeatedly displays these two buffers in quick succession.

- The script parses the image and produces a C file with two buffers in RAM. This C file is then compiled and deployed alongside the main application.

- The C code was compiled with -O0, which means there’s no compiler optimizations. This results in code where each memory assignment generates nearly identically the following instructions: imm xxx, addik r3, imm, addik r4, swi r4, r3, 0
This pattern is easily recognizable and directly shows how data is placed into RAM.

---

### Solve

- First, the challenge requires a decompilation of Microblaze (there is a plugin for that) and recognize that most of the instruction is just storing to magic addresses.

- Then, after all the stores there is an unconditional jump that's essentially an infinite loop. It calls the same function twice, which hints that we have two frames switching back and forth. There are instructions before that that points to a portion of the data section that has address 0x82000000 and 0x82269000, which are the addresses of the image. There are nothing much in the data section so this really stands out

- The resolution needs a bit more work. There might be values of 800 and 600 in there, but it's hard to catch. Another (kinda-guessy) way is that the second image only has 800x600 store cycles, so you can kinda guess the resolution

- For the pixel, We can see that the top most byte per store is always 0. This should provide enough information for solvers to deduce that the pixel format is 0 | R | G | B, each one being 8 bit.

- Then the solver needs to extract the two images, get the pixel values, and then average them to get the final image, which contains the flag
