import argparse
import re
import random
import string

parser = argparse.ArgumentParser()
parser.add_argument("input")
parser.add_argument("output")
args = parser.parse_args()


with open(args.input) as f:
    lines = list(f)

# pass 1: strip comments and empty lines, scrape constants and labels
constants = {}
labels = []
i = 0
while i < len(lines):
    lines[i] = re.sub(r"#.*$", "", lines[i])
    if lines[i].strip() == "":
        lines.pop(i)
        continue
    if "=" in lines[i]:
        var, val = lines[i].split("=")
        var = var.strip()
        if " " in val:
            l, r = val.strip().split(" ")
            if l not in constants:
                # constant not defined, likely not computable without yaYUL, so treat as label instead
                i += 1
                labels.append(var)
                continue
            val = constants[l] + int(r, 8)
        else:
            val = int(val.strip(), 8)
        constants[var] = val
        lines.pop(i)
        continue
    if lines[i][0] != "\t":
        labels.append(lines[i].split()[0])
    i += 1

# randomize labels
constants = {(rf"\b{k}\b" if len(k) >= 8 else rf"\b{k}\b\t?"): f"{constants[k]:o}" for k in constants}
labels = {(rf"\b{k}\b" if len(k) >= 8 else rf"\b{k}\b\t?"): "".join(random.choices(string.ascii_letters + string.digits, k=8)) for k in labels}

# pass 2: substitute instructions that require defined constants
for i in range(len(lines)):
    lines[i] = lines[i].replace("RETURN", "TC\tQ")
    lines[i] = lines[i].replace("1DNADR", "OCT")

# pass 3: inline constants and replace labels
for i in range(len(lines)):
    for k in constants:
        lines[i] = re.sub(k, constants[k], lines[i])
    for k in labels:
        lines[i] = re.sub(k, labels[k], lines[i])


with open(args.output, "w") as f:
    f.writelines(lines)
