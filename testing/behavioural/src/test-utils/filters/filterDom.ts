import util from 'util';

import type { GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';

import { addDiagramToError, makeSnapshotTarget, runSnapshotCheck } from '../gridRows/grid-rows-helpers';
import type { SnapshotCheckTarget } from '../gridRows/grid-rows-helpers';
import { getSnapshotUpdateMode } from '../gridRows/snapshot-updater';
import { log } from '../utils';
import {
    serializeAdvancedFilter,
    serializeBuilder,
    serializeColumnFilter,
    serializeFloatingFilter,
    serializeToolPanel,
} from './filterDomSerialize';
import { FilterDomErrors, FilterDomValidator } from './filterDomValidator';

export type FilterDomMode =
    | 'auto'
    | 'column-filter'
    | 'advanced-filter'
    | 'builder'
    | 'floating-filter'
    | 'filters-tool-panel';

export interface FilterDomOptions {
    mode?: FilterDomMode;
    /** Column id for `column-filter`/`floating-filter` mode — enables the `model:` line and set-filter invariants. */
    colId?: string;
    /** Skip the invariant validator (diagram-only). */
    skipValidation?: boolean;
}

/**
 * Snapshot serialiser + validator for filter panels (parallel to GridRows/GridColumns). Renders whatever
 * filter surface is open to a stable text diagram (operators, inputs, buttons, validity, model, builder
 * tree) and checks state-dependent invariants.
 */
export class FilterDom {
    public readonly mode: FilterDomMode;
    public readonly errors = new FilterDomErrors();

    public constructor(
        public readonly api: GridApi,
        public readonly label: string = '',
        public readonly options: FilterDomOptions = {}
    ) {
        this.mode = options.mode ?? 'auto';
    }

    private resolveMode(): Exclude<FilterDomMode, 'auto'> {
        if (this.mode !== 'auto') {
            return this.mode;
        }
        if (document.querySelector('.ag-advanced-filter-builder')) {
            return 'builder';
        }
        // A column-filter menu is a transient foreground popup; prefer it over a persistent tool panel.
        if (document.querySelector('.ag-filter-menu')) {
            return 'column-filter';
        }
        if (document.querySelector('.ag-filter-toolpanel')) {
            return 'filters-tool-panel';
        }
        return 'advanced-filter';
    }

    private modelLine(mode: Exclude<FilterDomMode, 'auto'>): string {
        // Tool panel spans many columns, so a single-column model line would be misleading — omit it.
        if (mode === 'filters-tool-panel') {
            return '';
        }
        const columnScoped = mode === 'column-filter' || mode === 'floating-filter';
        const colId = this.options.colId;
        let model: any;
        if (!columnScoped) {
            model = this.api.getAdvancedFilterModel();
        } else if (colId) {
            model = this.api.getColumnFilterModel(colId);
        }
        if (model === undefined) {
            return '';
        }
        if (model === null) {
            return 'model: null';
        }
        return ['model:', ...formatModelLines(model, '  ')].join('\n');
    }

    public makeDiagram(): string {
        const gridDiv = (getGridElement(this.api) as HTMLElement | null) ?? document;
        const mode = this.resolveMode();
        const body = serializeBody(mode, gridDiv, this.options.colId);
        const modelLine = this.modelLine(mode);
        return modelLine ? `${body}\n${modelLine}` : body;
    }

    public loadErrors(): this {
        if (!this.errors.validated) {
            this.errors.validated = true;
            if (!this.options.skipValidation) {
                new FilterDomValidator(this.errors, this.api).validate(this.resolveMode());
            }
        }
        return this;
    }

    [util.inspect.custom](): string {
        this.loadErrors();
        return this.makeDiagram() + (this.errors.totalErrorsCount ? '\n\nErrors:\n' + this.errors.toString() : '');
    }

    public printDiagram(): this {
        log(this.makeDiagram());
        return this;
    }

    /**
     * @param snapshot Template-literal snapshot to compare against, `true` to print only, or
     *   `'skip-snapshot'` to bypass. Run `./behave.sh --update-grid-rows` to fill/refresh snapshots.
     *   Always runs the invariant validator (unless `skipValidation`), throwing on any violation.
     */
    public async checkFilterDom(snapshot: string | 'skip-snapshot' | true | undefined): Promise<this> {
        await runSnapshotCheck(this.#snapshotTarget(), snapshot as string | true | undefined, getSnapshotUpdateMode());
        return this;
    }

    #snapshotTarget(): SnapshotCheckTarget {
        return makeSnapshotTarget(this, {
            methodName: 'checkFilterDom',
            methodRef: this.checkFilterDom,
            rebuild: () => new FilterDom(this.api, this.label, this.options).#snapshotTarget(),
            makeError: () => this.#makeError(),
            assertEmpty: () => {
                throw new Error('FilterDom does not support the empty snapshot variant');
            },
        });
    }

    #makeError(): Error {
        this.loadErrors();
        const errorText = this.errors.totalErrorsCount ? '\n\nErrors:\n' + this.errors.toString() : '';
        const error = new Error('Filter DOM invariant/snapshot failure:' + errorText);
        addDiagramToError(error, this.makeDiagram(), this.label);
        Error.captureStackTrace(error, this.checkFilterDom);
        return error;
    }
}

/** Dispatches to the serialiser for the resolved mode. `gridDiv` scopes the advanced/floating surfaces. */
function serializeBody(mode: Exclude<FilterDomMode, 'auto'>, gridDiv: ParentNode, colId: string | undefined): string {
    switch (mode) {
        case 'builder':
            return serializeBuilder(document);
        case 'column-filter':
            return serializeColumnFilter(document);
        case 'filters-tool-panel':
            return serializeToolPanel(document);
        case 'floating-filter':
            return serializeFloatingFilter(gridDiv, colId);
        default:
            return serializeAdvancedFilter(gridDiv);
    }
}

/** Renders a filter model as an indented YAML-ish block (readable, diff-friendly, no JSON blob). */
function formatModelLines(model: unknown, indent: string): string[] {
    if (model === null || typeof model !== 'object') {
        return [`${indent}${JSON.stringify(model)}`];
    }
    const lines: string[] = [];
    for (const key of Object.keys(model)) {
        const value = (model as Record<string, unknown>)[key];
        if (Array.isArray(value)) {
            if (!value.length) {
                lines.push(`${indent}${key}: []`);
                continue;
            }
            lines.push(`${indent}${key}:`);
            const itemIndent = indent + '    ';
            for (const item of value) {
                const sub = formatModelLines(item, itemIndent);
                sub[0] = `${indent}  - ${sub[0].slice(itemIndent.length)}`;
                lines.push(...sub);
            }
        } else if (value !== null && typeof value === 'object') {
            lines.push(Object.keys(value).length ? `${indent}${key}:` : `${indent}${key}: {}`);
            lines.push(...formatModelLines(value, indent + '  '));
        } else {
            lines.push(`${indent}${key}: ${JSON.stringify(value)}`);
        }
    }
    return lines;
}
