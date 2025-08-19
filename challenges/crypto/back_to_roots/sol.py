from tqdm import tqdm
from math import inf
import mpmath
from mpmath import mp

from hashlib import md5
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

mpmath.mp.dps = 30

# Parameters
leak = 4336282047950153046404
ct = bytes.fromhex("7863c63a4bb2c782eb67f32928a1deceaee0259d096b192976615fba644558b2ef62e48740f7f28da587846a81697745")

# sqrt(K) = N.4336....
# We can brute force N

min_eps = inf
N_out = None
for N in tqdm(range(10**6)):
	sqrtK = mpmath.mpf(f"{N}.{leak}")
	K = sqrtK**2
	eps = K - round(K)
	if abs(eps) < abs(min_eps):
		print(N, sqrtK, K, eps)
		N_out = N
		min_eps = eps

K = round( mpmath.mpf(f"{N_out}.{leak}") ** 2 )
pt = unpad(AES.new(
        md5(f"{K}".encode()).digest(),
        AES.MODE_ECB
).decrypt(ct), 16)
print(pt)

print(pt)
