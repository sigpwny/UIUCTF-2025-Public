import struct
from random import seed, randint

seed(0x01) # Tweak until works

P = 4294967087
flag = struct.unpack("8I", b"CrackingDiscreteLogs4TheFun/Lols")

test_pt = [randint(0, P) for _ in range(8) ]
assert [pow(p, (P-1//2), P) == (P-1) for p in test_pt]
exponents = []
while len(exponents) < 8:
	e = randint(0, P)
	try:
		d = pow(e, -1, P-1)
		exponents.append(e)
	except:
		continue

test_ct = [pow(p, e, P) for p,e in zip(test_pt, exponents)]

flag_enc = [pow(f, pow(e, -1, P-1), P) for f, e in zip(flag, exponents)]
assert all([pow(f_enc, e, P) == f for f_enc, e, f in zip(flag_enc, exponents, flag) ])

print("const uint32_t test_pt[8] = {%s};" % ",".join(map(str, test_pt)))
print("const uint32_t test_ct[8] = {%s};" % ",".join(map(str, test_ct)))
print("const uint32_t flag_enc[8] = {%s};" % ",".join(map(str, flag_enc)))
for e in exponents:
	print(e)

