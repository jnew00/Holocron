/**
 * Lock management utilities
 * Handles session timeout and auto-lock functionality
 */

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const ACTIVITY_CHECK_INTERVAL = 10000; // 10 seconds

export interface LockConfig {
  autoLockTimeout: number; // in milliseconds
  lockOnIdle: boolean;
  warnBeforeLock: boolean;
  warnTimeMs: number; // warning time before lock
}

const DEFAULT_CONFIG: LockConfig = {
  autoLockTimeout: DEFAULT_TIMEOUT_MS,
  lockOnIdle: true,
  warnBeforeLock: true,
  warnTimeMs: 60000, // 1 minute warning
};

export class LockManager {
  private lastActivityTime: number;
  private config: LockConfig;
  private checkInterval: NodeJS.Timeout | null = null;
  private warnCallback: (() => void) | null = null;
  private lockCallback: (() => void) | null = null;
  private warningShown: boolean = false;

  constructor(config: Partial<LockConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.lastActivityTime = Date.now();
    this.setupActivityListeners();
  }

  /**
   * Start monitoring for auto-lock
   */
  start(onWarn?: () => void, onLock?: () => void): void {
    this.warnCallback = onWarn || null;
    this.lockCallback = onLock || null;
    this.lastActivityTime = Date.now();
    this.warningShown = false;

    if (this.config.lockOnIdle) {
      this.checkInterval = setInterval(() => {
        this.checkInactivity();
      }, ACTIVITY_CHECK_INTERVAL);
    }
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.removeActivityListeners();
  }

  /**
   * Update last activity timestamp
   */
  private updateActivity = (): void => {
    this.lastActivityTime = Date.now();
    this.warningShown = false;
  };

  /**
   * Setup event listeners for user activity
   */
  private setupActivityListeners(): void {
    if (typeof window === "undefined") return;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(event, this.updateActivity);
    });
  }

  /**
   * Remove activity listeners
   */
  private removeActivityListeners(): void {
    if (typeof window === "undefined") return;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.removeEventListener(event, this.updateActivity);
    });
  }

  /**
   * Check for inactivity and trigger warnings/lock
   */
  private checkInactivity(): void {
    const now = Date.now();
    const inactiveTime = now - this.lastActivityTime;

    // Check if we should lock
    if (inactiveTime >= this.config.autoLockTimeout) {
      this.triggerLock();
      return;
    }

    // Check if we should show warning
    if (
      this.config.warnBeforeLock &&
      !this.warningShown &&
      inactiveTime >= this.config.autoLockTimeout - this.config.warnTimeMs
    ) {
      this.warningShown = true;
      if (this.warnCallback) {
        this.warnCallback();
      }
    }
  }

  /**
   * Trigger the lock callback
   */
  private triggerLock(): void {
    this.stop();
    if (this.lockCallback) {
      this.lockCallback();
    }
  }

  /**
   * Manually trigger lock
   */
  lock(): void {
    this.triggerLock();
  }

  /**
   * Reset the activity timer (e.g., after user dismisses warning)
   */
  resetTimer(): void {
    this.lastActivityTime = Date.now();
    this.warningShown = false;
  }

  /**
   * Get time until lock (in milliseconds)
   */
  getTimeUntilLock(): number {
    const inactiveTime = Date.now() - this.lastActivityTime;
    const remaining = this.config.autoLockTimeout - inactiveTime;
    return Math.max(0, remaining);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LockConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): LockConfig {
    return { ...this.config };
  }
}

/**
 * Format milliseconds to human-readable time
 */
export function formatTimeRemaining(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
