import { setTimeout as asyncSetTimeout } from 'timers/promises';
import { expect } from 'vitest';

import type { GridApi, IRowNode, RowNode } from 'ag-grid-community';
import { ROOT_NODE_ID } from 'ag-grid-community';

import { unindentText } from '../string-utils';
import type { GridRows } from './gridRows';
import type { GridRowsOptions } from './gridRowsOptions';
import type { GridRowsErrors } from './rows-validation/gridRowsErrors';
import { recordSnapshotMismatch } from './snapshot-updater';

/** Adds the diagram text to a vitest assertion error so it appears in test output. */
export function addDiagramToError(
    error: any,
    diagram: string | null | undefined,
    label: string | null | undefined
): void {
    if (typeof error !== 'object' || error === null) {
        return;
    }

    const diagramText = (label ? '\n⬢ ' + label : '') + (diagram ? '\n\n' + diagram : '');
    error.message = (error.message ?? '') + diagramText;

    if (typeof error.toJSON === 'function') {
        const oldToJSON = error.toJSON;
        Reflect.defineProperty(error, 'toJSON', {
            value: function (this: any, ...args: any[]) {
                const json = oldToJSON.call(this, ...args);
                if (typeof json === 'object' && json !== null && typeof json.diff === 'string') {
                    json.diff += diagramText;
                }
                return json;
            },
            configurable: true,
            writable: true,
            enumerable: false,
        });
    }
}

/** Shared snapshot-check protocol that GridRows.check() and GridColumns.checkColumns() implement.
 *  Standardises retry, validator-error throwing, and snapshot-mismatch recording across the two. */
export type SnapshotCheckMethodName = 'check' | 'checkColumns' | 'checkFilterDom';

export interface SnapshotCheckTarget {
    readonly label: string;
    readonly methodName: SnapshotCheckMethodName;
    /** Identity of the source-code method, used for stack-trace capture by the snapshot updater. */
    readonly methodRef: (...args: any[]) => any;
    rebuild(): SnapshotCheckTarget;
    loadErrors(): void;
    hasErrors(): boolean;
    makeError(): any;
    makeDiagram(): string;
    /** Asserts that the empty-snapshot variant truly has nothing to render. */
    assertEmpty(): void;
    printDiagram(): void;
}

const RETRY_DELAYS_MS = [10, 50, 100] as const;
const CLASS_NAME_BY_METHOD: Record<SnapshotCheckMethodName, string> = {
    check: 'GridRows',
    checkColumns: 'GridColumns',
    checkFilterDom: 'FilterDom',
};
const UNDEFINED_SNAPSHOT_NOTICE = (method: SnapshotCheckMethodName, label: string): string => {
    return `\n❌ ${CLASS_NAME_BY_METHOD[method]}.${method}() called without a snapshot for "${label}". Run \`./behave.sh --update-grid-rows\` to generate one.\n`;
};

/** Common shape required from a GridRows/GridColumns owner; the rest of the SnapshotCheckTarget
 *  fields are derived from this in `makeSnapshotTarget`. */
export interface SnapshotCheckOwner {
    readonly label: string;
    loadErrors(): void;
    readonly errors: { readonly totalErrorsCount: number };
    makeDiagram(printArgument: false): string;
    printDiagram(): void;
}

/** Builds a SnapshotCheckTarget from an owner + the bits that genuinely vary between GridRows
 *  and GridColumns (method identity, rebuild factory, error/empty assertions). */
export function makeSnapshotTarget<TOwner extends SnapshotCheckOwner>(
    owner: TOwner,
    spec: {
        methodName: SnapshotCheckMethodName;
        methodRef: (...args: any[]) => any;
        rebuild: () => SnapshotCheckTarget;
        makeError: () => any;
        assertEmpty: () => void;
    }
): SnapshotCheckTarget {
    return {
        label: owner.label,
        methodName: spec.methodName,
        methodRef: spec.methodRef,
        rebuild: spec.rebuild,
        loadErrors: () => owner.loadErrors(),
        hasErrors: () => owner.errors.totalErrorsCount > 0,
        makeError: spec.makeError,
        makeDiagram: () => owner.makeDiagram(false),
        assertEmpty: spec.assertEmpty,
        printDiagram: () => owner.printDiagram(),
    };
}

/** Standard snapshot-check protocol: handles the snapshot-arg variants, retries transient validator
 *  errors and mismatches, records mismatches for the updater, and throws (with the latest diagram
 *  attached) once retries are exhausted. */
