/**
 * Tests for base repository infrastructure
 */

import { RepositoryError } from "../base";

describe("RepositoryError", () => {
  it("should create error with message", () => {
    const error = new RepositoryError("Test error");
    expect(error.message).toBe("Test error");
    expect(error.name).toBe("RepositoryError");
  });

  it("should store error code and status", () => {
    const error = new RepositoryError("Test error", "TEST_CODE", 404);
    expect(error.code).toBe("TEST_CODE");
    expect(error.statusCode).toBe(404);
  });

  it("should check error type with is()", () => {
    const error = new RepositoryError("Test error", "NOT_FOUND", 404);
    expect(error.is("NOT_FOUND")).toBe(true);
    expect(error.is("OTHER_ERROR")).toBe(false);
  });

  it("should store error details", () => {
    const details = { field: "value", nested: { data: 123 } };
    const error = new RepositoryError("Test error", "CODE", 500, details);
    expect(error.details).toEqual(details);
  });

  describe("fromResponse", () => {
    it("should create error from JSON response", async () => {
      const mockResponse = {
        ok: false,
        status: 422,
        json: jest.fn().mockResolvedValue({
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          validationErrors: [{ field: "name", message: "Required" }],
        }),
        text: jest.fn(),
      } as unknown as Response;

      const error = await RepositoryError.fromResponse(mockResponse, "Fallback message");

      expect(error.message).toBe("Validation failed");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.statusCode).toBe(422);
      expect(error.details).toHaveProperty("validationErrors");
    });

    it("should use fallback message if no error in response", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn(),
      } as unknown as Response;

      const error = await RepositoryError.fromResponse(mockResponse, "Fallback message");

      expect(error.message).toBe("Fallback message");
      expect(error.statusCode).toBe(500);
    });

    it("should handle non-JSON responses", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error("Not JSON")),
        text: jest.fn().mockResolvedValue("Plain text error"),
      } as unknown as Response;

      const error = await RepositoryError.fromResponse(mockResponse, "Fallback message");

      // When JSON parsing fails, it uses text as the error message
      expect(error.message).toBe("Plain text error");
      expect(error.details).toEqual({ error: "Plain text error" });
    });
  });
});
