import { setTimeout as __asyncSetTimeout } from 'timers/promises';

export const asyncSetTimeout = __asyncSetTimeout;

/**
 * Missing-module errors are debounced and batched (50ms window) before being logged/captured. Await this
 * after creating a grid to let that combined error fire, before asserting on it.
 */
// eslint-disable-next-line no-restricted-syntax -- waits out the grid's 50ms missing-module report debounce window
export const waitForMissingModuleReports = () => asyncSetTimeout(60);
