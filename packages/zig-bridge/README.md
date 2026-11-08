# @fruitui/zig-bridge

The bridge connects JavaScript running in a WebView to a native host using request and response messages. Import `native` from `@fruitui/zig-bridge/webview` and call `await native.invoke(method, params)`; handle rejected promises for host errors, missing transport, and timeouts.

## Host contract

The host exposes `window.fruituiNative.postMessage(message)` in the WebView. The argument is a JSON string, for example:

```json
{"id":1,"method":"greet","params":{"name":"FruitUI"}}
```

The host parses the request, performs the method, and calls the JavaScript function `window.fruituiRecieve` with an **object**, using the same ID:

```js
window.fruituiRecieve({ id: 1, result: "Hello, FruitUI!" });
// Or, on failure:
window.fruituiRecieve({ id: 1, error: "Method failed" });
```

IDs are positive safe integers. A response must include `result` or a string `error`; if both are present, the error wins. Invalid responses and unknown IDs are ignored. The result can be any JavaScript value the host can deliver. Requests time out after 10 seconds by default. `recieve` and `fruituiRecieve` are spelled this way in the current API.

The WebView entry point requires `window` at import time. In an ordinary browser without the host transport, `native.invoke` rejects with `FruitUI native bridge is unavailable`. For a custom transport or a different timeout, import `ZigBridge` from `@fruitui/zig-bridge` and pass a transport function and optional timeout in milliseconds to its constructor.

Run the simulated-host tests from the repository root with `bun test packages/zig-bridge`. These do not replace testing against a real Zig host and WebView.
