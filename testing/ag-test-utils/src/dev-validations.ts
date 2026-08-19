import type { Severity } from 'ag-grid-community';

// Every diagnostic severity, for behavioural tests that dogfood `enableDevValidations` and want a
// misconfigured grid to fail the test loudly regardless of severity. Pairs with a per-test
// `suppress: [id]` for the rare diagnostic a test deliberately exercises.
export const ALL_SEVERITIES: Severity[] = ['deprecation', 'warning', 'error'];
