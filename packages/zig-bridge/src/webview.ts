import { ZigBridge } from ".";

declare global {
  interface Window {
    fruituiNative?: {
      postMessage(message: string): void;
    };

    fruituiRecieve?: (response: unknown) => void;
  }
}

export const native = new ZigBridge((message) => {
  if (!window.fruituiNative) {
    throw new Error("FruitUI native bridge is unavailable");
  }

  window.fruituiNative.postMessage(message);
});

window.fruituiRecieve = (response) => {
  if (
    typeof response !== "object" ||
    response === null ||
    !("id" in response) ||
    typeof response.id !== "number" ||
    !Number.isSafeInteger(response.id) ||
    response.id < 1 ||
    (!("result" in response) && !("error" in response)) ||
    ("error" in response &&
      typeof response.error !== "string")
  ) {
    return;
  }

  native.recieve({
    id: response.id,
    result: "result" in response ? response.result : undefined,
    error:
      "error" in response ? (response.error as string | undefined) : undefined,
  });
};
