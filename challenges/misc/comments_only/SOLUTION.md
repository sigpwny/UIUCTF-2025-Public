# Comments Only - Solution

## Challenge

Python sandbox that accepts single-line input, prepends `#`, and strips newlines/carriage returns before execution.

## Exploit

Create a zip file with a `__main__.py`. Submit the bytes of that file. The python runtime will notice this zip file and execute the `__main__.py` file. The zip file must not have newlines.

## Files

- [`solution.py`](healthcheck/solution.py) - The exploit
- [`create_solution.py`](create_solution.py) - Generator script
