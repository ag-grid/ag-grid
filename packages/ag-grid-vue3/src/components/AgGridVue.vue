<script setup lang="ts" generic="TData = any">

import { VueFrameworkComponentWrapper } from './VueFrameworkComponentWrapper';
import { VueFrameworkOverrides } from './VueFrameworkOverrides';
import type { Props } from './utils';
import { debounce, deepToRaw, getProps } from './utils';
import type { Ref } from 'vue';
import {
    defineComponent,
    getCurrentInstance,
    h,
    markRaw,
    onMounted,
    onUnmounted,
    shallowRef,
    toRefs,
    useSlots,
    useTemplateRef,
    watch,
} from 'vue';

import type { AgEventType, GridApi, GridOptions, IRowNode } from 'ag-grid-community';
import {
    ALWAYS_SYNC_GLOBAL_EVENTS,
    _registerModule,
    RowApiModule,
    _PUBLIC_EVENT_HANDLERS_MAP,
    _GET_ALL_GRID_OPTIONS,
    _GET_SHALLOW_GRID_OPTIONS,
    _combineAttributesAndGridOptions,
    _processOnChange,
    createGrid,
} from 'ag-grid-community';

const props = withDefaults(defineProps<Props<TData>>(), getProps());

const rootRef = useTemplateRef<HTMLDivElement>('root');

// shallowRef avoids deep reactive proxying — grid API and simple flags only change at the top level
const api: Ref<GridApi | undefined> = shallowRef(undefined);
const gridCreated = shallowRef(false);
const isDestroyed = shallowRef(false);
const gridReadyFired = shallowRef(false);
// transient batch state doesn't need Vue reactivity tracking
let batchChanges: { [key: string]: any } = {};
let batchScheduled = false;

// setup up watches
const propsAsRefs = toRefs<any>(props);
// Per-option shallow vs deep watching — reduces overhead for options that don't need deep tracking
const shallowOptions: Set<string> = new Set(_GET_SHALLOW_GRID_OPTIONS());

// cell slots
const slots = useSlots();
const slotCellRenderers = new Map<string, any>();

const getSlotCellRenderer = (slotName: string) => {
    let component = slotCellRenderers.get(slotName);
    if (!component) {
        component = defineComponent({
            props: { params: { type: Object, required: true } },
            setup(props: any) {
                // Wrapped in a single host element: the mounting pipeline uses only the rendered
                // fragment's firstElementChild as the cell's GUI, so multi-root or text-only slot
                // content would otherwise be silently dropped.
                // withCtx-wrapped slot functions carry their own component context, so calling them from this unrelated wrapper still resolves provide/inject correctly
                return () => h('span', slots[slotName]?.(props.params));
            },
        });
        slotCellRenderers.set(slotName, component);
    }
    return component;
};

// An unset (undefined) component prop falls back to the same-named gridOptions property, matching
// the precedence _combineAttributesAndGridOptions applies when the grid is built — an explicit
// null prop is a real override there, so it must not fall back either.
const getEffectiveOption = (name: string): any => {
    const value = (props as any)[name];
    return value !== undefined ? value : (props.gridOptions as any)?.[name];
};

const hasCellSlot = (): boolean => Object.keys(slots).some((slotName) => slotName.startsWith('cell-'));

const hasRendererFromTypeOrDefault = (colDef: any): boolean => {
    const defaultColDef = getEffectiveOption('defaultColDef') as
        | { type?: any; cellRenderer?: any; cellRendererSelector?: any }
        | undefined;
    // A colDef with no type of its own inherits defaultColDef's, same as _addColumnDefaultAndTypes.
    const effectiveType = colDef.type ?? defaultColDef?.type;

    let typeKeys: string[];
    if (Array.isArray(effectiveType)) {
        typeKeys = effectiveType;
    } else if (typeof effectiveType === 'string') {
        typeKeys = effectiveType.split(',');
    } else {
        typeKeys = [];
    }
    // Core's own type-key resolution (mergeTypeKeys) trims every key, array-sourced or not.
    typeKeys = typeKeys.map((key) => key.trim());

    const columnTypes = getEffectiveOption('columnTypes') as { [key: string]: any } | undefined;
    const hasTypeRenderer = typeKeys.some((key) => {
        const typeDef = columnTypes?.[key];
        return typeDef?.cellRenderer != null || typeDef?.cellRendererSelector != null;
    });

    return (
        hasTypeRenderer || defaultColDef?.cellRenderer != null || defaultColDef?.cellRendererSelector != null
    );
};

