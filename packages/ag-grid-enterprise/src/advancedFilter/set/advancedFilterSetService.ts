import { _areEqual, _last, _pushToMapArray } from 'ag-stack';

import type {
    AgColumn,
    AgPromise,
    BaseFilterParams,
    BeanCollection,
    ColDef,
    FilterDisplayParams,
    FilterDisplayState,
    FilterHandlerParams,
    IFilterParams,
    IRowNode,
    ISetFilterParams,
    NamedBean,
    Registry,
    SetFilterModel,
    SetFilterModelValue,
    UserCompDetails,
    UserComponentFactory,
} from 'ag-grid-community';
import {
    BeanStub,
    _addGridCommonParams,
    _getCellRendererDetails,
    _getFilterDetails,
    _isSetFilterByDefault,
    _mergeFilterParamsWithApplicationProvidedParams,
} from 'ag-grid-community';

import type { SetFilterModelTreeItem } from '../../setFilter/iSetDisplayValueModel';
import type { SetFilterHandler } from '../../setFilter/setFilterHandler';
import { translateForSetFilter } from '../../setFilter/setFilterUtils';
import { quoteSetPath, quoteSetValue } from '../advancedFilterExpressionService';
import type { AutocompleteEntry } from '../autocomplete/autocompleteParams';
import { getMultiFilterChild } from '../customFilterOptions';
import { AgSetValueAutocompleteRow } from './agSetValueAutocompleteRow';
import { namesSetOperator } from './setFilterExpressionOperators';
import { joinSetPath, splitSetPath, writeSetPath } from './setOperandsParser';

/**
 * One value the autocomplete can offer, in the shape the list takes so it is offered without a copy.
 * A tree list is offered flat, so every entry is a leaf and its `key` is the whole path as written.
 */
interface SetValueEntry extends AutocompleteEntry {
    /** The Set Filter key this resolves to. */
    readonly setKey: string | null;
    /** The segments the value is made of; one for an ordinary value, the whole path for a tree list. */
    readonly path: string[];
}

/** The list offers these objects themselves, so one chosen from it comes back carrying its own path. */
const isSetValueEntry = (entry: AutocompleteEntry): entry is SetValueEntry => 'path' in entry;

/** A column's Set Filter values, rebuilt whenever the underlying value model reloads. */
interface SetColumnValues {
    /** Every value the column offers, in the Set Filter's own order. */
    readonly entries: SetValueEntry[];
    /** Every leaf path to its key, for reading an expression into the model. */
    readonly keysByPath: Map<string, string | null>;
    /** The further keys a path names; apart from `keysByPath` so an ordinary column allocates nothing. */
    readonly sharedKeysByPath: Map<string, SetFilterModelValue>;
    /** The reverse, for writing a stored model back out as an expression. */
    readonly pathsByKey: Map<string | null, string[]>;
}

/** Handler params that are also a complete `IFilterParams`, which is what the `filterParams` merge is handed. */
type SetHandlerParams = FilterHandlerParams<any, any, SetFilterModel, ISetFilterParams> & IFilterParams;

/** What the Set Filter UI is handed: its display params, plus the callbacks a filter component expects. */
type SetFilterUiParams = FilterDisplayParams<any, any, SetFilterModel> &
    Pick<ISetFilterParams, 'buttons'> &
    Pick<IFilterParams, 'filterChangedCallback' | 'filterModifiedCallback'>;

interface SetColumn {
    readonly handler: SetFilterHandler;
    readonly removeListener: () => null;
    values: SetColumnValues | null;
    /** The `allKeys` promise already waited on, and what it resolved to once it has. */
    keysPromise?: AgPromise<SetFilterModelValue>;
    keys?: SetFilterModelValue;
}

const SET_VALUE_AUTOCOMPLETE_TYPE = 'set-value';

/** Joins path segments into one map key; a control character, so no value collides with it. */
const PATH_JOINER = '\u0000';

/** Shared, so a column whose values have not loaded allocates nothing on every keystroke. */
const NO_ENTRIES: SetValueEntry[] = [];

/**
 * The value list offered at one caret, and the token identifying it. `AgAutocomplete` rebuilds its popup
 * when the token changes, so the token has to change exactly when the list does.
 */
