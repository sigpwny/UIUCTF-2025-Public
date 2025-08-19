import copy
import random

O = ([
    [
        [1, 1],
        [1, 1],
    ],
], [(2, 0), (2, 1), (3, 0), (3, 1)])
Z = ([
    [
        [1, 1, 0],
        [0, 1, 1],
    ], [
        [0, 1],
        [1, 1],
        [1, 0],
    ],
], [(1, 0), (2, 0), (2, 1), (3, 1)])
S = ([
    [
        [0, 1, 1],
        [1, 1, 0],
    ], [
        [1, 0],
        [1, 1],
        [0, 1],
    ],
], [(1, 1), (2, 1), (2, 0), (3, 0)])
T = ([
    [
        [0, 1, 0],
        [1, 1, 1],
    ], [
        [1, 1, 1],
        [0, 1, 0],
    ], [
        [1, 0],
        [1, 1],
        [1, 0],
    ], [
        [0, 1],
        [1, 1],
        [0, 1],
    ]
], [(1, 0), (2, 0), (3, 0)])
J = ([
    [
        [1, 0, 0],
        [1, 1, 1],
    ], [
        [1, 1, 1],
        [0, 0, 1],
    ], [
        [0, 1],
        [0, 1],
        [1, 1],
    ], [
        [1, 1],
        [1, 0],
        [1, 0],
    ],
], [(1, 0), (2, 0), (3, 0)])
I = ([
    [
        [1, 1, 1, 1],
    ], [
        [1],
        [1],
        [1],
        [1],
    ],
], [(2, 0), (2, 1)])
L = ([
    [
        [1, 1, 1],
        [1, 0, 0],
    ], [
        [0, 0, 1],
        [1, 1, 1],
    ], [
        [1, 1],
        [0, 1],
        [0, 1],
    ], [
        [1, 0],
        [1, 0],
        [1, 1],
    ],
], [(1, 0), (2, 0), (3, 0)])

WIDTH = 5
HEIGHT = 6

TETRO_ORDER = [O, T, J, T, L, O, S, S, S, I, O, T, T, J, L, L, O, J, L, I, I, O, L, Z, T, O, Z, I, L, J]  # , J, I]
START = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
]
TARGET = [
    [0, 1, 1, 0, 1],
    [0, 1, 1, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 0],
    [1, 1, 0, 1, 1],
    [1, 0, 1, 0, 0],
]
CONSTRAINTS = {
    15: (0, 0),
    21: (0, 0),
    27: (None, 0),
}


def main():
    print(f"{len(TETRO_ORDER)} steps")
    to_process = []
    visited_from = {}
    counts = {hashable((0, START)): 1}
    to_process.append((0, START))
    cur_step = 0
    destinations = []
    while to_process:
        # print(len(to_process))
        state = to_process.pop(0)
        step, board = state
        if cur_step < step:
            single_paths = 0
            for s in to_process:
                if counts[hashable(s)] == 1:
                    single_paths += 1
            print(f"{step}: {len(to_process)} ({single_paths})")
            cur_step = step

        # finished all moves; check board state matches target and trace moves
        if step >= len(TETRO_ORDER):
            if TARGET:
                # print(f"finished at {step}:")
                # print_board(board)
                if board == TARGET:
                    print(
                        f"reached target with {counts[hashable(state)]} paths")
                    cur_states = [state]
                    while cur_states[0][1] != START:
                        for cs in cur_states:
                            print_board(cs[1])
                            print()
                        print(f"^ {cur_states[0][0] - 1}: ({','.join(str(counts[hashable(cs)]) for cs in cur_states)})")
                        print_board(TETRO_ORDER[cur_states[0][0] - 1][0][0])
                        print()
                        cur_states = set(hashable(s) for cs in cur_states for s in visited_from[hashable(cs)])
                        cur_states = [unhashable(cs) for cs in cur_states]
                    print_board(cur_states[0][1])
            else:
                if counts[hashable(state)] == 1:
                    print("found single path to destination:")
                    print_board(unhashable(state)[1])
                    destinations.append(state)
            continue

        # constraints on placement for this step
        rot_range = TETRO_ORDER[step][0]
        x_range = range(WIDTH)
        if step in CONSTRAINTS:
            if CONSTRAINTS[step][0] is not None:
                rot_range = [TETRO_ORDER[step][0][CONSTRAINTS[step][0]]]
            if CONSTRAINTS[step][1] is not None:
                x_range = [CONSTRAINTS[step][1]]

        # try all rotations and positions
        for rot_tetro in rot_range:
            for x in x_range:
                new_board = apply_x(board, rot_tetro, x, TETRO_ORDER[step + 1][1] if step + 1 < len(TETRO_ORDER) else [])
                if new_board:
                    new_step = step + 1
                    new_state = new_step, new_board
                    hash_state = hashable(new_state)
                    if hash_state in visited_from:
                        visited_from[hash_state].append(state)
                        counts[hash_state] += counts[hashable(state)]
                        # print(f"{counts[hash_state]} collisions detected at {step}:")
                        # print_board(visited_from[hash_state][-1])
                        # print(',')
                        # print_board(board)
                        # print('v')
                        # print_board(new_board)
                    else:
                        visited_from[hash_state] = [state]
                        counts[hash_state] = counts[hashable(state)]
                        to_process.append(new_state)

    print(f"{len(destinations)} destinations")
    if destinations:
        print_board(unhashable(random.choice(destinations))[1])


def apply_x(board, tetro, x,  deny_zone):
    for y in range(HEIGHT)[::-1]:
        if can_apply_xy(board, tetro, x, y,  deny_zone):
            return apply_xy(board, tetro, x, y)


def can_apply_xy(board, tetro, x, y, deny_zone):
    for dy, row in enumerate(tetro):
        for dx, b in enumerate(row):
            x2 = x + dx
            y2 = y + dy
            if b and (x2 < 0 or y2 < 0 or y2 >= len(board) or x2 >= len(board[y2]) or board[y2][x2] or (x2, y2) in deny_zone):
                return False
    for y, row in enumerate(board):
        for x, b in enumerate(row):
            if b and (x, y) in deny_zone:
                return False
    return True


def apply_xy(board, tetro, x, y):
    board = copy.deepcopy(board)
    for dy, row in enumerate(tetro):
        for dx, b in enumerate(row):
            x2 = x + dx
            y2 = y + dy
            if b:
                board[y2][x2] = b
    while [1] * WIDTH in board:
        board.remove([1] * WIDTH)
        board = [[0] * WIDTH] + board
    return board


def print_board(board):
    for row in board:
        print(row)


def hashable(state):
    step, board = state
    board = tuple(tuple(row) for row in board)
    return step, board


def unhashable(state):
    step, board = state
    board = list(list(row) for row in board)
    return step, board


def test():
    board = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [1, 1, 1, 0, 0],
    ]
    target = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 1, 1, 0, 0],
        [1, 1, 1, 0, 0],
        [1, 1, 1, 0, 0],
    ]
    for x in range(WIDTH):
        for tetro in TETRO_ORDER[6][0]:
            new_board = apply_x(board, tetro, x)
            if new_board == target:
                print(x)
                print_board(tetro)
                print()


if __name__ == "__main__":
    main()
    # test()
