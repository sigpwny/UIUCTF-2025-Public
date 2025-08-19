# generate_full_challenge.py
# Final Consolidated Script: Generates the puzzle, verifies it, solves it,
# prints the solution, and generates the final OCaml solver file.

import random
import numpy as np
import z3
from functools import reduce
from pysat.solvers import Glucose3

random.seed(48)

# --- Required libraries: pip install numpy z3-solver python-sat ---

FLAG = "sat_on_a_caml"

# =============================================================================
# 1. HELPER FUNCTIONS
# =============================================================================


def string_to_bit_list(s):
    """Converts a string to a list of boolean values (True/False)."""
    return [bit == "1" for char in s for bit in format(ord(char), "08b")]


def bit_list_to_string(b_list):
    """Converts a list of booleans back into a string."""
    s = ""
    for i in range(0, len(b_list), 8):
        byte_bits = b_list[i : i + 8]
        if len(byte_bits) < 8:
            continue
        byte_str = "".join(["1" if bit else "0" for bit in byte_bits])
        try:
            s += chr(int(byte_str, 2))
        except ValueError:
            s += "?"
    return s


def is_invertible(matrix):
    """Checks if a binary matrix is invertible over GF(2)."""
    return np.linalg.det(matrix.astype(float)) % 2 != 0


def sanitize_name(name):
    """Replaces characters invalid in OCaml type names."""
    if name.startswith("f_"):
        return "flag_" + name[2:]
    if name.startswith("k!"):
        return "aux_" + name[2:]
    return name.replace("!", "_").replace("|", "_bar_")


# =============================================================================
# 2. PUZZLE GENERATION, VERIFICATION, and CNF CONVERSION
# =============================================================================
def generate_and_convert_puzzle(flag_bits):
    """
    Creates a Z3 puzzle, verifies it's correct, and converts it to an
    in-memory CNF representation (clauses and variable map).
    """
    N = len(flag_bits)
    flag_vars = [z3.Bool(f"f_{i}") for i in range(N)]
    print(f"[*] Generating puzzle logic for {N} flag bits...")

    puzzle_matrix = None
    while puzzle_matrix is None:
        m = np.zeros((N, N), dtype=int)
        for i in range(N):
            num_terms = (
                random.randint(3, 7) if N > 7 else random.randint(2, max(2, N - 1))
            )
            indices = random.sample(range(N), num_terms)
            for j in indices:
                m[i, j] = 1
        if is_invertible(m):
            puzzle_matrix = m
    print("[+] Found an invertible matrix!")

    flag_vector = np.array([int(b) for b in flag_bits])
    key_vector = np.dot(puzzle_matrix, flag_vector) % 2
    print("[*] Calculated the key vector.")

    constraints = []
    for i in range(N):
        lhs_vars = [flag_vars[j] for j, val in enumerate(puzzle_matrix[i]) if val == 1]
        if not lhs_vars:
            continue
        lhs_expr = (
            reduce(lambda a, b: z3.Xor(a, b), lhs_vars)
            if len(lhs_vars) > 1
            else lhs_vars[0]
        )
        constraints.append(lhs_expr == bool(key_vector[i]))
    formula = z3.And(*constraints)

    solver = z3.Solver()
    solver.add(formula)
    print("\n--- Verifying Puzzle Logic ---")
    if solver.check() != z3.sat:
        print("[!] FATAL ERROR: Generated formula is unsatisfiable.")
        return None
    model = solver.model()
    print("[+] Puzzle is solvable.")
    solution_bits = [
        z3.is_true(model.evaluate(var, model_completion=True)) for var in flag_vars
    ]
    if bit_list_to_string(solution_bits) == FLAG:
        print(
            f"[+] SUCCESS: Verified that the Z3 solution decodes to the correct flag: '{FLAG}'"
        )
    else:
        print("[!] FATAL ERROR: Decoded flag does not match original.")
        return None

    # --- Verify uniqueness of the flag bit solution ---
    print("[*] Verifying the flag solution is unique...")
    # Formulate a new constraint: Or(flag_var_1 != sol_1, flag_var_2 != sol_2, ...)
    # This asks the solver: "Is there any other solution where at least one flag bit is different?"
    uniqueness_check_constraint = z3.Or(
        [var != model.evaluate(var, model_completion=True) for var in flag_vars]
    )
    solver.add(uniqueness_check_constraint)
    if solver.check() == z3.sat:
        print("[!] FATAL ERROR: Flag solution is not unique. Another solution exists.")
        # To see the other solution:
        # other_model = solver.model()
        # other_bits = [z3.is_true(other_model.evaluate(var, model_completion=True)) for var in flag_vars]
        # print(f"    Another decoded flag: '{bit_list_to_string(other_bits)}'")
        return None
    else:
        print("[+] SUCCESS: The flag bit solution is unique.")

    print("\n--- Converting to CNF and building deterministic variable map ---")
    goal = z3.Goal()
    goal.add(formula)
    tactic = z3.Tactic("tseitin-cnf")
    result = tactic(goal)
    cnf_clauses_z3 = result[0]

    def parse_z3_literal(lit):
        if z3.is_not(lit):
            return str(lit.arg(0).decl().name()), True
        else:
            return str(lit.decl().name()), False

    all_var_names = set()
    for clause in cnf_clauses_z3:
        for lit in clause.children() if z3.is_or(clause) else [clause]:
            var_name, _ = parse_z3_literal(lit)
            all_var_names.add(var_name)

    def sort_key(name):
        if name.startswith("f_"):
            return (0, int(name.split("_")[1]))
        else:
            return (1, name)

    sorted_var_names = sorted(list(all_var_names), key=sort_key)

    name_to_id_map = {name: i + 1 for i, name in enumerate(sorted_var_names)}
    print(f"[+] Built stable map with {len(name_to_id_map)} total variables.")

    clauses_int = []
    for clause in cnf_clauses_z3:
        int_clause = []
        for lit in clause.children() if z3.is_or(clause) else [clause]:
            var_name, is_negated = parse_z3_literal(lit)
            var_id = name_to_id_map[var_name]
            int_clause.append(-var_id if is_negated else var_id)
        clauses_int.append(int_clause)

    id_to_name_map = {v: k for k, v in name_to_id_map.items()}
    return clauses_int, id_to_name_map


