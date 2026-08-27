import type { Severity } from 'ag-grid-community';

// Every diagnostic severity, for behavioural tests that dogfood `enableDevValidations` and want a
// misconfigured grid to fail the test loudly regardless of severity. Pairs with a per-test
// `suppress: [id]` for the rare diagnostic a test deliberately exercises.
export const ALL_SEVERITIES: Severity[] = ['deprecation', 'warning', 'error'];

/**
 * Everything a `console` spy recorded, as one string with the doc links dropped. Every diagnostic ends with
 * a link carrying `&colId=`, `&type=` and `&displayKey=`, so a check that the message names one of those is
 * satisfied by the link alone unless it is removed first.
 */
export const messagesFrom = (spy: { mock: { calls: any[][] } }): string =>
    spy.mock.calls
        .flat()
        .join(' ')
        .replace(/https?:\/\/\S+/g, '');
