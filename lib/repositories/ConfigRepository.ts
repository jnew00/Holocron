/**
 * Config Repository
 * Centralized data access layer for config operations
 */

import { BaseRepository, RepositoryError } from "./base";
import { Config } from "@/lib/schema/config";

/**
 * Repository for config read/write operations
 */
export class ConfigRepository extends BaseRepository {
  constructor(private readonly repoPath: string) {
    super();
  }

  /**
   * Read config (optionally decrypt with passphrase)
   */
  async read(passphrase?: string): Promise<Config> {
    try {
      const response = await this.post<{ success: boolean; config?: Config; exists?: boolean }>("/api/config/read", {
        repoPath: this.repoPath,
        passphrase: passphrase || undefined,
      });

      if (!response.config) {
        throw new RepositoryError(
          "Config not found or not decrypted",
          "CONFIG_NOT_FOUND",
          404
        );
      }

      return response.config;
    } catch (error) {
      if (error instanceof RepositoryError) {
        // Check for invalid passphrase
        if (error.statusCode === 401) {
          throw new RepositoryError(
            "Invalid passphrase",
            "INVALID_PASSPHRASE",
            401,
            error.details
          );
        }
        throw error;
      }
      throw new RepositoryError("Failed to read config", "READ_FAILED", undefined, error);
    }
  }

  /**
   * Write config (encrypted with passphrase)
   */
  async write(config: Config, passphrase: string): Promise<void> {
    try {
      await this.post("/api/config/write", {
        repoPath: this.repoPath,
        config,
        passphrase,
      });
    } catch (error) {
      if (error instanceof RepositoryError) {
        // Check for validation errors
        if (error.statusCode === 422) {
          throw new RepositoryError(
            "Invalid config structure",
            "VALIDATION_FAILED",
            422,
            error.details
          );
        }
        throw error;
      }
      throw new RepositoryError("Failed to write config", "WRITE_FAILED", undefined, error);
    }
  }

  /**
   * Check if config exists (without decrypting)
   */
  async exists(): Promise<boolean> {
    try {
      const response = await this.post<{ exists?: boolean }>("/api/config/read", {
        repoPath: this.repoPath,
      });
      return response.exists === true;
    } catch (error) {
      if (error instanceof RepositoryError && error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }
}
