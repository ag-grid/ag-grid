import util from 'util';
import { expect } from 'vitest';

import type { Column, ColumnGroup, GridApi } from 'ag-grid-community';

import { addDiagramToError, makeSnapshotTarget, runSnapshotCheck } from '../gridRows/grid-rows-helpers';
import type { SnapshotCheckTarget } from '../gridRows/grid-rows-helpers';
import { getSnapshotUpdateMode } from '../gridRows/snapshot-updater';
import { log } from '../utils';
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
            new GridColumnsValidator(this.errors, this.bugs).validate(this);

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
     *  - `'empty'`: assert that there are no displayed columns.
     *  - `true`: print the diagram to the console without performing snapshot comparison.
     *  - `'skip-snapshot'`: ⚠️ skip snapshot comparison entirely. **Use only temporarily** while
     *    iterating on a test; commit-blocking convention is that no production test ships with
     *    this value. Type accepts no `false` — every `checkColumns` call must opt into either a
     *    real snapshot string, `'empty'`, `true`, or the explicit `'skip-snapshot'` escape.
     *  - `undefined`: logs an error reminding you to run `./behave.sh --update-grid-rows`.
     */
    public async checkColumns(diagramSnapshot: string | 'empty' | 'skip-snapshot' | true | undefined): Promise<this> {
        await runSnapshotCheck(this.#snapshotTarget(), diagramSnapshot, getSnapshotUpdateMode());
        return this;
    }

    #snapshotTarget(): SnapshotCheckTarget {
        return makeSnapshotTarget(this, {
            methodName: 'checkColumns',
            methodRef: this.checkColumns,
            rebuild: () => new GridColumns<TData>(this.api, this.label, this.options).#snapshotTarget(),
            makeError: () => this.#makeError(this.checkColumns),
            assertEmpty: () => expect(this.allDisplayedCols.length).toBe(0),
        });
    }

    #makeError(callerFn: (...args: any[]) => any, message = 'Grid columns errors:'): Error {
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