# =============================================================================
# 3. OCAML GENERATION AND FINAL SOLVING
# =============================================================================


def process_and_output(clauses_int, id_to_name_map):
    """
    Takes the final CNF data, generates the OCaml file, solves the CNF,
    and prints the OCaml solution line.
    """
    num_total_vars = len(id_to_name_map)
    num_flag_vars = sum(1 for name in id_to_name_map.values() if name.startswith("f_"))

    # --- Generate the OCaml File ---
    all_variables = [
        sanitize_name(id_to_name_map.get(i, f"unknown_v{i}"))
        for i in range(1, num_total_vars + 1)
    ]
    int_to_sanitized_name = {
        i: all_variables[i - 1] for i in range(1, num_total_vars + 1)
    }
    parsed_clauses_str = [
        [
            (
                f"~{int_to_sanitized_name[abs(lit)]}"
                if lit < 0
                else int_to_sanitized_name[abs(lit)]
            )
            for lit in clause
        ]
        for clause in clauses_int
    ]

    constructor_mappings = generate_ocaml_file(all_variables, parsed_clauses_str)

    # --- Solve the CNF with PySAT ---
    print("\n--- Solving Final CNF with PySAT ---")
    with Glucose3(bootstrap_with=clauses_int) as solver:
        if not solver.solve():
            print("[!] The final CNF is unexpectedly unsatisfiable.")
            return

        model_set = set(solver.get_model())
        print("[+] Solved the CNF successfully.")

        # --- Verify uniqueness of the flag bit solution in CNF ---
        print("[*] Verifying the CNF flag solution is unique...")
        # Create a "blocking clause" that negates the current solution for flag bits.
        # This clause is Or(Not(var_1_val), Not(var_2_val), ...) for all flag vars,
        # which is equivalent to Not(And(var_1_val, var_2_val, ...)).
        blocking_clause = []
        for i in range(1, num_flag_vars + 1):
            if i in model_set:  # if var i was true in the model
                blocking_clause.append(-i)  # add its negation to the clause
            else:  # if var i was false
                blocking_clause.append(i)  # add its positive literal

        # Add this clause and check if another model exists.
        solver.add_clause(blocking_clause)
        if solver.solve():
            print("[!] FATAL ERROR: CNF solution for flag bits is not unique.")
            # other_model = set(solver.get_model())
            # other_flag_bits = [i in other_model for i in range(1, num_flag_vars + 1)]
            # print(f"    Another decoded flag: '{bit_list_to_string(other_flag_bits)}'")
            return
        else:
            print("[+] SUCCESS: The CNF flag bit solution is unique.")

    # --- Print the human-readable solved model ---
    print("\n--- Solved CNF Model (Snapshot) ---")
    solution_bits = [i in model_set for i in range(1, num_flag_vars + 1)]
    print(f"Decoded flag from PySAT model: '{bit_list_to_string(solution_bits)}'")
    for i in range(1, num_total_vars + 1):
        if i <= num_flag_vars or i > num_total_vars - 5:
            print(f"  - Var {i:<3} ({id_to_name_map.get(i, '?'):<5}): {i in model_set}")
        elif i == num_flag_vars + 1:
            print("  - ... (auxiliary variables) ...")

    # --- Print the OCaml Puzzle line ---
    ocaml_vals = ["T" if i in model_set else "F" for i in range(1, num_total_vars + 1)]
    ocaml_evidence = []

    for i, clause in enumerate(clauses_int):
        clause_num = i + 1
        found_evidence = False
        for j, literal in enumerate(clause):
            if literal in model_set:
                var_id = abs(literal)
                sanitized_var_name = int_to_sanitized_name[var_id]
                is_negated = literal < 0

                # Find the constructor name from our mapping
                if (
                    constructor_mappings
                    and (clause_num, sanitized_var_name, is_negated)
                    in constructor_mappings
                ):
                    constructor_name = constructor_mappings[
                        (clause_num, sanitized_var_name, is_negated)
                    ]
                    constructor = f"{constructor_name} {'F' if is_negated else 'T'}"
                else:
                    # Fallback: find which position this literal is in the sorted clause
                    clause_vars = []
                    for lit in clause:
                        v_id = abs(lit)
                        v_name = int_to_sanitized_name[v_id]
                        if v_name not in clause_vars:
                            clause_vars.append(v_name)
                    clause_vars.sort()

                    # Find constructor index
                    sorted_literals = []
                    for lit in clause:
                        v_id = abs(lit)
                        v_name = int_to_sanitized_name[v_id]
                        neg = lit < 0
                        sorted_literals.append((v_name, neg))
                    sorted_literals = sorted(list(set(sorted_literals)))

                    for idx, (v_name, neg) in enumerate(sorted_literals):
                        if v_name == sanitized_var_name and neg == is_negated:
                            constructor = (
                                f"P{clause_num}_{idx+1} {'F' if is_negated else 'T'}"
                            )
                            break

                ocaml_evidence.append(constructor)
                found_evidence = True
                break
        if not found_evidence:
            print(f"[!] FATAL ERROR building evidence for p{clause_num}.")
            return

    all_args = ocaml_vals + ocaml_evidence
    underscores = ["_" for _ in range(len(ocaml_evidence))]
    print("\n--- The OCaml 'Puzzle' line for the unique solution is: ---\n")
    print(f"Puzzle ({', '.join(ocaml_vals + underscores)})")


