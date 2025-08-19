#!/usr/bin/env python3
import re
from z3 import *


def parse_cnf_from_ocaml(filename):
    """Parse the OCaml file to extract CNF clauses."""

    # Read the file
    with open(filename, "r") as f:
        content = f.read()

    # First, parse the puzzle type to extract all variables and their order
    puzzle_pattern = re.compile(
        r"type puzzle =\s*Puzzle :\s*((?:'[a-zA-Z_0-9]+ val_t \* \s*)+)",
        re.MULTILINE | re.DOTALL,
    )
    
    puzzle_match = puzzle_pattern.search(content)
    if not puzzle_match:
        raise ValueError("Could not find puzzle type definition")
    
    # Extract all variable names from the puzzle definition
    var_names = []
    var_pattern = re.compile(r"'([a-zA-Z_0-9]+) val_t \*")
    for match in var_pattern.finditer(puzzle_match.group(1)):
        var_names.append(match.group(1))
    
    print(f"Found {len(var_names)} variables in puzzle definition")
    
    # Create mapping from generic names to actual variable names
    # The order in the puzzle definition gives us the mapping
    generic_to_actual = {}
    for i in range(len(var_names)):
        if i < 26:
            generic_name = chr(ord('a') + i)
        else:
            generic_name = f"a{i - 25}"
        generic_to_actual[generic_name] = var_names[i]
    
    # Also store reverse mapping for flag variables
    actual_to_generic = {v: k for k, v in generic_to_actual.items()}
    
    # Create Z3 boolean variables
    z3_vars = {}
    flag_vars = []
    for var_name in var_names:
        z3_vars[var_name] = Bool(var_name)
        if var_name.startswith("flag_"):
            flag_vars.append(var_name)
    
    print(f"Found {len(flag_vars)} flag variables")

    # Parse clauses - each p*_t type represents a clause
    clauses = []

    # Find all clause patterns
    clause_pattern = re.compile(
        r"type \((.*?)\) (p\d+)_t =\s*((?:\s*\| P\d+_\d+ : .*?\n)+)",
        re.MULTILINE | re.DOTALL,
    )

    for match in clause_pattern.finditer(content):
        vars_str = match.group(1)
        clause_name = match.group(2)
        constructors = match.group(3)

        # Parse the local variable names used in this GADT type definition
        clause_local_vars = []
        for var_match in re.finditer(r"'([a-zA-Z0-9]+)", vars_str):
            local_name = var_match.group(1)
            clause_local_vars.append(local_name)

        # Map local names back to actual variable names by finding the corresponding 
        # proof type usage in the puzzle definition
        clause_vars = []
        
        # Find this proof type in the puzzle definition to get the actual variable mapping
        puzzle_proof_pattern = re.compile(rf"\(([^)]+)\) {clause_name}_t \*")
        puzzle_proof_match = puzzle_proof_pattern.search(content)
        
        if puzzle_proof_match:
            puzzle_vars_str = puzzle_proof_match.group(1)
            # Extract actual variable names from puzzle definition
            actual_vars = []
            for var_match in re.finditer(r"'([a-zA-Z_0-9]+)", puzzle_vars_str):
                actual_vars.append(var_match.group(1))
            
            # The order should match: local parameters map to actual variables
            clause_vars = actual_vars[:len(clause_local_vars)]
        
        if not clause_vars:
            print(f"Warning: Could not map variables for clause {clause_name}")
            continue

        # Parse constructors to build the clause
        constructor_pattern = re.compile(
            r"\| P\d+_(\d+) : (b_true|b_false) val_t -> \((.*?)\) p\d+_t"
        )

        disjuncts = []

        for cons_match in constructor_pattern.finditer(constructors):
            cons_num = cons_match.group(1)
            bool_val = cons_match.group(2)
            params = cons_match.group(3)

            # Parse the parameters to understand the constraints
            param_list = [p.strip() for p in params.split(",")]

            conjuncts = []
            for i, param in enumerate(param_list):
                if i < len(clause_vars):
                    var_name = clause_vars[i]
                    if var_name in z3_vars:
                        if param == "b_true":
                            conjuncts.append(z3_vars[var_name])
                        elif param == "b_false":
                            conjuncts.append(Not(z3_vars[var_name]))
                        # If it's a variable reference, skip it (it's unconstrained)

            if conjuncts:
                if len(conjuncts) == 1:
                    disjuncts.append(conjuncts[0])
                else:
                    disjuncts.append(And(conjuncts))

        if disjuncts:
            if len(disjuncts) == 1:
                clauses.append(disjuncts[0])
            else:
                clauses.append(Or(disjuncts))

    return z3_vars, clauses, sorted(flag_vars)


def solve_sat(z3_vars, clauses, flag_vars):
    """Solve the SAT problem and extract the flag."""

    solver = Solver()

    # Add all clauses
    for clause in clauses:
        solver.add(clause)

    print(f"Total clauses: {len(clauses)}")
    print(f"Total flag variables: {len(flag_vars)}")

    # Check satisfiability
    if solver.check() == sat:
        print("SAT problem is satisfiable!")
        model = solver.model()

        # Extract flag bits (104 flag variables = 13 bytes)
        flag_bits = []
        for i in range(104):  # flag_000 through flag_103
            var_name = f"flag_{i:03d}"
            if var_name in z3_vars:
                bit_val = model.eval(z3_vars[var_name])
                if bit_val == True:
                    flag_bits.append("1")
                else:
                    flag_bits.append("0")
            else:
                flag_bits.append("0")  # Default to 0 if not found

        # Convert bits to ASCII (8 bits per character)
        flag = ""
        for i in range(0, len(flag_bits), 8):
            byte_bits = "".join(flag_bits[i : i + 8])
            if len(byte_bits) == 8:
                char_val = int(byte_bits, 2)
                if 32 <= char_val <= 126:  # Printable ASCII
                    flag += chr(char_val)
                else:
                    flag += f"\\x{char_val:02x}"

        print(f"\nFlag: {flag}")

        # Also print the raw bit string
        print(f"\nRaw bits: {''.join(flag_bits)}")

    else:
        print("SAT problem is unsatisfiable!")


def main():
    print("Parsing OCaml SAT solver...")
    z3_vars, clauses, flag_vars = parse_cnf_from_ocaml("main.ml")

    print("\nSolving SAT problem with Z3...")
    solve_sat(z3_vars, clauses, flag_vars)


if __name__ == "__main__":
    main()