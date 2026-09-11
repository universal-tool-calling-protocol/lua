# Lua UTCP website

A responsive landing page and searchable guide for lua-utcp, adapted from the
Ruby UTCP website. The site uses Lua examples and a blue moon-and-orbit identity.

## Develop

With Node.js 20 or newer, run from the SDK repository root:

```sh
npm run dev
```

Open http://127.0.0.1:5173. No npm dependencies need to be installed.
Use `npm run dev -- --port 5175` to select a different port.
The same commands also work from this `website/` directory.

## Check, build, and preview

```sh
npm run check
npm run build
npm run preview
```

The build writes only public website files to `website/dist/`. Deploy that
directory to a static host. Relative links and assets work at a domain root
or under a path such as `/lua-utcp/`. The included server is for local
development and preview. Publishing is a separate step.

## Content

- `index.html`: landing page and interactive transport explorer.
- `docs.html`: documentation shell with shareable topic URLs.
- `data.js`: Lua examples, transport manuals, and documentation content.
- `app.js`: keyboard-accessible tabs, copy buttons, mobile menu, and search.
- `styles.css`: reference layout adapted to Lua branding and screen sizes.
- `assets/lua-utcp-logo.svg`: original transparent vector logo.
- `examples/hello.lua`: downloadable local example with no server dependency.
- `check.mjs`: local link, topic, manual, and example consistency checks.

Search opens with the header button or Command/Ctrl+K. Arrow keys navigate
results and tabs, Enter follows a result, and Escape closes search or navigation.
Transport examples offer Manual, Lua, and CodeMode views with copy controls.
They are reference snippets and do not execute in the browser.

The content reflects the checked-in lua-utcp 1.8 rockspec and APIs. It documents
Lua 5.3/5.4 support, the MPL-2.0 license, file-backed Text tools, buffered HTTP
event callbacks, the host-side CodeMode streaming API, gRPC descriptors, and
the host-provided WebRTC adapter. Network examples need the indicated demo
server or user-configured endpoints. The website does not handle API keys.

DM Sans and IBM Plex Mono load from Google Fonts when available, with local
system fallbacks. All other assets are local.
