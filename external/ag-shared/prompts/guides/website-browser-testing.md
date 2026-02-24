---
targets: ['*']
description: 'Chrome DevTools MCP browser testing workflow for AG product websites'
globs:
    [
        '**/src/pages/**/*.astro',
        '**/src/layouts/**/*.astro',
    ]
---

# Website Browser Testing Guide

Use Chrome DevTools MCP for browser testing and debugging AG product websites.

## Available Tools

| Tool | Purpose |
|------|---------|
| `mcp__chrome-devtools__browser_navigate` | Navigate to URL |
| `mcp__chrome-devtools__browser_snapshot` | Get accessibility tree snapshot |
| `mcp__chrome-devtools__browser_click` | Click elements |
| `mcp__chrome-devtools__browser_type` | Type text into elements |
| `mcp__chrome-devtools__browser_take_screenshot` | Capture screenshot |
| `mcp__chrome-devtools__browser_console_messages` | Get console messages with stack traces |
| `mcp__chrome-devtools__browser_network_requests` | Analyse network requests |
| `mcp__chrome-devtools__browser_evaluate` | Execute JavaScript |
| `mcp__chrome-devtools__browser_performance_record` | Record performance trace |
| `mcp__chrome-devtools__browser_emulate` | Emulate devices/network conditions |

## Testing Workflow

### 1. Start Development Server

```bash
yarn nx dev
```

The dev server port is product-specific. Use `yarn nx dev` to start the server and check the output for the local URL.

### 2. Navigate to Page

```
mcp__chrome-devtools__browser_navigate url="http://localhost:<port>/my-page"
```

### 3. Check Console for Errors

```
mcp__chrome-devtools__browser_console_messages
```

### 4. Analyse Network Requests

```
mcp__chrome-devtools__browser_network_requests
```

### 5. Test Interactions

```
mcp__chrome-devtools__browser_click element="button with text 'Submit'"
mcp__chrome-devtools__browser_type element="email input" text="test@example.com"
```

### 6. Execute JavaScript

```
mcp__chrome-devtools__browser_evaluate expression="document.querySelector('h1').textContent"
```

## Testing Checklist

- [ ] Page loads without console errors
- [ ] Content renders correctly
- [ ] Dark mode toggle works
- [ ] Responsive layout works
- [ ] Interactive components function
- [ ] Links navigate correctly
- [ ] Header/footer display properly
- [ ] No network errors

## Device Emulation

Test responsive layouts:

```
mcp__chrome-devtools__browser_emulate device="iPhone 14 Pro"
mcp__chrome-devtools__browser_emulate device="iPad"
```
