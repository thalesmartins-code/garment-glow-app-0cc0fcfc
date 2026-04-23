/**
 * Lightweight logger that silences debug/info in production.
 * Errors and warnings are always emitted (and can be wired to Sentry later).
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.debug("[ml-sync]", payload);
 *   logger.error("[ml-sync] failed", err);
 */

const isDev = import.meta.env.DEV;

type LogArgs = unknown[];

export const logger = {
  debug: (...args: LogArgs) => {
    if (isDev) console.log(...args);
  },
  info: (...args: LogArgs) => {
    if (isDev) console.info(...args);
  },
  warn: (...args: LogArgs) => {
    console.warn(...args);
  },
  error: (...args: LogArgs) => {
    console.error(...args);
    // TODO: forward to Sentry/Logflare when configured.
  },
};