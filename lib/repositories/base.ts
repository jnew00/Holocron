/**
 * Base repository infrastructure
 * Provides common error handling and fetch utilities
 */

/**
 * Custom error class for repository operations
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "RepositoryError";
  }

  /**
   * Check if error is a specific type
   */
  is(code: string): boolean {
    return this.code === code;
  }

  /**
   * Create from fetch response
   */
  static async fromResponse(response: Response, fallbackMessage: string): Promise<RepositoryError> {
    let details: any;
    try {
      details = await response.json();
    } catch {
      details = { error: await response.text() };
    }

    return new RepositoryError(
      details.error || fallbackMessage,
      details.code,
      response.status,
      details
    );
  }
}

/**
 * Base repository class with common fetch utilities
 */
export abstract class BaseRepository {
  /**
   * Perform a GET request
   */
  protected async get<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
      throw await RepositoryError.fromResponse(response, "GET request failed");
    }
    return response.json();
  }

  /**
   * Perform a POST request
   */
  protected async post<T>(url: string, body?: unknown): Promise<T> {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      throw await RepositoryError.fromResponse(response, "POST request failed");
    }
    return response.json();
  }

  /**
   * Perform a DELETE request
   */
  protected async delete<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw await RepositoryError.fromResponse(response, "DELETE request failed");
    }
    return response.json();
  }

  /**
   * Build URL with query parameters
   */
  protected buildUrl(path: string, params: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(path, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
    return url.toString();
  }
}
