import { afterAll, describe, expect, test } from "bun:test";

const originalWindow = globalThis.window;
const fakeWindow = {} as Window & typeof globalThis;
globalThis.window = fakeWindow;
const { native } = await import("./src/webview");

afterAll(() => {
  if (originalWindow === undefined) {
    Reflect.deleteProperty(globalThis, "window");
  } else {
    globalThis.window = originalWindow;
  }
});

describe("webview transport", () => {
  test("rejects clearly when no native transport is present", async () => {
    await expect(native.invoke("test", {})).rejects.toThrow(
      "FruitUI native bridge is unavailable",
    );
  });

  test("ignores malformed messages and resolves a valid response", async () => {
    let id = 0;
    fakeWindow.fruituiNative = {
      postMessage(message) {
        id = JSON.parse(message).id;
      },
    };
    let settled = false;
    const result = native.invoke<string>("test", {}).then((value) => {
      settled = true;
      return value;
    });

    for (const response of [
      null, [], {}, { id: String(id), result: "bad" },
      { id: NaN, result: "bad" }, { id: 0, result: "bad" },
      { id, error: 123 }, { id }, { id, error: undefined },
    ]) {
      fakeWindow.fruituiRecieve!(response);
    }
    await Promise.resolve();
    expect(settled).toBe(false);

    fakeWindow.fruituiRecieve!({ id, result: "success" });
    expect(await result).toBe("success");
    delete fakeWindow.fruituiNative;
  });

  test("forwards a valid native error", async () => {
    fakeWindow.fruituiNative = {
      postMessage(message) {
        const { id } = JSON.parse(message);
        fakeWindow.fruituiRecieve!({ id, error: "Host failed" });
      },
    };
    await expect(native.invoke("test", {})).rejects.toThrow("Host failed");
    delete fakeWindow.fruituiNative;
  });
});
