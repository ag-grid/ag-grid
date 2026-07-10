<script setup lang="ts" generic="TData = any">

import { VueFrameworkComponentWrapper } from './VueFrameworkComponentWrapper';
import { VueFrameworkOverrides } from './VueFrameworkOverrides';
import type { Props } from './utils';
import { debounce, deepToRaw, getProps } from './utils';
import type { Ref } from 'vue';
import { getCurrentInstance, markRaw, onMounted, onUnmounted, shallowRef, toRefs, useTemplateRef, watch } from 'vue';

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

_GET_ALL_GRID_OPTIONS()
    .filter((propertyName: string) => propertyName != 'gridOptions') // dealt with in AgGridVue itself
    .forEach((propertyName: string) => {
        const propRef = propsAsRefs[propertyName];
        if (!propRef) return; // skip options not declared as Vue props
        watch(
            propRef,
            (newValue: any, oldValue: any) => {
                if ((propertyName === "rowData" && !emittingRowData.value) ||
                    propertyName !== "rowData") {
                    processChanges(propertyName, newValue, oldValue);
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