interface SetValueList {
    readonly type: string;
    readonly colId: string;
    readonly usedKeys: ReadonlySet<string | null>;
    readonly entries: AutocompleteEntry[];
    /** Whether the values are paths, so a separator written inside one segment still names a level. */
    readonly isTree: boolean;
    /** How the list draws a row, where the column asks for more than the plain one. */
    readonly rowComponentCreator?: (entry: AutocompleteEntry) => AgSetValueAutocompleteRow;
}

export class AdvancedFilterSetService extends BeanStub<'valuesChanged'> implements NamedBean {
    beanName = 'advFilterSetSvc' as const;

    private registry: Registry;
    private userCompFactory: UserComponentFactory;

    /** Null marks a column with no usable handler, so one is not attempted again on every keystroke. */
    private readonly columns = new Map<string, SetColumn | null>();
    private list: SetValueList | undefined;
    private listCount = 0;

    public wireBeans(beans: BeanCollection): void {
        this.registry = beans.registry;
        this.userCompFactory = beans.userCompFactory;
    }

    public postConstruct(): void {
        // A handler reads the column definitions and the grouping when it is built, so a change to either
        // has to be pushed in. `refresh` is the column filter lifecycle's own way; it is not running here.
        const refresh = () => this.refreshColumns();
        this.addManagedEventListeners({
            newColumnsLoaded: refresh,
            columnRowGroupChanged: refresh,
            columnPivotModeChanged: refresh,
            columnPivotChanged: refresh,
            rowDataUpdated: () => this.onNewRowsLoaded(),
        });
        this.addManagedPropertyListeners(['treeData'], refresh);
        this.addDestroyFunc(() => this.reset());
    }

    /** Refreshed rather than rebuilt: an applied expression holds the instance, so a new one never reaches it. */
    private refreshColumns(): void {
        const columns = this.columns;
        for (const [colId, setColumn] of columns) {
            const column = this.beans.colModel.getNonPivotColById(colId);
            if (setColumn && column && this.offersSetOperators(column)) {
                const handler = setColumn.handler;
                handler.refresh(this.createHandlerParams(column, 'colDef'));
                // `refresh` re-reads the definitions; the grouping reaches the keys through the values.
                handler.onNewRowsLoaded();
                setColumn.values = null;
                continue;
            }
            if (setColumn) {
                this.destroyColumn(setColumn);
            }
            columns.delete(colId);
        }
        // Once, past the loop, so the text is written from every refreshed column. Said here rather than
        // left to the handlers: a provided value list has no data change of its own to report.
        this.invalidateList();
    }

    private onNewRowsLoaded(): void {
        for (const setColumn of this.columns.values()) {
            setColumn?.handler.onNewRowsLoaded();
        }
    }

    /** Whether the column offers `is any of` / `is none of`; cheap enough to ask on every parse. */
    public offersSetOperators(column: AgColumn | null | undefined): boolean {
        // Without the module there is no handler to filter with, so the options are not offered either.
        if (!column || !this.gos.isModuleRegistered('SetFilter')) {
            return false;
        }
        // An option list naming them offers them whatever filter the column has.
        if (namesSetOperator(column)) {
            return true;
        }
        // Otherwise it is the column's filter that decides: a Set Filter, or a Multi Filter holding one.
        const colDef = column.colDef;
        return (
            this.isSetFilterDef(column) ||
            (colDef.filter === 'agMultiColumnFilter' && !!getMultiFilterChild(colDef.filterParams, 'agSetColumnFilter'))
        );
    }

    /** Whether the column's own filter is a Set Filter, so its `filterParams` are a list's and not a comparison's. */
    public hasSetFilter(column: AgColumn | null | undefined): boolean {
        return !!column && this.gos.isModuleRegistered('SetFilter') && this.isSetFilterDef(column);
    }

    /** Read from the definition alone, so asking does not instantiate anything. */
    private isSetFilterDef(column: AgColumn): boolean {
        const filter = column.colDef.filter;
        return filter === 'agSetColumnFilter' || (filter === true && _isSetFilterByDefault(this.gos));
    }

