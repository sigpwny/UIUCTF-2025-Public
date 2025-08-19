[BuildOptions]
  # AppPkg/Applications/Lua/src/ldo.c: In function 'luaD_throw':
  # AppPkg/Applications/Lua/src/ldo.c:122:1: error: 'noreturn' function does return [-Werror]
  #  122 | }
  #      | ^
  GCC:*_*_*_CC_FLAGS = -Wno-error
