import { setTimeout as asyncSetTimeout } from 'timers/promises';
import util from 'util';
import { expect } from 'vitest';

import type { Column, ColumnGroup, GridApi } from 'ag-grid-community';

import { addDiagramToError } from '../gridRows/grid-rows-helpers';
import { getSnapshotUpdateMode, recordSnapshotMismatch } from '../gridRows/snapshot-updater';
import { log, unindentText } from '../utils';
import { buildColumnsDiagram } from './columns-diagram/gridColumnsDiagramTree';
import { GridColumnsDomValidator } from './columns-validation-dom/gridColumnsDomValidator';
import { GridColumnsErrors } from './columns-validation/gridColumnsErrors';
import { GridColumnsValidator } from './columns-validation/gridColumnsValidator';
import type { GridColumnsBugs, GridColumnsOptions } from './gridColumnsOptions';
import { gridColumnsBugs } from './gridColumnsOptions';

export type {
    GridColumnsDomColumnValidatorParams,
    GridColumnsDomGroupValidatorParams,
    GridColumnsOptions,
} from './gridColumnsOptions';
export type { GridColumnsBugs } from './gridColumnsOptions';
export type { GridColumnsErrorFilter } from './columns-validation/gridColumnErrors';
export type { GridColumnErrors } from './columns-validation/gridColumnErrors';

export class GridColumns<TData = any> {
    public readonly api: GridApi<TData>;
    public readonly bugs: Readonly<GridColumnsBugs>;
    public readonly errors: GridColumnsErrors;

    /** Whether the ColumnGroupModule is registered (column groups are available). */
    public readonly hasColumnGroups: boolean;

    /** Hierarchical tree of left-pinned columns/groups. */
    public readonly leftTree: (Column | ColumnGroup)[];
    /** Hierarchical tree of center (unpinned) columns/groups. */
    public readonly centerTree: (Column | ColumnGroup)[];
    /** Hierarchical tree of right-pinned columns/groups. */
    public readonly rightTree: (Column | ColumnGroup)[];

    /** Flat array of all displayed columns (left + center + right). */
    public readonly allDisplayedCols: Column[];
    /** Flat array of displayed left-pinned columns. */
    public readonly leftCols: Column[];
    /** Flat array of displayed center columns. */
    public readonly centerCols: Column[];
    /** Flat array of displayed right-pinned columns. */
    public readonly rightCols: Column[];

    /**
     * @param api The grid API instance
     * @param label A label to identify the grid in error messages and diagrams
     * @param options Options to configure the GridColumns instance
     */
    public constructor(
        api: GridApi<TData>,
        public readonly label: string = '',
        public readonly options: GridColumnsOptions = {},
        errors?: GridColumnsErrors
    ) {
        this.api = api;
        this.bugs = options.bugs ? { ...gridColumnsBugs, ...options.bugs } : gridColumnsBugs;
        errors ??= new GridColumnsErrors();
        if (options.onError) {
            errors.errorFilter = options.onError;
        }
        this.errors = errors;

        // Detect ColumnGroupModule
        this.hasColumnGroups = (api.isModuleRegistered as (name: string) => boolean)('ColumnGroup');

        // Collect column state
        this.allDisplayedCols = api.getAllDisplayedColumns() ?? [];
        this.leftCols = api.getDisplayedLeftColumns?.() ?? [];
        this.centerCols = api.getDisplayedCenterColumns?.() ?? [];
        this.rightCols = api.getDisplayedRightColumns?.() ?? [];

        // Collect trees
        if (this.hasColumnGroups) {
            this.leftTree = (api.getLeftDisplayedColumnGroups?.() as (Column | ColumnGroup)[]) ?? [];
            this.centerTree = (api.getCenterDisplayedColumnGroups?.() as (Column | ColumnGroup)[]) ?? [];
            this.rightTree = (api.getRightDisplayedColumnGroups?.() as (Column | ColumnGroup)[]) ?? [];
        } else {
            // Without ColumnGroupModule, fall back to flat column lists as trees
            this.leftTree = this.leftCols;
            this.centerTree = this.centerCols;
            this.rightTree = this.rightCols;
        }
    }

    public loadErrors(): this {
        if (!this.errors.validated) {
            this.errors.validated = true;
            new GridColumnsValidator(this.errors).validate(this);

            if (this.options.checkDom ?? true) {
                new GridColumnsDomValidator(this.errors).validate(this);
            }
        }
        return this;
    }

