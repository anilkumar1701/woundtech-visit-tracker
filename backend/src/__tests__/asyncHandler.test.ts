import { describe, expect, it, vi } from "vitest";
import { asyncHandler } from "../utils/asyncHandler";

// Small helper: asyncHandler's wrapper doesn't return the inner promise, so
// tests need a tick for the .catch(next) to have run before asserting.
const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("asyncHandler", () => {
  it("calls the wrapped handler and leaves next() untouched on success", async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const next = vi.fn();

    asyncHandler(handler)({} as any, {} as any, next);
    await flush();

    expect(handler).toHaveBeenCalledOnce();
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards a rejected promise to next(err) instead of throwing", async () => {
    const error = new Error("boom");
    const handler = vi.fn().mockRejectedValue(error);
    const next = vi.fn();

    asyncHandler(handler)({} as any, {} as any, next);
    await flush();

    expect(next).toHaveBeenCalledWith(error);
  });
});
