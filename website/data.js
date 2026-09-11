export const REPOSITORY = 'https://github.com/universal-tool-calling-protocol/lua-utcp';

export const installation = {
  luarocks: { label: '# In the cloned lua-utcp repository', command: 'luarocks make lua-utcp-1.8-1.rockspec' },
  source: { label: '# Clone the source', command: 'git clone ' + REPOSITORY + '.git' },
};

export const quickstart = `local utcp = require("utcp")

-- Connect to your tool manual
local client = assert(utcp.new({
  manual_call_templates = {{
    name = "demo",
    call_template_type = "http",
    url = "http://127.0.0.1:8080/manual"
  }}
}))
assert(client:discover())

-- Call a discovered tool
local result, err = client:call_tool(
  "demo.echo", { message = "Hello from Lua!" }
)
client:close()
assert(result ~= nil, err)
print(utcp.json.encode(result))`;

const luaValue = (value) => {
  if (Array.isArray(value)) return '{ ' + value.map(luaValue).join(', ') + ' }';
  if (value !== null && typeof value === 'object') {
    return '{ ' + Object.entries(value).map(([key, item]) => key + ' = ' + luaValue(item)).join(', ') + ' }';
  }
  return value === null ? 'nil' : JSON.stringify(value);
};

function transportExample({ type, tool = 'echo', description, properties = {}, args = {}, template, streaming = false }) {
  const manual = JSON.stringify({
    utcp_version: '1.1.0', manual_version: '1.0.0',
    tools: [{ name: tool, description,
      inputs: { type: 'object', properties, required: Object.keys(properties) },
      tool_call_template: { call_template_type: type, ...template },
    }],
  }, null, 2);
  const setup = type === 'mcp' ? [
    'local utcp = require("utcp")', '',
    '-- Discover the catalog directly from your MCP server',
    'local client = assert(utcp.new({',
    '  manual_call_templates = {{',
    '    name = "demo", call_template_type = "mcp",',
    '    url = "http://127.0.0.1:8093/mcp"',
    '  }}',
    '}))',
    'assert(client:discover())', '',
  ] : [
    'local utcp = require("utcp")', '',
    '-- Save the Manual tab as ' + type + '.manual.json',
    'local file = assert(io.open("' + type + '.manual.json", "r"))',
    'local source = file:read("*a")', 'file:close()',
    'local manual = assert(utcp.json.decode(source))', '',
    'local client = assert(utcp.new({',
    '  manual_call_templates = {{',
    '    name = "demo", call_template_type = "' + type + '",',
    '    manual = manual',
    '  }}',
    '}))', '',
  ];
  const call = '"demo.' + tool + '", ' + luaValue(args);
  const streamCall = (receiver) => [
    'local _, err = ' + receiver + '(' + call + ', function(event)',
    '  print(utcp.json.encode(event))', 'end)',
    'client:close()', 'assert(err == nil, err)',
  ];
  return {
    manual,
    code: [...setup, ...(streaming ? streamCall('client:call_tool_stream') : [
      'local result, err = client:call_tool(' + call + ')',
      'client:close()', 'assert(result ~= nil, err)', 'print(utcp.json.encode(result))',
    ])].join('\n'),
    codeMode: [...setup,
      'local codemode = utcp.codemode.new(client, {',
      '  instruction_limit = 100000', '})', '',
      ...(streaming ? [
        '-- Streaming uses the host-side CodeMode callback API',
        ...streamCall('codemode.call_tool_stream'),
      ] : [
        'local execution, err = codemode:call_tool_chain([[',
        '  return codemode.call_tool(' + call + ')', ']])',
        'client:close()', 'assert(execution, err and err.message)',
        'print(utcp.json.encode(execution.result))',
      ]),
    ].join('\n'),
    streaming,
  };
}

const message = { message: { type: 'string' } };
const hello = { message: 'Hello from Lua!' };