    /** The Set Filter keys a written path names, or `undefined` where the path names no value at all. */
    public getKeys(column: AgColumn, path: readonly string[]): SetFilterModelValue | undefined {
        const setColumn = this.getSetColumn(column);
        const values = setColumn && this.getValues(setColumn);
        if (!values) {
            return undefined;
        }
        // Folded as the Set Filter folds its own keys, so a value typed in another case still resolves.
        const joined = setColumn.handler.caseFormat(joinPath(path));
        // Never `undefined` for a registered path, so one lookup answers both questions.
        const key = values.keysByPath.get(joined);
        if (key === undefined) {
            return undefined;
        }
        const shared = values.sharedKeysByPath.get(joined);
        return shared ? [key, ...shared] : [key];
    }

    /** The path a stored key is written as, for turning a model back into an expression. */
    public getPath(column: AgColumn, key: string | null): string[] | undefined {
        const setColumn = this.getSetColumn(column);
        const values = setColumn && this.getValues(setColumn);
        // Folded as the keys were stored, so a model naming a key in another case still writes its path.
        return values?.pathsByKey.get(setColumn!.handler.caseFormat(key));
    }

    /** Every key the list offers, for the "all selected" state a set model has to spell out in full. */
    public getAllKeys(column: AgColumn): SetFilterModelValue | undefined {
        const setColumn = this.getSetColumn(column);
        return setColumn && this.getValues(setColumn) ? setColumn.keys : undefined;
    }

    /**
     * How the column names a blank. A blank has no text of its own, so this is also the only spelling that
     * reads back as the blank key, which is what lets a model naming one survive being written and re-parsed.
     */
    public getBlankLabel(column: AgColumn): string | undefined {
        const setColumn = this.getSetColumn(column);
        return setColumn ? translateForSetFilter(setColumn.handler, 'blanks') : undefined;
    }

    /**
     * The value list at a caret: every value the column still offers, a tree list flattened to whole paths.
     * Asked for on every keystroke but rebuilt only when it is a different list, a column having a value per row.
     */
    public getAutocompleteList(column: AgColumn, usedKeys: ReadonlySet<string | null>): SetValueList {
        const colId = column.getColId();
        const cached = this.list;
        if (cached?.colId === colId && sameKeys(cached.usedKeys, usedKeys)) {
            return cached;
        }
        const setColumn = this.getSetColumn(column);
        const values = setColumn && this.getValues(setColumn);
        const source = values?.entries ?? NO_ENTRIES;
        // The column's own entries, offered as they stand: a value picked or dropped rebuilds this list,
        // so copying each one would allocate per value of the column on every pick.
        let entries: AutocompleteEntry[] = source;
        if (usedKeys.size) {
            entries = [];
            for (let i = 0, len = source.length; i < len; ++i) {
                const entry = source[i];
                if (!usedKeys.has(entry.setKey)) {
                    entries.push(entry);
                }
            }
        }
        const list: SetValueList = {
            type: `${SET_VALUE_AUTOCOMPLETE_TYPE}-${++this.listCount}`,
            colId,
            usedKeys,
            entries,
            isTree: !!setColumn?.handler.params.filterParams.treeList,
            rowComponentCreator: values ? this.createRowCreator(column, setColumn.handler) : undefined,
        };
        // Values load asynchronously; an empty list built before they arrive must not stand in for them.
        if (values) {
            this.list = list;
        }
        return list;
    }

    /**
     * How a path is written into an expression: the whole path as one quoted value, unless re-reading
     * that text would reach somewhere else — a segment holding the separator, or a value spelled alike.
     */
    public writePath(column: AgColumn, path: readonly string[]): string {
        if (path.length < 2) {
            return quoteSetValue(path[0]);
        }
        const written = writeSetPath(path);
        // Judged by the reader's own rule, so a segment holding any separator keeps its own quotes.
        const readsBack = _areEqual(splitSetPath(written), path) && !this.getKeys(column, [written]);
        return readsBack ? quoteSetValue(written) : quoteSetPath(path);
    }

    /** How a chosen entry is written, which is the same spelling a stored model of it would produce. */
    public writeEntry(column: AgColumn, entry: AutocompleteEntry): string {
        // Read off the entry, not looked up by its text: two values can be written the same way.
        return isSetValueEntry(entry) ? this.writePath(column, entry.path) : quoteSetValue(entry.key);
    }

