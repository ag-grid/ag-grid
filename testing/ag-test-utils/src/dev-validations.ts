import type { ErrorId, Severity } from 'ag-grid-community';

// Every diagnostic severity, for behavioural tests that dogfood `enableDevValidations` and want a
// misconfigured grid to fail the test loudly regardless of severity. Pairs with a per-test
// `suppress: [id]` for the rare diagnostic a test deliberately exercises.
export const ALL_SEVERITIES: Severity[] = ['deprecation', 'warning', 'error'];

// The legacy filter mode warnings, for a test that exercises legacy filter mode on purpose.
export const LEGACY_FILTER_WARNING_IDS: ErrorId[] = [343, 344, 345, 346, 347, 348];
