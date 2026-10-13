/**
 * Global status management composable
 * Ensures consistent status colors and icons across all components
 */

// Status string constants
export const StatusStrings = {
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING', 
  COMPLETED: 'COMPLETED',
  SUCCESS: 'SUCCESS',
  STOPPED: 'STOPPED',
  FAILED: 'FAILED',
  YAML_ERROR: 'YAML_ERROR',
  PENDING: 'PENDING',
  // Deployment specific
  DRAFT: 'DRAFT',
  ERROR: 'ERROR',
  STARTING: 'STARTING',
  STOPPING: 'STOPPING',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  ARCHIVED: 'ARCHIVED',
  // Endpoint specific
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  UNKNOWN: 'UNKNOWN',
  LOADING: 'LOADING'
} as const

// Numeric states (0-3)
export const States = {
  QUEUED: 0,
  RUNNING: 1,
  COMPLETED: 2,
  STOPPED: 3
} as const

export type StatusTone = 'live' | 'warn' | 'ok' | 'danger' | 'neutral'

const TONES: Record<string, StatusTone> = {
  // Up and serving right now.
  RUNNING: 'live',
  ACTIVE: 'live',
  ONLINE: 'live',

  QUEUED: 'warn',
  DRAFT: 'warn',
  STARTING: 'warn',
  PENDING: 'warn',
  WAITING: 'warn',
  INIT: 'warn',
  RESTARTING: 'warn',
  LOADING: 'warn',

  // Finished cleanly.
  COMPLETED: 'ok',
  SUCCESS: 'ok',
  FINISHED: 'ok',

  FAILED: 'danger',
  ERROR: 'danger',
  YAML_ERROR: 'danger',
  INSUFFICIENT_FUNDS: 'danger',

  // Deliberately not running.
  STOPPED: 'neutral',
  STOPPING: 'neutral',
  ARCHIVED: 'neutral',
  INACTIVE: 'neutral',
  OFFLINE: 'neutral'
}

export function getStatusTone(status: string | number): StatusTone {
  return TONES[normalizeStatus(status)] ?? 'neutral'
}

const TONE_CLASSES: Record<StatusTone, string> = {
  live: 'is-info',
  ok: 'is-success',
  warn: 'is-warning',
  danger: 'is-danger',
  neutral: 'is-dark'
}

/**
 * Get consistent status CSS class for any status (string or number)
 */
export function getStatusClass(status: string | number): string {
  return TONE_CLASSES[getStatusTone(status)]
}

/**
 * Get human-readable status text
 */
export function getStatusText(status: string | number): string {
  // Handle numeric states
  if (typeof status === 'number') {
    switch (status) {
      case 0: return 'Queued'
      case 1: return 'Running'
      case 2: return 'Completed'
      case 3: return 'Stopped'
      default: return 'Unknown'
    }
  }

  // Handle string statuses - return as-is with proper casing
  const statusStr = status?.toString() || 'Unknown'
  return statusStr.charAt(0).toUpperCase() + statusStr.slice(1).toLowerCase()
}

/**
 * Normalize any status to standard string format
 */
export function normalizeStatus(status: string | number): string {
  if (typeof status === 'number') {
    switch (status) {
      case 0: return StatusStrings.QUEUED
      case 1: return StatusStrings.RUNNING  
      case 2: return StatusStrings.COMPLETED
      case 3: return StatusStrings.STOPPED
      default: return 'UNKNOWN'
    }
  }
  
  return status?.toString().toUpperCase() || 'UNKNOWN'
}

/**
 * Check if a status represents an active/running state
 */
export function isActiveStatus(status: string | number): boolean {
  const normalized = normalizeStatus(status)
  return [
    StatusStrings.RUNNING,
    StatusStrings.PENDING,
    StatusStrings.STARTING
  ].includes(normalized as any)
}

/**
 * Check if a status represents a completed state
 */
export function isCompletedStatus(status: string | number): boolean {
  return getStatusTone(status) === 'ok'
}

/**
 * Check if a status represents an error state
 */
export function isErrorStatus(status: string | number): boolean {
  return getStatusTone(status) === 'danger'
}

/**
 * Main composable export
 */
export function useStatus() {
  return {
    getStatusClass,
    getStatusTone,
    getStatusText,
    normalizeStatus,
    isActiveStatus,
    isCompletedStatus,
    isErrorStatus,
    StatusStrings,
    States
  }
}