    public isSetValueType(type: string | undefined): type is string {
        return !!type?.startsWith(`${SET_VALUE_AUTOCOMPLETE_TYPE}-`);
    }

    /**
     * How a value list renders its rows: the Set Filter's `cellRenderer`, and a path's de-emphasised
     * parents. Resolved once per list, since a virtual list rebuilds its rows on every scroll.
     */
    private createRowCreator(
        column: AgColumn,
        handler: SetFilterHandler
    ): ((entry: AutocompleteEntry) => AgSetValueAutocompleteRow) | undefined {
        const filterParams = handler.params.filterParams;
        const cellRenderer = filterParams.cellRenderer;
        if (!cellRenderer && !filterParams.treeList) {
            return undefined;
        }
        const colDef = column.getColDef();
        // A tree item names itself by its already-formatted segment, as the Set Filter's own list draws it.
        const isTree = !!filterParams.treeList;
        return (entry) => {
            const displayValue = entry.displayValue ?? entry.key;
            const source = isSetValueEntry(entry) ? entry : undefined;
            // A path displays every segment but stands for its leaf, which is what a renderer draws.
            const label = source ? _last(source.path)! : displayValue;
            // Taken from the path rather than sought in the text, so a value holding a separator of its
            // own is not read as one.
            const parentLength = isTree && source && source.path.length > 1 ? displayValue.length - label.length : 0;
            const createCellRenderer = cellRenderer
                ? () =>
                      _getCellRendererDetails(
                          this.userCompFactory,
                          filterParams,
                          _addGridCommonParams(this.gos, {
                              value: isTree || !source ? label : handler.valueModel.allValues.get(source.setKey),
                              valueFormatted: label,
                              colDef,
                              column,
                          })
                      )
                : undefined;
            return new AgSetValueAutocompleteRow(displayValue, parentLength, createCellRenderer);
        };
    }

    /**
     * Whether a row's value is one of `keys`, decided by the Set Filter's own rules: key creation, case
     * folding, array cells, and the tree data and grouping paths.
     */
    public createMatcher(column: AgColumn, keys: SetFilterModelValue): (node: IRowNode) => boolean | undefined {
        const handler = this.getSetColumn(column)?.handler;
        // No handler is no test rather than a failed one, so neither option admits the row on its account.
        return handler ? handler.createKeysMatcher(keys) : () => undefined;
    }

    private getValues(setColumn: SetColumn): SetColumnValues | null {
        if (setColumn.values) {
            return setColumn.values;
        }
        // A reload installs a fresh promise while `isInitialised()` still reports the previous load, so the
        // promise says whether the keys are current. Waited on once per load, as `then` on an unresolved
        // one leaves a waiter behind for good and this is reached on every keystroke.
        const allKeys = setColumn.handler.valueModel.allKeys;
        if (setColumn.keysPromise !== allKeys) {
            setColumn.keysPromise = allKeys;
            setColumn.keys = undefined;
            allKeys.then((keys) => {
                setColumn.keys = keys ?? [];
            });
        }
        const keys = setColumn.keys;
        if (!keys) {
            return null;
        }
        setColumn.values = setColumn.handler.params.filterParams.treeList
            ? buildTreeValues(setColumn, keys)
            : buildFlatValues(setColumn, keys);
        return setColumn.values;
    }

    private getSetColumn(column: AgColumn): SetColumn | null {
        const colId = column.getColId();
        const columns = this.columns;
        const existing = columns.get(colId);
        if (existing !== undefined) {
            return existing;
        }
        const setColumn = this.createSetColumn(column);
        columns.set(colId, setColumn);
        return setColumn;
    }

    private createSetColumn(column: AgColumn): SetColumn | null {
        if (!this.offersSetOperators(column)) {
            return null;
        }
        const handler = this.registry.createDynamicBean<SetFilterHandler>('agSetColumnFilterHandler', false);
        if (!handler) {
            return null;
        }
        const created = this.createBean(handler);
        created.init(this.createHandlerParams(column, 'init'));
        const colId = column.getColId();
        // Held, not left to the service's own teardown: a column dropped from the definitions takes its
        // listener with it rather than leaving one per rebuild for the life of the grid.
        const [removeListener] = this.addManagedListeners(created, {
            dataChanged: () => this.invalidateValues(colId),
        });
        return { handler: created, values: null, removeListener };
    }