export const protocols = [
  {
    id: 'http', name: 'HTTP', icon: 'globe', category: 'The everyday essential',
    title: 'Your APIs, connected.',
    description: 'Describe a REST endpoint in a UTCP manual, then call it directly from Lua. The client handles request templates, JSON, and authentication.',
    tags: ['REST endpoints', 'JSON', 'Built-in auth'],
    note: 'Start the bundled echo server with make server-http.',
    ...transportExample({ type: 'http', description: 'Echo a message over HTTP.', properties: message, args: hello,
      template: { url: 'http://127.0.0.1:8080/echo', http_method: 'POST' } }),
  },
  {
    id: 'sse', name: 'SSE', icon: 'radio', category: 'Every event has a place',
    title: 'Give events a callback.',
    description: 'Consume Server-Sent Events with a Lua callback. Event names, IDs, and multi-line data are parsed, with JSON payloads decoded for you.',
    tags: ['Event callbacks', 'JSON payloads', 'Event IDs'],
    note: 'make server-sse · HTTP responses are buffered before callbacks run.',
    ...transportExample({ type: 'sse', tool: 'watch', description: 'Read a finite sequence of events.', streaming: true,
      template: { url: 'http://127.0.0.1:8090/events', timeout: 15 } }),
  },
  {
    id: 'streamable_http', name: 'Streamable HTTP', icon: 'stream', category: 'One request. Flexible responses.',
    title: 'JSON meets event streams.',
    description: 'Send a JSON request and handle either a JSON response or Server-Sent Events through the same callback API. Templates keep the request explicit.',
    tags: ['JSON requests', 'SSE responses', 'Callbacks'],
    note: 'make server-streamable · This HTTP backend buffers the response.',
    ...transportExample({ type: 'streamable_http', description: 'Send a message and handle the response.', properties: message, args: hello, streaming: true,
      template: { url: 'http://127.0.0.1:8091/call', http_method: 'POST' } }),
  },
  {
    id: 'websocket', name: 'WebSocket', icon: 'activity', category: 'A connection that stays open',
    title: 'Stay in the loop.',
    description: 'Exchange messages over persistent WebSocket connections using lua-http. Configure subprotocols, handshake headers, and JSON, text, or raw responses.',
    tags: ['Persistent connections', 'WSS', 'lua-http'],
    note: 'make server-websocket · Remote hosts require wss://.',
    ...transportExample({ type: 'websocket', description: 'Echo a JSON message over WebSocket.', properties: message, args: hello,
      template: { url: 'ws://127.0.0.1:8765', response_format: 'json', keep_alive: true } }),
  },
  {
    id: 'grpc', name: 'gRPC', icon: 'layers', category: 'A compact, typed connection',
    title: 'Meet your RPC services.',
    description: 'Call protobuf services with lua-grpc. Unary, server-streaming, client-streaming, and bidirectional methods all connect to the canonical tool registry.',
    tags: ['Protobuf', 'Four RPC shapes', 'lua-grpc'],
    note: 'Provide your service.pb descriptors, service_grpc Lua module, and server.',
    ...transportExample({ type: 'grpc', tool: 'say_hello', description: 'Call the Greeter SayHello RPC.',
      properties: { name: { type: 'string' } }, args: { name: 'Lua' },
      template: { target: '127.0.0.1:50051', insecure: true, descriptor_set_path: 'service.pb', descriptor_module: 'service_grpc', service: 'Greeter', method: 'SayHello' } }),
  },
  {
    id: 'graphql', name: 'GraphQL', icon: 'graphql', category: 'Query just what you need',
    title: 'Your schema. Your tools.',
    description: 'Map a GraphQL query or mutation to a named tool. Lua tables become GraphQL variables, and results return through the same client interface.',
    tags: ['Queries & mutations', 'Variables', 'JSON'],
    note: 'Start the bundled GraphQL server with make server-graphql.',
    ...transportExample({ type: 'graphql', tool: 'add', description: 'Add two numbers through GraphQL.',
      properties: { a: { type: 'integer' }, b: { type: 'integer' } }, args: { a: 7, b: 5 },
      template: { url: 'http://127.0.0.1:8092/graphql', query: 'query($a: Int!, $b: Int!) { add(a: $a, b: $b) }' } }),
  },
  {
    id: 'cli', name: 'CLI', icon: 'terminal', category: 'Local tools, first-class citizens',
    title: 'Put your terminal to work.',
    description: 'Make a local command a registered tool. Pass arguments through quoted placeholders, set a working directory, and receive JSON or text output.',
    tags: ['Shell commands', 'Argument templates', 'Local execution'],
    note: 'Requires a shell with printf. Only register commands you trust.',
    ...transportExample({ type: 'cli', description: 'Print a message with a local command.', properties: message, args: hello,
      template: { command: "printf '%s' UTCP_ARG_message_UTCP_END" } }),
  },
  {
    id: 'tcp', name: 'TCP', icon: 'network', category: 'Straight to the socket',
    title: 'A direct line to your tools.',
    description: 'Connect to a native TCP service with LuaSocket. Send JSON arguments and use line or length framing to match your server’s wire format.',
    tags: ['LuaSocket', 'JSON messages', 'Configurable framing'],
    note: 'Start the bundled TCP echo server with make server-tcp.',
    ...transportExample({ type: 'tcp', description: 'Echo a message over TCP.', properties: message, args: hello,
      template: { host: '127.0.0.1', port: 9000, frame: 'line', timeout: 10 } }),
  },
  {
    id: 'udp', name: 'UDP', icon: 'send', category: 'Small messages. Direct delivery.',
    title: 'Keep it lightweight.',
    description: 'Send a JSON datagram to a UDP service and read its response. A compact transport for tools that already communicate over datagrams.',
    tags: ['Datagrams', 'LuaSocket', 'JSON'],
    note: 'make server-udp · Delivery and ordering are not guaranteed by UDP.',
    ...transportExample({ type: 'udp', description: 'Echo a JSON datagram.', properties: message, args: hello,
      template: { host: '127.0.0.1', port: 9001, timeout: 10 } }),
  },
  {
    id: 'webrtc', name: 'WebRTC', icon: 'peers', category: 'Bring your own peer connection',
    title: 'Tools, peer to peer.',
    description: 'Connect tools over a WebRTC DataChannel. Supply an existing channel or a host-specific adapter; signaling, ICE, and TURN settings pass through to it.',
    tags: ['DataChannels', 'Binding adapter', 'Peer connections'],
    note: 'my_webrtc_adapter is a placeholder for your host’s connected adapter.',
    ...transportExample({ type: 'webrtc', description: 'Echo a message over a DataChannel.', properties: message, args: hello,
      template: { webrtc_module: 'my_webrtc_adapter', data_channel_label: 'utcp', response_format: 'json', timeout: 15 } }),
  },
  {
    id: 'mcp', name: 'MCP', icon: 'connect', category: 'Make your existing tools at home',
    title: 'Your MCP tools, too.',
    description: 'Discover an MCP server’s catalog through JSON-RPC over HTTP. The client maps those tools into the UTCP registry, ready for normal Lua and CodeMode calls.',
    tags: ['JSON-RPC', 'HTTP', 'Tool discovery'],
    note: 'make server-mcp · Lua examples initialize and discover the server directly.',
    ...transportExample({ type: 'mcp', description: 'Call an MCP echo tool.', properties: message, args: hello,
      template: { url: 'http://127.0.0.1:8093/mcp', name: 'echo' } }),
  },
  {
    id: 'text', name: 'Text', icon: 'file', category: 'Sometimes a file is all you need',
    title: 'A file becomes a tool.',
    description: 'Read a local file through the same registry as your network tools. JSON is decoded automatically; other content is returned as text. No server required.',
    tags: ['Local files', 'JSON or text', 'No server'],
    note: 'Create greeting.json with {"message":"Hello from Lua!"} beside the script.',
    ...transportExample({ type: 'text', tool: 'greeting', description: 'Read a greeting from a local file.',
      template: { path: 'greeting.json' } }),
  },
];

