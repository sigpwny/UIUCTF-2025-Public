# Solution

The typedefs are there just to make the program more confusing than it is. The bug lies in `scanf("%d", (int*)&qdata.input.val)`. Chasing down definitions, we can see that `qdata.input.val` has type `short`, which is 2 bytes on x86-64. However, the `%d` format specifier for `scanf` reads in a 4-byte int value, thus overflowing this struct field. Examining the `qdata.input` struct further, we can see that this overflows into the `padding` field.

The main goal of the program is to get `hashed_input` equal to `0x555`, which is a fixed value that cannot be changed. We can see that `hashed_input` is derived from the `quantum_hash` function and the input. However, we can see that there is actually no way that any value can be hashed to `0x555`, since the very last steps of the hash function are to apply logical OR on the hash value with `0xeee` and then XOR with `padding`, which is initialized to 0. The last 3 octets of the hash must be equal to 0x555, but the logical OR means that the last 3 octets can ever only be `e` or `f`.

Now, if we use the struct overflow into the `padding` field, we can XOR the hash with something other than 0, thus allowing the last 3 octets to be set to something other than `e` or `f`. The specific value can be found by running `hash` with some debug prints to see which value needs to be XORed to give the desired hash.