    private destroyColumn(setColumn: SetColumn): void {
        setColumn.removeListener();
        this.destroyBean(setColumn.handler);
    }

    /** The Set Filter UI itself, for the Builder to host, editing `model` and reporting every change back. */
    public createFilterUi(
        column: AgColumn,
        model: SetFilterModel | null,
        onModelChange: (model: SetFilterModel | null) => void
    ): UserCompDetails | undefined {
        const handler = this.getSetColumn(column)?.handler;
        if (!handler) {
            return undefined;
        }
        const params: SetFilterUiParams = {
            ...this.createSharedParams(column),
            // The Builder applies as values are picked, so the Set Filter shows no buttons of its own.
            buttons: [],
            model,
            state: { model },
            // With no apply step the picked state is the model, and it has to be recorded as such or
            // detaching the popup would report the values back as they were before it opened.
            onStateChange: (state: FilterDisplayState<SetFilterModel>) => {
                params.model = state.model;
                onModelChange(state.model);
            },
            onModelChange: () => {},
            onAction: () => {},
            onUiChange: () => {},
            getHandler: () => handler,
            filterChangedCallback: () => {},
            filterModifiedCallback: () => {},
            source: 'init',
        };
        return _getFilterDetails(this.userCompFactory, this.getSetColDef(column), params, 'agSetColumnFilter');
    }

    /** `true` = forFloatingFilter, whose always-true `doesRowPassOtherFilter` is what offers every row's value. */
    private createSharedParams(column: AgColumn): BaseFilterParams {
        // Guaranteed by the SetFilter module gate in `offersSetOperators`, which depends on the filter module.
        return this.beans.colFilter!.createBaseFilterParams(column, true);
    }

    /**
     * The definition the value list is built and drawn from. Another filter's is written for itself: its
     * component is not this one, and a Date Filter's `comparator` reaching a value list is called with
     * two cell values and throws.
     */
    private getSetColDef(column: AgColumn): ColDef {
        const colDef = column.getColDef();
        if (this.hasSetFilter(column)) {
            return colDef;
        }
        // A Multi Filter keeps the value list's configuration on its Set Filter child; any other filter's
        // params are written for itself, a Date Filter's `comparator` being called with two cell values here.
        const child =
            colDef.filter === 'agMultiColumnFilter'
                ? getMultiFilterChild(colDef.filterParams, 'agSetColumnFilter')
                : undefined;
        return { ...colDef, filter: 'agSetColumnFilter', filterParams: child?.filterParams };
    }

    /** `colDef` is what tells the value model its source may have changed; on the first build nothing has. */
    private createHandlerParams(column: AgColumn, source: 'init' | 'colDef'): SetHandlerParams {
        const colDef = this.getSetColDef(column);
        const params: SetHandlerParams = {
            ...this.createSharedParams(column),
            model: null,
            source,
            onModelChange: () => {},
            onModelAsStringChange: () => {},
            // The handler is the Advanced Filter's own, so a filter change here is not the column's.
            filterChangedCallback: () => {},
            filterModifiedCallback: () => {},
            filterParams: colDef.filterParams,
        };
        // The merge reads the grid params it is handed, so it runs on the finished object.
        params.filterParams = _mergeFilterParamsWithApplicationProvidedParams(
            this.userCompFactory,
            colDef,
            params
        ) as ISetFilterParams;
        return params;
    }

    private invalidateValues(colId: string): void {
        const setColumn = this.columns.get(colId);
        if (setColumn) {
            setColumn.values = null;
            this.invalidateList();
        }
    }

    /** Anything already written from these values may now spell them the wrong way. */
    private invalidateList(): void {
        this.list = undefined;
        this.dispatchLocalEvent({ type: 'valuesChanged' });
    }

    private reset(): void {
        for (const setColumn of this.columns.values()) {
            if (setColumn) {
                this.destroyColumn(setColumn);
            }
        }
        this.columns.clear();
        this.list = undefined;
    }
}

const joinPath = (segments: readonly string[]): string => segments.join(PATH_JOINER);

