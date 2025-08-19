from sympy.ntheory import discrete_log
from pwn import process

p = 0xffffff2f
test_pt = [577090037,2444712010,3639700191,3445702192,3280387012,271041745,1095513148,506456969]
test_ct = [3695492958,1526668524,3790189762,20093842,2409408810,239453620,1615481745,1887562585]

exponents = [discrete_log(p, b, a) for a,b in zip(test_pt, test_ct)]
print(exponents)
proc = process("./flag_checker")
for e in exponents:
	proc.sendline(str(e))
for i in range(2):
	print( proc.recvline() )
