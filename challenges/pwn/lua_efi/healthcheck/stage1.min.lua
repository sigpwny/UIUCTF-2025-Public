function addr_of(x)return load(string.dump(function(...)for n=...,...,0 do return n end end):gsub("\x21","\x17",1))(x)*2^1000*2^74 end
function make_CClosure(f)
local function b(n)local t={} for i=1,8 do local b=n%256;t[i]=string.char(b);n=(n-b)/256;end;return table.concat(t);end
local u=load(string.dump(function(...)local m;(function(f,x)(function(f)m=f end)(f)m=x end)(...)end):gsub("(m\x00\x01\x00\x00\x00\x01)\x00","%1\x01",1))
local c=coroutine.wrap(function()end)
local a=b(addr_of("\x00\x00\x00\x00\x00\x00\x00\x00")-16)..b(addr_of(b(addr_of(c)+24))+8)
u((addr_of(a))*2^-1000*2^-74,f*2^-1000*2^-74)
return c
end
