import z3

def rotate_left(val, shift, bitwidth=8):
    shift = shift % bitwidth  # Python int shift amount
    return ((val << shift) | z3.LShR(val, bitwidth - shift)) & ((1 << bitwidth) - 1)


solver = z3.Solver()
solver.set("threads", 20)

prefix = b"uiuctf{"
suffix = b"}"

answer = b"M3m0Ry_M4ppED_SysTEmca11"

xs = [z3.BitVec("x"+str(i), 8) for i in range(24)]

for b in xs:
    solver.add(z3.And(b >= 32, b <= 126))  # printable ASCII range

# for i in range(len(xs)):
#     solver.add(xs[i] == answer[i])

all_bytes = [z3.BitVecVal(b, 8) for b in prefix] + xs + [z3.BitVecVal(b, 8) for b in suffix]

for i in range(len(all_bytes)):
    all_bytes[i] = all_bytes[i] * -1

group_1 = all_bytes[:]
for i in range(32):
    group_1[i] = group_1[i] ^ 0x29
    group_1[i] = group_1[i] & 0xff

group_2 = all_bytes[:]
for i in range(32):
    group_2[i] = group_2[i] + 0xae
    group_2[i] = group_2[i] & 0xff


group_3 = all_bytes[:]
for i in range(32):
    group_3[i] = group_3[i] & 0xff
    group_3[i] = (group_3[i] ^ ((group_2[i] - group_1[i]) & 0xff)) & 0xff

group_4 = all_bytes[:]
for i in range(32):
    group_4[i] = ((group_4[i] << 4) | z3.LShR(group_4[i], 4)) & 0xff

group_2.reverse()
group_4.reverse()

memory_view = group_1[:] + group_2[:] + group_3[:] + group_4[:]

# Helper: pack 8 bytes into a 64-bit BitVec (little-endian)
def pack_le_64(byte_list):
    return z3.Concat(*reversed(byte_list))  # LSB first = reversed

# Build 4 uint64_t values from memory
u64s = []
for i in range(0, 128, 8):
    chunk = memory_view[i:i+8]  # Take 8 bytes
    u64s.append(pack_le_64(chunk))  # Pack into 64-bit LE

for i in range(1,8):
    u64s[16-i-1] = (u64s[16-i-1] + (rotate_left(u64s[16-i], i*i, 64) ^ 0x9e3779b97f4a7c15)) & 0xffffffffffffffff

for i in range(9, 16):
    u64s[16-i-1] = ((rotate_left(u64s[16-i], (i-1)*(i-1), 64) ^ 0x9e3779b97f4a7c15) - u64s[16-i-1]) & 0xffffffffffffffff

solver.add(u64s[8] == z3.BitVecVal(4034066512636806762, 64))
solver.add(u64s[2] == z3.BitVecVal(546867345586458711, 64))
solver.add(u64s[0] == z3.BitVecVal(6860906515746073210, 64))
print("start solving...")
while solver.check() == z3.sat:
    model = solver.model()
    solution = []
    for i in range(len(xs)):
        solution.append(model[xs[i]].as_long())
    print(bytes(solution))
    solver.add(z3.Or(*[x != z3.BitVecVal(model[x].as_long(), 8) for x in xs]))