export const localExample = `local utcp = require("utcp")

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
print(result.message) -- Hello from Lua!`;

export const docs = [
  {
    id: 'quickstart', name: 'Quick start', icon: 'code',
    description: 'Make your first Lua tool call, without a server.',
    keywords: 'start hello example local text file require client call_tool',
    intro: 'A little Lua is all it takes. Register a tool, make a call, and get a result through the same API you’ll use for every transport.',
    blocks: [
      { type: 'heading', title: 'Your first tool call' },
      { type: 'paragraph', text: 'First <a href="./docs.html?topic=installation">install lua-utcp</a>. Save this example as <code>hello.lua</code> and run it with your Lua 5.3 or 5.4 interpreter. It creates a temporary JSON file, registers a text tool, reads the result, and cleans up.' },
      { type: 'code', label: 'hello.lua', code: localExample },
      { type: 'paragraph', text: '<a href="./examples/hello.lua" download>Download hello.lua ↗</a>' },
      { type: 'heading', title: 'Connect a service' },
      { type: 'paragraph', text: 'In the SDK repository, run <code>make server-http</code> in a second terminal. This example discovers its manual and calls the echo endpoint. Replace the URL and tool name to connect your own service.' },
      { type: 'code', label: 'app.lua', code: quickstart },
      { type: 'callout', title: 'One registry, many transports', text: 'Tools use a qualified <code>manual.tool</code> name. An unqualified name also works when it identifies exactly one tool.' },
    ],
  },
  {
    id: 'installation', name: 'Installation', icon: 'terminal',
    description: 'Install lua-utcp with LuaRocks or work from source.',
    keywords: 'install luarocks source dependencies lua 5.3 5.4 5.5 mac homebrew rockspec',
    intro: 'Use Lua 5.3 or 5.4 and LuaRocks to build the checked-in rockspec and install its dependencies.',
    blocks: [
      { type: 'heading', title: 'Clone and install' },
      { type: 'code', label: 'Terminal', code: `git clone ${REPOSITORY}.git\ncd lua-utcp\nluarocks make lua-utcp-1.8-1.rockspec` },
      { type: 'paragraph', text: 'The rockspec installs LuaSocket, lua-cjson, lua-http, and lua-grpc. The JSON layer also supports dkjson. WebRTC needs a DataChannel adapter supplied by your host.' },
      { type: 'callout', title: 'Choose a supported interpreter', text: 'Lua 5.5 is not supported by this dependency chain. If several Lua versions are installed, select the Lua 5.3 or 5.4 tree explicitly and run examples with that same interpreter.' },
      { type: 'heading', title: 'Apple Silicon with Homebrew Lua 5.4' },
      { type: 'code', label: 'Terminal · from the cloned repository', code: 'LUA54_PREFIX=/opt/homebrew/opt/lua@5.4\nluarocks --lua-version=5.4 --lua-dir="$LUA54_PREFIX" make lua-utcp-1.8-1.rockspec\n"$LUA54_PREFIX/bin/lua" hello.lua' },
      { type: 'heading', title: 'Work from source' },
      { type: 'paragraph', text: 'The Makefile adds the repository’s Lua modules and the active LuaRocks tree to the module path. Install the dependencies first, then run the checks with your supported interpreter.' },
      { type: 'code', label: 'Terminal', code: 'make test\nmake examples-local\n# If Lua 5.4 is not your default:\nmake test LUA=/opt/homebrew/opt/lua@5.4/bin/lua' },
    ],
  },
  {
    id: 'discovery', name: 'Discovery & registry', icon: 'scan',
    description: 'Register manuals, discover providers, and search tools.',
    keywords: 'discovery registry manual provider register_manual search_tools list_tools qualified names',
    intro: 'A UTCP manual describes what a tool does, the arguments it accepts, and the native transport that calls it.',
    blocks: [
      { type: 'heading', title: 'Discover a provider' },
      { type: 'code', label: 'discovery.lua', code: `local utcp = require("utcp")
local client = assert(utcp.create({
  manual_call_templates = {{
    name = "demo", call_template_type = "http",
    url = "http://127.0.0.1:8080/manual"
  }}
}))
assert(client:discover())
for _, tool in ipairs(client:list_tools()) do
  print(tool.qualified_name or tool.name)
end
local matches = client:search_tools("echo", 10)
client:close()` },
      { type: 'heading', title: 'Register a manual directly' },
      { type: 'paragraph', text: 'Use <code>client:add_manual(manual)</code> for a Lua table you own. To associate a manual with a named provider and its protocol policy, set <code>manual</code> inside a <code>manual_call_templates</code> entry. The <a href="./#protocols">transport explorer</a> has complete examples of this form.' },
      { type: 'heading', title: 'Manage the lifecycle' },
      { type: 'list', items: [
        '<code>register_manual(template)</code> and <code>register_manuals(templates)</code> discover and register manuals.',
        '<code>deregister_manual(name)</code> removes a manual and its associated tools.',
        '<code>search_tools(query, limit, tags)</code> searches the local registry.',
        '<code>client:close()</code> releases cached transport connections.',
      ] },
      { type: 'callout', title: 'Configuration compatibility', text: 'The UTCP 1.1 <code>manual_call_templates</code> form and the older <code>providers</code> key are supported. <code>utcp.migration.manual(...)</code> and <code>utcp.migration.config(...)</code> convert older field names without mutating the input.' },
    ],
  },
  {
    id: 'transports', name: 'Native transports', icon: 'route',
    description: 'Explore all twelve transports and their requirements.',
    keywords: 'protocol transport http sse websocket grpc webrtc tcp udp cli text graphql mcp streamable',
    intro: 'Keep the protocol your tool already uses. Each transport connects to the same Lua client and canonical registry.',
    blocks: [
      { type: 'paragraph', text: 'The examples use local demo servers where available. Run the listed <code>make server-*</code> command from the SDK repository, then run the Lua snippet locally. gRPC requires your generated descriptors; WebRTC requires your host’s adapter. Snippets are reference code and do not execute in this browser.' },
      { type: 'transports' },
      { type: 'callout', title: 'Streaming behavior depends on the backend', text: 'SSE and Streamable HTTP currently collect the HTTP response before delivering callbacks. Use finite responses with those backends. WebSocket, gRPC, and WebRTC provide their native stream APIs.' },
    ],
  },
  {
    id: 'codemode', name: 'CodeMode & AI agents', icon: 'code',
    description: 'Let agents compose registered tools with Lua programs.',
    keywords: 'codemode code mode llm ai agent openrouter openai sandbox chain instruction_limit',
    intro: 'Give your agent a tool catalog and a small Lua execution environment. Generated programs call registered tools through CodeMode.',
    blocks: [
      { type: 'flow', items: ['Model generates Lua', 'CodeMode executes', 'Registry resolves tools', 'Native transport calls'] },
      { type: 'heading', title: 'Compose tool calls in Lua' },
      { type: 'paragraph', text: 'This example uses the calculator tools from <code>examples/provider.json</code>. Start <code>make server-http</code>, then run it from the SDK repository.' },
      { type: 'code', label: 'chain.lua', code: `local utcp = require("utcp")
local client = assert(utcp.new("examples/provider.json"))
local codemode = utcp.codemode.new(client, {
  instruction_limit = 100000
})

local execution, err = codemode:call_tool_chain([[
  local sum = codemode.call_tool("calculator.add", {
    a = 10, b = 20
  })
  return codemode.call_tool("calculator.multiply", {
    a = sum.result, b = 3
  })
]])
client:close()
assert(execution, err and err.message)
print(utcp.json.encode(execution.result))` },
      { type: 'heading', title: 'A focused execution environment' },
      { type: 'paragraph', text: 'Generated code receives <code>codemode.call_tool</code>, catalog helpers, JSON helpers, and a subset of Lua’s standard library. <code>print</code> output is captured in <code>execution.logs</code>. The default environment does not expose <code>io</code>, <code>os</code>, or <code>require</code>.' },
      { type: 'callout', title: 'Set limits in the host', text: 'The instruction limit bounds Lua instructions, not network wait time or memory. Configure transport timeouts and a client Guard for your application. Only add trusted values through <code>opts.globals</code>.' },
      { type: 'heading', title: 'Connect an OpenRouter model' },
      { type: 'paragraph', text: 'The repository includes an integration using lua-openai. Configure your API key in your local environment, and select an OpenRouter model available to your account. The website does not request or store credentials.' },
      { type: 'code', label: 'Terminal · SDK repository', code: 'luarocks install lua-openai\nexport OPENROUTER_API_KEY="your-key"\nexport OPENROUTER_MODEL="your-model-id"\n# In a second terminal: make server-http\nmake example-openrouter-codemode' },
      { type: 'paragraph', text: `<a href="${REPOSITORY}/blob/main/examples/openrouter_codemode.lua" target="_blank" rel="noopener noreferrer">Read the complete OpenRouter example ↗</a>` },
    ],
  },
  {
    id: 'streaming', name: 'Streaming', icon: 'stream',
    description: 'Handle event callbacks and native transport streams.',
    keywords: 'stream streaming callbacks call_tool_stream call_tool_streaming sse events',
    intro: 'Receive events through a callback, with the tool name and argument table you already use for normal calls.',
    blocks: [
      { type: 'heading', title: 'Read a finite event stream' },
      { type: 'paragraph', text: 'Start <code>make server-sse</code> from the SDK repository, then run this example. The callback receives the event name, ID, decoded data, and raw data.' },
      { type: 'code', label: 'events.lua', code: `local utcp = require("utcp")
local client = assert(utcp.new({}))
assert(client:add_manual({ tools = {{
  name = "events",
  tool_call_template = {
    call_template_type = "sse",
    url = "http://127.0.0.1:8090/events"
  }
}} }))
local _, err = client:call_tool_stream("events", {}, function(event)
  print(event.event, utcp.json.encode(event.data))
end)
client:close()
assert(err == nil, err)` },
      { type: 'paragraph', text: '<code>call_tool_streaming</code> is also available as an alias. Some backends return no result on successful completion, so check the error value instead of requiring a non-nil result.' },
      { type: 'callout', title: 'HTTP response buffering', text: 'The SSE and Streamable HTTP backends buffer the response, then invoke callbacks. They are suitable for finite event responses; they do not deliver an indefinitely open HTTP stream incrementally.' },
      { type: 'heading', title: 'Streaming through CodeMode' },
      { type: 'paragraph', text: 'The host-side API exposes <code>codemode.call_tool_stream(name, args, callback)</code>. Generated programs executed by <code>call_tool_chain</code> have the narrower <code>codemode.call_tool</code> interface; the host-side stream helper is not exposed inside that environment.' },
    ],
  },
  {
    id: 'security', name: 'Security & Guard', icon: 'shield',
    description: 'Set protocol policy and evaluate calls before dispatch.',
    keywords: 'security guard allow deny review error approval hol guard protocol allowlist allowed_communication_protocols',
    intro: 'Make trust explicit. Set which protocols a manual may use and decide which calls your application will allow.',
    blocks: [
      { type: 'heading', title: 'Constrain a provider’s protocols' },
      { type: 'code', label: 'Protocol policy', code: `local utcp = require("utcp")
local client = assert(utcp.new({
  manual_call_templates = {{
    name = "tools",
    call_template_type = "http",
    url = "https://api.example.com/utcp",
    allowed_communication_protocols = {
      "http", "websocket", "grpc"
    }
  }}
}))` },
      { type: 'paragraph', text: 'Allowlist checks run during registration and again during tool calls. If the list is absent or empty, a provider may only register and call tools using its own protocol. Direct manuals without a provider are client-owned; attach a provider when you need its protocol policy.' },
      { type: 'heading', title: 'Evaluate each call with a Guard' },
      { type: 'code', label: 'Client-side Guard', code: `local utcp = require("utcp")
local client = assert(utcp.new({
  guard = {
    evaluate = function(_, call)
      if call.tool_name == "accounts.delete" then
        return { decision = "deny", reason = "Deletion is disabled" }
      end
      return "allow"
    end
  }
}))` },
      { type: 'list', items: [
        '<code>allow</code> permits dispatch. <code>deny</code> and <code>error</code> stop the call.',
        '<code>review</code> requires an application-owned <code>approve(call, verdict)</code> callback to return <code>allow</code>. Without it, no tool is dispatched.',
        'An invalid verdict or evaluator failure stops dispatch. <code>bypass_tools</code> is an exact allowlist for deliberately trusted tools.',
        '<code>utcp.guards.hol_guard</code> adapts a separately installed HOL Guard command classifier.',
      ] },
      { type: 'paragraph', text: 'Remote WebSocket endpoints require <code>wss://</code>; plain <code>ws://</code> is accepted only for literal loopback hosts. Configure endpoint credentials and transport policies to suit your deployment.' },
    ],
  },
  {
    id: 'authentication', name: 'Authentication', icon: 'key',
    description: 'Configure credentials, variables, and ownership metadata.',
    keywords: 'auth authentication token bearer oauth2 ownership static user variables dotenv api key',
    intro: 'Keep credentials in your application’s environment and inspect whether authentication belongs to the connector or the end user.',
    blocks: [
      { type: 'heading', title: 'An application-owned OAuth2 token' },
      { type: 'code', label: 'auth.lua', code: `local utcp = require("utcp")
local client = assert(utcp.new({
  providers = {{
    name = "calendar", transport = "http",
    url = "https://api.example.com/utcp",
    auth = {
      auth_type = "oauth2",
      ownership = "user",
      grant_type = "authorization_code",
      token = assert(os.getenv("CALENDAR_ACCESS_TOKEN"))
    }
  }}
}))` },
      { type: 'paragraph', text: 'HTTP, GraphQL, SSE, Streamable HTTP, and MCP apply an available OAuth2 token as a bearer header. Your application acquires, refreshes, and stores tokens.' },
      { type: 'heading', title: 'Inspect credential ownership' },
      { type: 'paragraph', text: '<code>client:auth_metadata("calendar.list_events")</code> returns effective metadata for a registered or discovered tool. Tool-level authentication overrides the provider’s block. <code>ownership</code> defaults to <code>static</code>; use <code>user</code> for per-user credentials. OAuth2 <code>grant_type</code> defaults to <code>client_credentials</code>.' },
      { type: 'heading', title: 'Load variables from a dotenv file' },
      { type: 'code', label: 'Configuration fragment', code: `load_variables_from = {{
  variable_loader_type = "dotenv",
  env_file_path = ".env",
  optional = true
}}` },
      { type: 'paragraph', text: 'Client configuration also accepts a <code>variables</code> table. Keep local credential files out of version control.' },
    ],
  },
  {
    id: 'errors', name: 'Errors & lifecycle', icon: 'activity',
    description: 'Handle failures and close native connections.',
    keywords: 'error errors result nil close cleanup lifecycle structured retryable',
    intro: 'Inspect the result and error returned by a call, and close the client when your application is finished with it.',
    blocks: [
      { type: 'heading', title: 'Handle a tool failure' },
      { type: 'code', label: 'Error handling', code: `local result, err = client:call_tool("demo.echo", {
  message = "Hello from Lua!"
})
client:close()
if err ~= nil then
  local message = type(err) == "table" and err.message or tostring(err)
  print("Tool failed:", message)
else
  print(utcp.json.encode(result))
end` },
      { type: 'paragraph', text: 'Errors may be plain strings or structured UTCP error tables. Some invalid configurations may raise a Lua error; use <code>pcall</code> at the host boundary if your application needs to catch those errors and guarantee cleanup.' },
      { type: 'heading', title: 'CodeMode execution errors' },
      { type: 'paragraph', text: 'Failed chains return a structured error with <code>stage</code>, <code>type</code>, <code>message</code>, <code>retryable</code>, captured logs, and available interfaces. Compilation failures, runtime errors, and instruction-limit failures are distinguished.' },
      { type: 'heading', title: 'Release connections' },
      { type: 'paragraph', text: 'Call <code>client:close()</code> when finished to release cached transport connections, including WebSocket, gRPC, and WebRTC sessions.' },
      { type: 'paragraph', text: `<a href="${REPOSITORY}/blob/main/README.md" target="_blank" rel="noopener noreferrer">Continue in the SDK documentation ↗</a>` },
    ],
  },
];