export async function runSnapshotCheck(
    target: SnapshotCheckTarget,
    diagramSnapshot: string | 'empty' | 'skip-snapshot' | true | undefined,
    updateMode: 'update' | 'dry' | undefined
): Promise<void> {
    if (diagramSnapshot === undefined) {
        if (updateMode) {
            // Treat undefined as an empty snapshot in update mode so the updater can fill it in.
            diagramSnapshot = '';
        } else {
            process.stderr.write(UNDEFINED_SNAPSHOT_NOTICE(target.methodName, target.label));
            diagramSnapshot = 'skip-snapshot';
        }
    }

    if (diagramSnapshot === true) {
        target.loadErrors();
        if (target.hasErrors()) {
            throw target.makeError();
        }
        target.printDiagram();
        return;
    }

    if (diagramSnapshot === 'skip-snapshot') {
        target.loadErrors();
        if (target.hasErrors()) {
            throw target.makeError();
        }
        return;
    }

    if (updateMode) {
        // Retry so transient mid-render state doesn't bake broken snapshots. On exhaustion, record
        // the mismatch first so an empty placeholder still gets filled before the validator rethrows.
        let attempt = target;
        for (let i = 0; i <= RETRY_DELAYS_MS.length; i++) {
            attempt.loadErrors();
            if (!attempt.hasErrors()) {
                break;
            }
            if (i === RETRY_DELAYS_MS.length) {
                if (diagramSnapshot !== 'empty') {
                    recordMismatchIfDifferent(attempt, diagramSnapshot);
                }
                throw attempt.makeError();
            }
            await asyncSetTimeout(RETRY_DELAYS_MS[i]);
            attempt = attempt.rebuild();
        }
        if (diagramSnapshot === 'empty') {
            attempt.assertEmpty();
            return;
        }
        recordMismatchIfDifferent(attempt, diagramSnapshot);
        return;
    }

    // Normal mode: retry on validation errors AND snapshot mismatches — both can be transient when
    // the grid is mid-render. Rebuild each retry to re-read the latest state.
    let attempt = target;
    let lastError: any;

    for (let i = 0; i <= RETRY_DELAYS_MS.length; i++) {
        attempt.loadErrors();
        if (attempt.hasErrors()) {
            lastError = attempt.makeError();
        } else {
            lastError = tryAssertSnapshot(attempt, diagramSnapshot);
        }
        if (!lastError) {
            if (i > 0) {
                process.stderr.write(
                    `${CLASS_NAME_BY_METHOD[target.methodName]} flaky ${target.methodName} detected for "${target.label}" — passed only after retrying with delays. ` +
                        `Add \`await asyncSetTimeout(N)\` before this check to avoid intermittent failures.\n`
                );
            }
            return;
        }
        if (i < RETRY_DELAYS_MS.length) {
            await asyncSetTimeout(RETRY_DELAYS_MS[i]);
            attempt = attempt.rebuild();
        }
    }

    addDiagramToError(lastError, attempt.makeDiagram(), target.label);
    Error.captureStackTrace(lastError, target.methodRef);
    throw lastError;
}

function recordMismatchIfDifferent(target: SnapshotCheckTarget, expectedSnapshot: string): void {
    const diagram = target.makeDiagram();
    if (unindentText(diagram) !== unindentText(expectedSnapshot)) {
        recordSnapshotMismatch(target.methodRef, diagram, target.label, target.methodName);
    }
}

function tryAssertSnapshot(target: SnapshotCheckTarget, expected: string | 'empty'): any {
    try {
        if (expected === 'empty') {
            target.assertEmpty();
        } else {
            const diagram = target.makeDiagram();
            expect(unindentText(diagram)).toEqual(unindentText(expected));
        }
    } catch (e) {
        return e;
    }
    return null;
}

export interface CollectedRows<TData> {
    rowNodes: RowNode<TData>[];
    displayedRows: RowNode<TData>[];
    rootRowNode: RowNode<TData> | null;
    pinnedTopRows: RowNode<TData>[];
    pinnedBottomRows: RowNode<TData>[];
    detailGridRows: Map<IRowNode<TData> | GridApi, GridRows<any>>;
}

/** Collects all row nodes, displayed rows, root nodes, pinned rows, and detail grid rows from the API. */
export function collectGridRows<TData>(
    api: GridApi<TData>,
    label: string,
    options: GridRowsOptions,
    errors: GridRowsErrors<TData>,
    GridRowsCtor: new (
        api: GridApi<any>,
        label: string,
        options: GridRowsOptions,
        errors: GridRowsErrors<any>
    ) => GridRows<any>
): CollectedRows<TData> {
    const rowNodes: RowNode<TData>[] = [];
    const displayedRows: RowNode<TData>[] = [];
    const detailGridRows = new Map<IRowNode<TData> | GridApi, GridRows<any>>();

    api.forEachNode((row: RowNode) => {
        rowNodes.push(row);
    });

    for (let i = 0, len = api.getDisplayedRowCount(); i < len; ++i) {
        const row = api.getDisplayedRowAtIndex(i) as RowNode<TData> | undefined;
        if (!row) {
            continue;
        }
        displayedRows.push(row);
        if (!row.detail) {
            continue;
        }
        const detailApi = row.detailGridInfo?.api;
        if (!detailApi || detailGridRows.has(detailApi)) {
            continue;
        }
        const detailGridRow = new GridRowsCtor(
            detailApi,
            label,
            { ...options, forcedColumns: options.forcedColumns ?? true },
            errors
        );
        detailGridRows.set(row, detailGridRow);
        detailGridRows.set(detailApi, detailGridRow);
    }

    const hasPinned = api.isModuleRegistered('PinnedRowModule');
    return {
        rowNodes,
        displayedRows,
        rootRowNode: (api.getRowNode(ROOT_NODE_ID) as RowNode<TData> | undefined) ?? null,
        pinnedTopRows: hasPinned ? collectPinnedRows(api.getPinnedTopRowCount(), (i) => api.getPinnedTopRow(i)) : [],
        pinnedBottomRows: hasPinned
            ? collectPinnedRows(api.getPinnedBottomRowCount(), (i) => api.getPinnedBottomRow(i))
            : [],
        detailGridRows,
    };
}

/** Strict reference equality with an explicit Date carve-out (Dates compare by timestamp). Two
 *  equivalent-but-distinct object instances are intentionally NOT equal — the grid keeps stable
 *  references for unchanged values, so a difference indicates a real change. */
export function valuesEqual(a: unknown, b: unknown): boolean {
    if (a === b) {
        return true;
    }
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }
    return false;
}

function collectPinnedRows<TData>(count: number, getter: (i: number) => any): RowNode<TData>[] {
    const rows: RowNode<TData>[] = [];
    for (let i = 0; i < count; ++i) {
        const row = getter(i);
        if (row) {
            rows.push(row);
        }
    }
    return rows;
}
