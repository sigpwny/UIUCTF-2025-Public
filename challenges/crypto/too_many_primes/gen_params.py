from sympy import nextprime, randprime
from sympy.core.random import seed
from math import prod, gcd
from Crypto.Util.number import bytes_to_long


seed(0x123333113313)

p = randprime(2**127, 2**128)
ps = []
N = 1
while N < 2**2048:
	print(p, N.bit_length())
	N *= p
	ps.append(p)
	p = nextprime(p)

phi_N = prod([p-1 for p in ps])
assert gcd(phi_N, 65537) == 1

pt = bytes_to_long(b"uiuctf{D0nt_U5e_Cons3cUt1vE_PriMeS}")
ct = pow(pt, 65537, N)

print("N = ", N)
print("ct = ", ct)