const applyCellSlots = (columnDefs: any): any => {
    if (!columnDefs) return columnDefs;
    return columnDefs.map((colDef: any) => {
        if (colDef.children) {
            return { ...colDef, children: applyCellSlots(colDef.children) };
        }
        const colId = colDef.colId ?? colDef.field;
        const slotName = colId != null ? `cell-${colId}` : undefined;
        if (
            slotName &&
            slots[slotName] &&
            colDef.cellRenderer == null &&
            colDef.cellRendererSelector == null &&
            !hasRendererFromTypeOrDefault(colDef)
        ) {
            return { ...colDef, cellRenderer: getSlotCellRenderer(slotName) };
        }
        return colDef;
    });
};
// cell slots end

_GET_ALL_GRID_OPTIONS()
    .filter((propertyName: string) => propertyName != 'gridOptions') // dealt with in AgGridVue itself
    .forEach((propertyName: string) => {
        const propRef = propsAsRefs[propertyName];
        if (!propRef) return; // skip options not declared as Vue props
        watch(
            propRef,
            (newValue: any, oldValue: any) => {
                const value = propertyName === 'columnDefs' ? applyCellSlots(newValue) : newValue;
                // A reactive defaultColDef/columnTypes change can add or remove an inherited
                // renderer, so slot-vs-renderer precedence must be re-decided against the current
                // columnDefs — the earlier decision baked into an already-transformed value goes
                // stale otherwise. Skipped when no cell-* slot is in use, so this never resubmits
                // columnDefs (and so never clobbers columns changed since via the grid API) for the
                // common case where the feature isn't used at all.
                if ((propertyName === 'defaultColDef' || propertyName === 'columnTypes') && hasCellSlot()) {
                    const columnDefsSource = getEffectiveOption('columnDefs');
                    if (columnDefsSource) {
                        processChanges('columnDefs', applyCellSlots(columnDefsSource), undefined);
                    }
                }
                if ((propertyName === "rowData" && !emittingRowData.value) ||
                    propertyName !== "rowData") {
                    processChanges(propertyName, value, oldValue);
                }
                if (propertyName === "rowData") {
                    emittingRowData.value = false;
                }
            },
            shallowOptions.has(propertyName) ? undefined : { deep: true }
        );
    });

// v-model code start
const ROW_DATA_EVENTS: Set<string> = new Set(['rowDataUpdated', 'cellValueChanged', 'rowValueChanged']);
const rowDataModel = defineModel<TData[]>();
const rowDataUpdating = shallowRef(false);
const emittingRowData = shallowRef(false);
const emits = defineEmits<{
    'update:modelValue': [event: TData[]];
}>();
watch(
    rowDataModel,
    (newValue: any, oldValue: any) => {
        if (gridCreated.value) {
            if(!emittingRowData.value) {
                rowDataUpdating.value = true;
                processChanges('rowData', deepToRaw(newValue), deepToRaw(oldValue));
            }
            emittingRowData.value = false
        }
    },
    { deep: true }
);

const emitRowModel = debounce(() => {
    emittingRowData.value = true;
    emits('update:modelValue', getRowData());
}, 10);

const thisInstance = getCurrentInstance();