def generate_ocaml_file(variables, clauses, filename="main.ml"):
    """Generates the OCaml source file from parsed CNF data."""
    print(f"\n--- Generating OCaml Solver File ---")
    print(
        f"[*] Generating OCaml code with {len(variables)} meaningful variable names..."
    )

    # Create two mappings: one for puzzle definition (with flag_XXX), one for constructors (generic)
    def generate_puzzle_param_name(var_name, idx):
        """Generate type parameter names for puzzle definition: flag_XXX for flags, generic for others"""
        if var_name.startswith("flag_"):
            # Extract the flag number and format with leading zeros
            flag_num = int(var_name.split("_")[1])
            return f"flag_{flag_num:03d}"
        else:
            # For auxiliary variables, use generic names after accounting for flag variables
            # We need to offset by the number of flag variables
            num_flag_vars = sum(1 for v in variables if v.startswith("flag_"))
            aux_idx = idx - num_flag_vars
            if aux_idx < 26:
                return chr(ord("a") + aux_idx)
            else:
                return f"a{aux_idx - 25}"

    def generate_constructor_param_name(idx):
        """Generate generic type parameter names for constructors: 'a, 'b, ..., 'z, 'a1, 'a2, ..."""
        if idx < 26:
            return chr(ord("a") + idx)
        else:
            # After 'z', use 'a1, 'a2, etc.
            return f"a{idx - 25}"

    # Mapping for puzzle definition (uses flag_XXX)
    puzzle_var_to_param = {}
    for idx, var in enumerate(variables):
        puzzle_var_to_param[var] = generate_puzzle_param_name(var, idx)

    # Mapping for constructors (uses generic names)
    global_var_to_param = {}
    for idx, var in enumerate(variables):
        global_var_to_param[var] = generate_constructor_param_name(idx)

    def g_boilerplate():
        flavor = "(* Try to compile this code with `ocamlc main.ml`. *)\n(* If you wait long enough, the answer will be printed to stderr! *)"
        return f"{flavor}\n\ntype b_true\ntype b_false\ntype 'a val_t =\n  | T : b_true val_t\n  | F : b_false val_t\n"

    def g_proofs():
        proofs_code = []
        i = 0
        # Store mapping for solution generation
        constructor_mappings = {}

        for clause in clauses:
            i += 1
            clause_num = i
            clause_vars = sorted(list(set(lit.replace("~", "") for lit in clause)))

            # Use LOCAL type parameter names for each GADT ('a, 'b, 'c, 'd, etc.)
            local_param_names = []
            for idx in range(len(clause_vars)):
                if idx < 26:
                    local_param_names.append(chr(ord("a") + idx))
                else:
                    local_param_names.append(f"a{idx - 25}")

            type_params = ", ".join([f"'{name}" for name in local_param_names])
            proofs_code.append(f"type ({type_params}) p{clause_num}_t =")

            # Create mapping from clause variables to local parameters for this specific GADT
            var_to_local_param = {
                var: local_param_names[idx] for idx, var in enumerate(clause_vars)
            }

            constructors = []
            for j, lit in enumerate(sorted(list(set(clause)))):
                is_negated = lit.startswith("~")
                var = lit.replace("~", "")
                return_type_params = [
                    (
                        ("b_true" if not is_negated else "b_false")
                        if v_inner == var
                        else f"'{var_to_local_param[v_inner]}"
                    )
                    for v_inner in clause_vars
                ]
                constructor_name = f"P{clause_num}_{j+1}"
                # Store mapping for this constructor
                constructor_mappings[(clause_num, var, is_negated)] = constructor_name

                bool_type = "b_false" if (random.random() < 0.5) else "b_true"
                return_type = f"({', '.join(return_type_params)}) p{clause_num}_t"
                constructors.append(
                    f"  | {constructor_name} : {bool_type} val_t -> {return_type}"
                )
            proofs_code.append("\n".join(constructors))

        # Return both the code and the mappings
        return ("\n" + "\n".join(proofs_code), constructor_mappings)

    def g_formula():
        # Use the puzzle type parameter names for all variables
        assignments = "\n    ".join(
            [f"'{puzzle_var_to_param[v]} val_t * " for v in variables]
        )
        proofs = []
        for i, clause in enumerate(clauses):
            clause_vars = sorted(list(set(lit.replace("~", "") for lit in clause)))
            # Use the puzzle mapping for type parameters in the puzzle definition
            type_param_names = [puzzle_var_to_param[var] for var in clause_vars]
            type_params = ", ".join([f"'{name}" for name in type_param_names])
            proofs.append(f"({type_params}) p{i+1}_t *")
        if proofs:
            proofs[-1] = proofs[-1][:-2]
        return f"""\n type puzzle =\n  Puzzle :\n    {assignments}\n    {chr(10).join('    ' + p for p in proofs)}\n    -> puzzle\n"""

    def g_solver():
        return (
            f"""\nlet check (f: puzzle) = function\n  | Puzzle _ -> .\n  | _ -> ()\n"""
        )

    proofs_code, constructor_mappings = g_proofs()
    ocaml_code = g_boilerplate() + proofs_code + g_formula() + g_solver()
    with open(filename, "w") as f:
        f.write(ocaml_code)
    print(f"[*] Successfully generated OCaml solver file: '{filename}'")
    return constructor_mappings


# =============================================================================
# 4. MAIN EXECUTION
# =============================================================================
if __name__ == "__main__":
    flag_bit_list = string_to_bit_list(FLAG)
    result = generate_and_convert_puzzle(flag_bit_list)

    if result:
        cnf_clauses, id_to_name_map = result
        process_and_output(cnf_clauses, id_to_name_map)
    else:
        print("\n[!] Script finished with errors.")
