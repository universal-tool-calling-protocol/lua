local utcp = require("utcp")

-- Create a local tool response; no server needed
local path = os.tmpname()
local file = assert(io.open(path, "w"))
file:write('{"message":"Hello from Lua!"}')
file:close()

local client = assert(utcp.new({}))
assert(client:add_manual({ tools = {{
  name = "greeting",
  description = "Read a local greeting",
  inputs = { type = "object" },
  tool_call_template = {
    call_template_type = "text", path = path
  }
}} }))

local result, err = client:call_tool("greeting", {})
client:close()
os.remove(path)
assert(result ~= nil, err)
print(result.message) -- Hello from Lua!