const updateModelIfUsed = (eventType: string) => {
    if (gridReadyFired.value && ROW_DATA_EVENTS.has(eventType)) {
        if (thisInstance?.vnode?.props?.["onUpdate:modelValue"]) {
            emitRowModel();
        }
    }
};
// v-model code end

const getRowDataBasedOnBindings = () => {
    return rowDataModel.value || props.rowData || props.gridOptions.rowData;
};

const getRowData = (): TData[] => {
    const rowData: any[] = [];
    api?.value!.forEachLeafNode((rowNode: IRowNode) => {
        rowData.push(rowNode.data);
    });
    return rowData;
};

const globalEventListenerFactory = (restrictToSyncOnly?: boolean) => {
    return (eventType: AgEventType) => {
        if (isDestroyed.value) {
            return;
        }

        if (eventType === 'gridReady') {
            gridReadyFired.value = true;
        }

        const alwaysSync = ALWAYS_SYNC_GLOBAL_EVENTS.has(eventType);
        if ((alwaysSync && !restrictToSyncOnly) || (!alwaysSync && restrictToSyncOnly)) {
            return;
        }

        if (ROW_DATA_EVENTS.has(eventType)) {
            if (!rowDataUpdating.value && gridCreated.value) {
                updateModelIfUsed(eventType);
            }
            rowDataUpdating.value = false;
        }
    };
};

const processChanges = (propertyName: string, currentValue: any, _previousValue?: any) => {
    if (gridCreated.value) {
        let value = currentValue;
        if (propertyName === 'rowData' && value != undefined) {
            // Prevent the grids internal edits from being reactive
            value = deepToRaw<TData[]>(value);
        }

        batchChanges[propertyName] = value;
        if (!batchScheduled) {
            batchScheduled = true;
            // queueMicrotask fires sooner than setTimeout(0) (microtask vs macrotask), reducing latency
            queueMicrotask(() => {
                batchScheduled = false;
                // Guard against updates after grid destruction (microtask may fire after unmount)
                if (!isDestroyed.value && api.value) {
                    _processOnChange(batchChanges, api.value!);
                }
                batchChanges = {};
            });
        }
    }
};

const getProvides = () => {
    return Object.create((getCurrentInstance() as any).provides);
};

onMounted(() => {
    // Row API module is required for getRowData to work
    _registerModule(RowApiModule,undefined);
    const frameworkComponentWrapper = new VueFrameworkComponentWrapper(getCurrentInstance(), getProvides());

    const gridParams = {
        globalListener: globalEventListenerFactory(),
        globalSyncListener: globalEventListenerFactory(true),
        frameworkOverrides: new VueFrameworkOverrides(getCurrentInstance()),
        providedBeanInstances: {
            frameworkCompWrapper: frameworkComponentWrapper,
        },
        modules: props.modules,
    };

    const gridOptions = markRaw(
        _combineAttributesAndGridOptions(deepToRaw<GridOptions<TData>>(props.gridOptions), props, [
            ..._GET_ALL_GRID_OPTIONS(),
            // we could have replaced it with GRID_OPTIONS_VALIDATORS().allProperties,
            // but that prevents tree shaking of validation code in Vue
            ...Object.values(_PUBLIC_EVENT_HANDLERS_MAP),
        ])
    );
    gridOptions.columnDefs = applyCellSlots(gridOptions.columnDefs);

    const rowData = getRowDataBasedOnBindings();
    if (rowData !== undefined) {
        rowDataUpdating.value = true;
        gridOptions.rowData = deepToRaw(rowData as TData[]);
    }

    api.value = createGrid(rootRef.value!, gridOptions, gridParams);
    gridCreated.value = true;
});

onUnmounted(() => {
  if (gridCreated.value) {
    // Cancel pending debounced timer to prevent callbacks after grid destruction
    emitRowModel.cancel();
    api?.value?.destroy();
    isDestroyed.value = true;
  }
});

defineExpose({
    api,
});
</script>

<template>
    <div ref="root"></div>
</template>

<style scoped></style>
