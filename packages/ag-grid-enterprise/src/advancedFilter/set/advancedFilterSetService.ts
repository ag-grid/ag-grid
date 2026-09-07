import { _areEqual, _last, _pushToMapArray } from 'ag-stack';

import type {
    AgColumn,
    AgPromise,
    BaseFilterParams,
    BeanCollection,
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
import { quoteSetPath } from '../advancedFilterExpressionService';
import type { AutocompleteEntry } from '../autocomplete/autocompleteParams';
import { AgSetValueAutocompleteRow } from './agSetValueAutocompleteRow';
import { joinSetPath } from './setOperandsParser';

/** One entry the value autocomplete can offer: a leaf value, or a tree group to drill into. */
interface SetValueEntry {
    /** The value, or the path segment for a tree list, as it is written in the expression. */
    readonly displayValue: string;
    /** The Set Filter key this resolves to; absent on a group, which is not a value of its own. */
    readonly key?: string | null;
    /** How many children a group still offers. A flattened match keeps it without keeping `children`. */
    readonly childCount?: number;
    /** Set on a flattened match: the path from where the caret is to the value, as it must be written. */
    readonly relativePath?: string[];
    /** A group's children, held directly so a walk never re-joins the path to look them up. */
    readonly children?: SetValueEntry[];
}

/** A column's Set Filter values, rebuilt whenever the underlying value model reloads. */
interface SetColumnValues {
    /** Top-level entries: the whole list where there is no tree, the root groups where there is. */
    readonly entries: SetValueEntry[];
    /** Children by joined parent path; empty for a flat list. */
    readonly childrenByPath: Map<string, SetValueEntry[]>;
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

/**
 * The value list offered at one caret, and the token identifying it. `AgAutocomplete` rebuilds its popup
 * when the token changes, so the token has to change exactly when the list does.
 */
interface SetValueList {
    readonly type: string;
    readonly colId: string;
    readonly path: readonly string[];
    readonly usedKeys: ReadonlySet<string | null>;
    /** Whether the entries are the flattened whole-hierarchy form; only a tree list has one. */
    readonly flattened: boolean;
    readonly entries: AutocompleteEntry[];
    readonly sourceByDisplay?: Map<string, SetValueEntry>;
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
            if (setColumn && column && this.isSetFilterColumn(column)) {
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
    public isSetFilterColumn(column: AgColumn | null | undefined): boolean {
        // Without the module there is no handler to filter with, so the options are not offered either.
        const gos = this.gos;
        if (!column || !gos.isModuleRegistered('SetFilter')) {
            return false;
        }
        // Read from the definition alone, so asking does not instantiate anything.
        const filter = column.colDef.filter;
        return filter === 'agSetColumnFilter' || (filter === true && _isSetFilterByDefault(gos));
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
     * The value list at a caret. Regenerated on every keystroke but only rebuilt when it is a different
     * list, so a column with a value per row is not re-filtered for a result that is thrown away.
     */
    public getAutocompleteList(
        column: AgColumn,
        path: readonly string[],
        usedKeys: ReadonlySet<string | null>,
        searching: boolean
    ): SetValueList {
        const colId = column.getColId();
        const setColumn = this.getSetColumn(column);
        // Keyed on this rather than on `searching`: without a tree there is nothing to flatten, and a flat
        // column would otherwise rebuild an identical list whenever a search starts or is cleared.
        const flattened = searching && !!setColumn?.handler.params.filterParams.treeList;
        const cached = this.list;
        if (
            cached?.colId === colId &&
            cached.flattened === flattened &&
            _areEqual(cached.path, path) &&
            sameKeys(cached.usedKeys, usedKeys)
        ) {
            return cached;
        }
        // Resolved once for the whole walk: every level would otherwise re-look-up the column's values.
        const values = setColumn && this.getValues(setColumn);
        let source: SetValueEntry[] = [];
        if (values) {
            const available = getAvailableEntries(getEntriesAtPath(values, setColumn.handler, path), usedKeys);
            source = flattened ? getFlattenedEntries(available, path) : available;
        }
        const entries: AutocompleteEntry[] = [];
        // Only a flattened match stands for a path that differs from the value it displays.
        const sourceByDisplay = flattened ? new Map<string, SetValueEntry>() : undefined;
        for (let i = 0, len = source.length; i < len; ++i) {
            const entry = source[i];
            const displayValue = entry.displayValue;
            entries.push({ key: displayValue, displayValue, childCount: entry.childCount });
            sourceByDisplay?.set(displayValue, entry);
        }
        const list: SetValueList = {
            type: `${SET_VALUE_AUTOCOMPLETE_TYPE}-${++this.listCount}`,
            colId,
            path,
            usedKeys,
            flattened,
            entries,
            sourceByDisplay,
            rowComponentCreator: values
                ? this.createRowCreator(column, values.keysByPath, setColumn.handler, sourceByDisplay)
                : undefined,
        };
        // Values load asynchronously; an empty list built before they arrive must not stand in for them.
        if (values) {
            this.list = list;
        }
        return list;
    }

    /** How a chosen entry is written: a flattened match spells out the whole path it stands for. */
    public getWrittenValue(type: string, entry: AutocompleteEntry): string | undefined {
        const cached = this.list;
        const relativePath =
            cached?.type === type
                ? cached.sourceByDisplay?.get(entry.displayValue ?? entry.key)?.relativePath
                : undefined;
        return relativePath && quoteSetPath(relativePath);
    }

    public isSetValueType(type: string | undefined): type is string {
        return !!type?.startsWith(`${SET_VALUE_AUTOCOMPLETE_TYPE}-`);
    }

    /**
     * How a value list renders its rows: the Set Filter's `cellRenderer`, and a tree group's remaining
     * child count. Resolved once per list, since a virtual list rebuilds its rows on every scroll.
     */
    private createRowCreator(
        column: AgColumn,
        keysByPath: ReadonlyMap<string, string | null>,
        handler: SetFilterHandler,
        sourceByDisplay: Map<string, SetValueEntry> | undefined
    ): ((entry: AutocompleteEntry) => AgSetValueAutocompleteRow) | undefined {
        const filterParams = handler.params.filterParams;
        const cellRenderer = filterParams.cellRenderer;
        if (!cellRenderer && !filterParams.treeList) {
            return undefined;
        }
        const colDef = column.getColDef();
        return (entry) => {
            const displayValue = entry.displayValue ?? entry.key;
            const childCount = entry.childCount;
            // A flattened match displays the whole path but stands for its leaf, which is what the Set
            // Filter's own list draws; the key comes with it rather than being looked up by that text.
            const source = sourceByDisplay?.get(displayValue);
            const label = source?.relativePath ? _last(source.relativePath)! : displayValue;
            // A group is a path segment, not a value, so there is nothing for a renderer to draw.
            const createCellRenderer =
                cellRenderer && childCount == null
                    ? () => {
                          // Only a flat value has text that names it on its own; a tree leaf is drawn from
                          // its segment, as the Set Filter draws it, however the list reached the leaf.
                          const key = keysByPath.get(handler.caseFormat(displayValue));
                          return _getCellRendererDetails(
                              this.userCompFactory,
                              filterParams,
                              _addGridCommonParams(this.gos, {
                                  value: key === undefined ? label : handler.valueModel.allValues.get(key),
                                  valueFormatted: label,
                                  colDef,
                                  column,
                              })
                          );
                      }
                    : undefined;
            return new AgSetValueAutocompleteRow(displayValue, childCount, createCellRenderer);
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
        if (!this.isSetFilterColumn(column)) {
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
        return _getFilterDetails(this.userCompFactory, column.getColDef(), params, 'agSetColumnFilter');
    }

    /** `true` = forFloatingFilter, whose always-true `doesRowPassOtherFilter` is what offers every row's value. */
    private createSharedParams(column: AgColumn): BaseFilterParams {
        // Guaranteed by the SetFilter module gate in `isSetFilterColumn`, which depends on the filter module.
        return this.beans.colFilter!.createBaseFilterParams(column, true);
    }

    /** `colDef` is what tells the value model its source may have changed; on the first build nothing has. */
    private createHandlerParams(column: AgColumn, source: 'init' | 'colDef'): SetHandlerParams {
        const colDef = column.getColDef();
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

const createKeyMaps = (): Pick<SetColumnValues, 'keysByPath' | 'sharedKeysByPath' | 'pathsByKey'> => ({
    keysByPath: new Map(),
    sharedKeysByPath: new Map(),
    pathsByKey: new Map(),
});

/**
 * Registers one leaf under the path it is written as. Keys that format alike are told apart by writing the
 * later ones as their key; where that collides too, or a lossy path getter gave two the same path, one entry
 * names them all. `path` is mutated in place, its last segment substituted, so no caller may reuse it.
 */
const addLeaf = (
    handler: SetFilterHandler,
    values: Pick<SetColumnValues, 'keysByPath' | 'sharedKeysByPath' | 'pathsByKey'>,
    path: string[],
    keys: readonly (string | null)[],
    into?: SetValueEntry[]
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
        into?.push({ displayValue: path[last], key });
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
    const values = createKeyMaps();
    for (let i = 0, len = allKeys.length; i < len; ++i) {
        const key = allKeys[i];
        addLeaf(handler, values, [handler.getFormattedValue(key) ?? ''], [key], entries);
    }
    return { entries, childrenByPath: new Map(), ...values };
};

const buildTreeValues = (setColumn: SetColumn, allKeys: SetFilterModelValue): SetColumnValues => {
    const handler = setColumn.handler;
    const treeListFormatter = handler.params.filterParams.treeListFormatter;

    const entries: SetValueEntry[] = [];
    const childrenByPath = new Map<string, SetValueEntry[]>();
    const values = createKeyMaps();
    const walk = (items: Map<string | null, SetFilterModelTreeItem>, path: string[], into: SetValueEntry[]): void => {
        for (const item of items.values()) {
            // A blank names itself the way the Set Filter's own list names it, so the two offer one label.
            const formatted =
                (treeListFormatter ? treeListFormatter(item.treeKey, item.depth, item.parentTreeKeys) : item.treeKey) ??
                translateForSetFilter(handler, 'blanks');
            const itemPath = [...path, formatted];
            const children = item.children;
            const keys = item.keys;
            if (children?.size) {
                const childEntries: SetValueEntry[] = [];
                childrenByPath.set(handler.caseFormat(joinPath(itemPath)), childEntries);
                walk(children, itemPath, childEntries);
                into.push({ displayValue: formatted, childCount: childEntries.length, children: childEntries });
                // A path getter can land a value on a group's own path. The group holds the only row, so
                // the value is not offered separately, but the path still has to resolve to it.
                if (keys) {
                    addLeaf(handler, values, itemPath, keys);
                }
                continue;
            }
            if (keys) {
                addLeaf(handler, values, itemPath, keys, into);
            }
        }
    };
    walk(handler.createDisplayValueTree(allKeys), [], entries);
    return { entries, childrenByPath, ...values };
};

/** The entries offered at a path: the top level for an empty path, a group's children otherwise. */
const getEntriesAtPath = (
    values: SetColumnValues,
    handler: SetFilterHandler,
    parentPath: readonly string[]
): SetValueEntry[] => {
    if (!parentPath.length) {
        return values.entries;
    }
    // Folded as `keysByPath` is, so a group typed in another case offers its children.
    return values.childrenByPath.get(handler.caseFormat(joinPath(parentPath))) ?? [];
};

/**
 * The entries still worth offering. A value already written is dropped, and so is a group with nothing
 * left beneath it; a group's count is of what it still offers, not of what it holds.
 */
const getAvailableEntries = (entries: SetValueEntry[], usedKeys: ReadonlySet<string | null>): SetValueEntry[] => {
    if (!usedKeys.size) {
        return entries;
    }
    const available: SetValueEntry[] = [];
    for (let i = 0, len = entries.length; i < len; ++i) {
        const entry = entries[i];
        const children = entry.children;
        if (!children) {
            if (!usedKeys.has(entry.key!)) {
                available.push(entry);
            }
            continue;
        }
        // What the group still offers is both the count to show and the reason to show it at all.
        const availableChildren = getAvailableEntries(children, usedKeys);
        if (availableChildren.length) {
            available.push({ ...entry, childCount: availableChildren.length, children: availableChildren });
        }
    }
    return available;
};

/**
 * Everything on offer anywhere beneath a path, named by the rest of the path to it: groups to drill
 * into as well as values, so typing searches the whole hierarchy rather than one level of it.
 */
const getFlattenedEntries = (entries: SetValueEntry[], parentPath: readonly string[]): SetValueEntry[] => {
    const flattened: SetValueEntry[] = [];
    const parentLength = parentPath.length;
    const walk = (level: SetValueEntry[], path: readonly string[]): void => {
        for (let i = 0, len = level.length; i < len; ++i) {
            const entry = level[i];
            const childPath = [...path, entry.displayValue];
            // Searching from the root is the common case, and there the whole path is the relative one.
            const relativePath = parentLength ? childPath.slice(parentLength) : childPath;
            flattened.push({
                displayValue: joinSetPath(relativePath),
                key: entry.key,
                childCount: entry.childCount,
                relativePath,
            });
            const children = entry.children;
            if (children) {
                walk(children, childPath);
            }
        }
    };
    walk(entries, parentPath);
    return flattened;
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
