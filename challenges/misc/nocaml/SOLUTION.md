# nocaml Solution

## Challenge Overview
The challenge provides an OCaml REPL that restricts access to the standard library. The goal is to read the flag from `flag.txt` despite not having access to standard file I/O functions.

## Solution
The key insight is that OCaml allows binding to external C functions using the `external` keyword. Even though the standard library is restricted, we can still declare and use external functions that are built into the OCaml runtime.

The OCaml runtime provides a function `caml_sys_system_command` that executes shell commands. We can bind to this function and use it to read the flag.

### Exploit Code
```ocaml
external command : string -> int = "caml_sys_system_command";;
let _ = command "cat flag.txt"
```