    public makeDiagram(printErrors = false): string {
        if (printErrors) {
            this.loadErrors();
        }
        return buildColumnsDiagram(this, printErrors);
    }

    [util.inspect.custom](): string {
        return this.makeDiagram(true);
    }

    public printDiagram(): this {
        log(this.makeDiagram(true));
        return this;
    }

    /**
     * @param diagramSnapshot The grid columns diagram snapshot.
     *  - Pass a template literal snapshot string to compare against the current diagram output.
     *  - Run `./behave.sh --update-grid-rows` to generate or update snapshots automatically.
     *  - 'empty': Assert that there are no displayed columns (empty diagram).
     *  - true: Print the diagram to the console without performing any snapshot comparison or validation.
     *  - false: Skip diagram generation and snapshot comparison, running only validators.
     *  - undefined: Logs an error to console reminding you to run `./behave.sh --update-grid-rows`.
     */
    public async checkColumns(diagramSnapshot: string | 'empty' | boolean | undefined): Promise<this> {
        if (diagramSnapshot === undefined) {
            if (getSnapshotUpdateMode()) {
                // In update mode, treat undefined as an empty string to trigger a mismatch recording
                // so the snapshot updater can replace `undefined` with the actual diagram template literal.
                diagramSnapshot = '';
            } else {
                console.error(
                    `\n❌ GridColumns.checkColumns() called without a snapshot for "${this.label}". Run \`./behave.sh --update-grid-rows\` to generate one.\n`
                );
                diagramSnapshot = false;
            }
        }

        this.loadErrors();

        // Throw validation errors always — don't bake broken snapshots
        if (this.errors.totalErrorsCount > 0) {
            throw this.#makeError(this.checkColumns);
        }

        if (diagramSnapshot === true) {
            this.printDiagram();
            return this;
        }

        if (diagramSnapshot === false) {
            return this;
        }

        if (getSnapshotUpdateMode()) {
            if (diagramSnapshot === 'empty') {
                expect(this.allDisplayedCols.length).toBe(0);
                return this;
            }
            const diagram = this.makeDiagram(false);
            if (unindentText(diagram) !== unindentText(diagramSnapshot)) {
                recordSnapshotMismatch(this.checkColumns, diagram, this.label, 'checkColumns');
            }
            return this;
        }

        // Retry loop: on failure, rebuild from scratch and retry with a short delay
        const retryDelays = [10, 50, 100];
        let attempt: GridColumns<TData> = this;
        let lastError: any;

        for (let i = 0; i <= retryDelays.length; i++) {
            attempt.loadErrors();
            lastError = attempt.#tryCheck(diagramSnapshot);
            if (!lastError) {
                if (i > 0) {
                    console.error(
                        `GridColumns flaky check detected for "${this.label}" — passed only after retrying with delays. ` +
                            `Add \`await asyncSetTimeout(N)\` before this check to avoid intermittent failures.`
                    );
                }
                return this;
            }
            if (i < retryDelays.length) {
                await asyncSetTimeout(retryDelays[i]);
                attempt = new GridColumns<TData>(this.api, this.label, this.options);
            }
        }

        addDiagramToError(lastError, attempt.makeDiagram(false), this.label);
        Error.captureStackTrace(lastError, this.checkColumns);
        throw lastError;
    }

    /** Attempts snapshot check without throwing. Returns the error if failed, null if passed. */
    #tryCheck(diagramSnapshot: string | 'empty'): any {
        if (this.errors.totalErrorsCount > 0) {
            return this.#makeError(this.checkColumns);
        }
        const diagram = this.makeDiagram(false);
        try {
            if (diagramSnapshot === 'empty') {
                expect(this.allDisplayedCols.length).toBe(0);
            } else {
                expect(unindentText(diagram)).toEqual(unindentText(diagramSnapshot));
            }
        } catch (e: any) {
            return e;
        }
        return null;
    }

    #makeError(callerFn: Function, message = 'Grid columns errors:'): Error {
        let diagram: string | undefined;
        try {
            diagram = this.makeDiagram(true);
        } catch (error) {
            this.errors.default.add('Error making diagram: ' + error.message);
            this.errors.throwIfAny(callerFn);
            return error;
        }
        const error = new Error(message);
        addDiagramToError(error, diagram, this.label);
        Error.captureStackTrace(error, callerFn);
        return error;
    }
}
