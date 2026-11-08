import { describe, expect, test } from "bun:test";
import { ZigBridge } from "./src";

describe("ZigBridge", () => {
  test("matches out-of-order responses to the right requests", async () => {
    const requests: { id: number; method: string; params: unknown }[] = [];

    const bridge = new ZigBridge((message) => {
      requests.push(JSON.parse(message));
    });

    const first = bridge.invoke<string>("first", { value: 1 });
    const second = bridge.invoke<string>("second", { value: 2 });

    expect(requests).toEqual([
      { id: 1, method: "first", params: { value: 1 } },
      { id: 2, method: "second", params: { value: 2 } },
    ]);

    bridge.recieve({ id: 2, result: "second result" });
    bridge.recieve({ id: 1, result: "first result" });

    expect(await first).toBe("first result");
    expect(await second).toBe("second result");
  });

  test("rejects a native error", async () => {
    let requestId = 0;

    const bridge = new ZigBridge((message) => {
      requestId = JSON.parse(message).id;
    });

    const result = bridge.invoke("fail", {});
    bridge.recieve({ id: requestId, error: "Something went wrong" });

    await expect(result).rejects.toThrow("Something went wrong");
  });

  test("rejects when the host does not respond", async () => {
    const bridge = new ZigBridge(() => {}, 10);

    await expect(bridge.invoke("slow", {})).rejects.toThrow(
      "Native request timed out: slow",
    );
  });

  test("rejects when the transport throws", async () => {
    const bridge = new ZigBridge(() => {
      throw new Error("Transport failed");
    });

    await expect(bridge.invoke("test", {})).rejects.toThrow("Transport failed");
  });
});