const createValues = (): Omit<SetColumnValues, 'entries'> => ({
    keysByPath: new Map(),
    sharedKeysByPath: new Map(),
    pathsByKey: new Map(),
});

/**
 * A path is drawn with its segments as they stand but searched for as the reader splits one, so every
 * row a typed separator could name is offered. Which one it resolves to is the parser's to decide.
 */
const createEntry = (path: string[], setKey: string | null, tree: boolean): SetValueEntry => {
    const key = joinSetPath(path);
    const searchValue = tree ? joinSetPath(splitSetPath(key)) : key;
    return { key, setKey, path, searchValue: searchValue === key ? undefined : searchValue };
};

/**
 * Registers one leaf under the path it is written as. Keys that format alike are told apart by writing the
 * later ones as their key; where that collides too, or a lossy path getter gave two the same path, one entry
 * names them all. `path` is mutated in place, its last segment substituted, so no caller may reuse it.
 * `into` is null where the path resolves to a key without being offered as a value of its own.
 */
const addLeaf = (
    handler: SetFilterHandler,
    values: Omit<SetColumnValues, 'entries'>,
    path: string[],
    keys: readonly (string | null)[],
    into: SetValueEntry[] | null,
    tree: boolean
): void => {
    const { keysByPath, sharedKeysByPath, pathsByKey } = values;
    const last = path.length - 1;
    const key = keys[0];
    let folded = handler.caseFormat(joinPath(path));
    if (keysByPath.has(folded)) {
        path[last] = key ?? '';
        folded = handler.caseFormat(joinPath(path));
    }
    pathsByKey.set(handler.caseFormat(key), path);
    if (keysByPath.has(folded)) {
        _pushToMapArray(sharedKeysByPath, folded, key);
    } else {
        keysByPath.set(folded, key);
        into?.push(createEntry(path, key, tree));
    }
    for (let i = 1, len = keys.length; i < len; ++i) {
        const shared = keys[i];
        pathsByKey.set(handler.caseFormat(shared), path);
        _pushToMapArray(sharedKeysByPath, folded, shared);
    }
};

const buildFlatValues = (setColumn: SetColumn, allKeys: SetFilterModelValue): SetColumnValues => {
    const handler = setColumn.handler;
    const entries: SetValueEntry[] = [];
    const values = createValues();
    for (let i = 0, len = allKeys.length; i < len; ++i) {
        const key = allKeys[i];
        addLeaf(handler, values, [handler.getFormattedValue(key) ?? ''], [key], entries, false);
    }
    return { entries, ...values };
};

/** A tree list is offered as one flat level of whole paths, so only its leaves become entries. */
const buildTreeValues = (setColumn: SetColumn, allKeys: SetFilterModelValue): SetColumnValues => {
    const handler = setColumn.handler;
    const treeListFormatter = handler.params.filterParams.treeListFormatter;

    const entries: SetValueEntry[] = [];
    const values = createValues();
    const walk = (items: Map<string | null, SetFilterModelTreeItem>, path: string[]): void => {
        for (const item of items.values()) {
            // A blank names itself the way the Set Filter's own list names it, so the two offer one label.
            const formatted =
                (treeListFormatter ? treeListFormatter(item.treeKey, item.depth, item.parentTreeKeys) : item.treeKey) ??
                translateForSetFilter(handler, 'blanks');
            const itemPath = [...path, formatted];
            const children = item.children;
            const keys = item.keys;
            if (children?.size) {
                walk(children, itemPath);
                // A path getter can land a value on a group's own path. The group holds the only row, so
                // the value is not offered separately, but the path still has to resolve to it.
                if (keys) {
                    addLeaf(handler, values, itemPath, keys, null, true);
                }
                continue;
            }
            if (keys) {
                addLeaf(handler, values, itemPath, keys, entries, true);
            }
        }
    };
    walk(handler.createDisplayValueTree(allKeys), []);
    return { entries, ...values };
};

const sameKeys = (a: ReadonlySet<string | null>, b: ReadonlySet<string | null>): boolean => {
    if (a.size !== b.size) {
        return false;
    }
    for (const key of a) {
        if (!b.has(key)) {
            return false;
        }
    }
    return true;
};
