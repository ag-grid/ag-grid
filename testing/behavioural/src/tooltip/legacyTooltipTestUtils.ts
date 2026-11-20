import { ALL_SEVERITIES } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import { enableDevValidations } from 'ag-grid-community';

const LEGACY_TOOLTIP_PROPERTIES = ['`tooltipField`', '`tooltipValueGetter`', '`headerTooltipValueGetter`'];

let warnSpy: MockInstance<typeof console.warn> | undefined;
let allowedWarningIds: number[] = [];

function isLegacyTooltipDeprecation(args: unknown[]): boolean {
    const message = args.map(String).join(' ');
    return message.includes('warning #306') && LEGACY_TOOLTIP_PROPERTIES.some((property) => message.includes(property));
}

function isAllowedWarning(args: unknown[], ids: number[]): boolean {
    const message = args.map(String).join(' ');
    return ids.some((id) => message.includes(`warning #${id}`));
}

/** Allows explicit legacy API coverage without hiding unrelated console diagnostics, plus any `extraWarningIds`. */
export function allowLegacyTooltipProperties(extraWarningIds: number[] = []): void {
    allowedWarningIds = extraWarningIds;
    enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [306, ...extraWarningIds] });
    warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
}

/** Restores warning output and fails when compatibility coverage emitted an unrelated warning. */
export function resetLegacyTooltipProperties(): void {
    const currentWarnSpy = warnSpy;
    warnSpy = undefined;
    const allowed = allowedWarningIds;
    allowedWarningIds = [];

    if (!currentWarnSpy) {
        return;
    }

    const unexpectedWarnings = currentWarnSpy.mock.calls.filter(
        (args) => !isLegacyTooltipDeprecation(args) && !isAllowedWarning(args, allowed)
    );
    currentWarnSpy.mockRestore();
    expect(unexpectedWarnings).toEqual([]);
}
