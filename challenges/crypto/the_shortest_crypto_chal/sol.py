import heapq
from tqdm import tqdm
from collections import defaultdict

# Algorithm implemented from https://cr.yp.to/papers/sortedsums-19990928-retypeset20220327.pdf section 3
p = lambda x: x**4
q = lambda x: x**4

H = 20000

# a_vals are inputs for p
# b_vals are inputs for q
A, B = list(range(2, H)), list(range(2, H))
# Build a table for p
p_table = sorted( [(p(a), a) for a in A] )
A = [i[1] for i in p_table]

# Generates the set {(p(a)+q(b), a, b): a,b < H} in space O(H)
def p_a_plus_q_b_gen():
		# Construct heap
		heap = [(p(A[0])+q(b),0,b) for b in B]
		heapq.heapify(heap)
		while heap:
				# Step 1: Find and remove smallest element
				y, n, b = heapq.heappop(heap)
				# Step 2: Return smallest element while breaking symmetry
				if A[n] < b: yield (y,A[n],b)
				# Step 3: Insert element
				if n+1 < len(A):
						heapq.heappush(heap, (
								p(A[n+1]) - p(A[n]) + y,
								n+1,
								b
						))

# We have that N = a^4 + b^4 generated in increasing order of N
prev_N, prev_a, prev_b = None, None, None
for N, a, b in tqdm( p_a_plus_q_b_gen() , total = H**2):
		if prev_N is not None and abs(prev_N - N) == 17:
			   print(N-prev_N, prev_N, prev_a, prev_b, N, a, b); exit()
		prev_N, prev_a, prev_b = N, a, b


