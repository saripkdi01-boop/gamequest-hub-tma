import { describe, expect, it } from "vitest";
import { readGameResponse } from "./game-api";

describe("game API response parsing", () => {
  it("reads JSON success responses", async () => {
    const response = new Response(JSON.stringify({ dashboard: { ok: true } }), { status: 200, headers: { "content-type": "application/json" } });
    await expect(readGameResponse<{ dashboard: { ok: boolean } }>(response)).resolves.toEqual({ dashboard: { ok: true } });
  });

  it("turns plain text server errors into readable errors", async () => {
    const response = new Response("A server error occurred", { status: 503, headers: { "content-type": "text/plain" } });
    await expect(readGameResponse(response)).rejects.toThrow("A server error occurred");
  });

  it("does not expose HTML markup in an error", async () => {
    const response = new Response("<html><body>Gateway failure</body></html>", { status: 502, headers: { "content-type": "text/html" } });
    await expect(readGameResponse(response)).rejects.toThrow("Gateway failure");
  });

  it("rejects malformed JSON success responses", async () => {
    const response = new Response("{broken", { status: 200, headers: { "content-type": "application/json" } });
    await expect(readGameResponse(response)).rejects.toThrow("invalid response");
  });
});
