import test from "node:test";
import assert from "node:assert/strict";
import { app } from "../src/app.js";

test("health route exists", async () => {
  const server = app.listen(0);
  const { port } = server.address();
  const response = await fetch(`http://localhost:${port}/health`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
  server.close();
});
