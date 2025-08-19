This is a program written in Apollo Guidance Computer (AGC) (Block 2) assembly.
An interpreter can be found at https://www.ibiblio.org/apollo/download.html and the programmer's manual at https://www.ibiblio.org/apollo/assembly_language_manual.html.

The assembly opcodes are a bit convoluted, but the main idea is most instructions operate on the accumulator register and memory. All data is stored as 15 bit, 1's complement words, except the first 3 registers, which are 16 bit. The AGC contains interrupts and MMIO, but this chal only uses ones related to the display and keyboard (DSKY) and timers. The assembler only seems to support decimal (fixed point, where the decimal is before the first digit, meaning all numbers are between -1 and 1) and octal.

The actual program is a tetris game (due to limitations of the DSKY and further limitations of the simulator, each digit is 2 pixels, represented by either 6, 9, or 8), and the goal is to reach a target board state in a certain number of moves (measured by how many times the RNG is invoked), which is checked upon game over.
```
 8868
88 89
89699
```
The full sequence of moves to reach this state can be found in sol.txt.

If the check passes, the program starts a countdown, after which it will display a list of digits, where each 5 bits encode a move as RRXXX: 2 bits for rotation and 3 bits for x position.

It may be a bit hard to perform some of the moves, so I recommend disabling gravity (handled by Timer 4) and mapping one of the keyboard interrupts to moving down.
