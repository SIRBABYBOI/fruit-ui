import { ZigBridge } from "./src";

const bridge = new ZigBridge((message) => {
  const request = JSON.parse(message);
  console.log("Native received:", request);

  bridge.recieve({
    id: request.id,
    result: `Hello, ${request.params.name}!`,
  });
});

const result = await bridge.invoke<string>("greet", { name: "FruitUI" });
console.log("JavaScript received:", result);
