var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AgGridVue_1;
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Bean, ComponentUtil, Events, createGrid } from '@ag-grid-community/core';
import { VueFrameworkComponentWrapper } from './VueFrameworkComponentWrapper';
import { getAgGridProperties } from './Utils';
import { VueFrameworkOverrides } from './VueFrameworkOverrides';
const [props, computed, watch, model] = getAgGridProperties();
let AgGridVue = AgGridVue_1 = class AgGridVue extends Vue {
    constructor() {
        super(...arguments);
        this.gridCreated = false;
        this.isDestroyed = false;
        this.gridReadyFired = false;
        this.api = undefined;
        this.emitRowModel = null;
    }
    static kebabProperty(property) {
        return property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    render(h) {
        return h('div');
    }
    // It forces events defined in AgGridVue.ALWAYS_SYNC_GLOBAL_EVENTS to be fired synchronously.
    // This is required for events such as GridPreDestroyed.
    // Other events are fired can be fired asynchronously or synchronously depending on config.
    globalEventListenerFactory(restrictToSyncOnly) {
        return (eventType, event) => {
            if (this.isDestroyed) {
                return;
            }
            if (eventType === 'gridReady') {
                this.gridReadyFired = true;
            }
            const alwaysSync = AgGridVue_1.ALWAYS_SYNC_GLOBAL_EVENTS.has(eventType);
            if ((alwaysSync && !restrictToSyncOnly) || (!alwaysSync && restrictToSyncOnly)) {
                return;
            }
            this.updateModelIfUsed(eventType);
            // only emit if someone is listening
            // we allow both kebab and camelCase event listeners, so check for both
            const kebabName = AgGridVue_1.kebabProperty(eventType);
            if (this.$listeners[kebabName]) {
                this.$emit(kebabName, event);
            }
            else if (this.$listeners[eventType]) {
                this.$emit(eventType, event);
            }
        };
    }
    // noinspection JSUnusedGlobalSymbols
    mounted() {
        // we debounce the model update to prevent a flood of updates in the event there are many individual
        // cell/row updates
        this.emitRowModel = this.debounce(() => {
            this.$emit('data-model-changed', Object.freeze(this.getRowData()));
        }, 20);
        const frameworkComponentWrapper = new VueFrameworkComponentWrapper(this);
        const gridOptions = ComponentUtil.combineAttributesAndGridOptions(this.gridOptions, this);
        this.checkForBindingConflicts();
        const rowData = this.getRowDataBasedOnBindings();
        if (rowData !== ComponentUtil.VUE_OMITTED_PROPERTY) {
            gridOptions.rowData = rowData;
        }
        const gridParams = {
            globalEventListener: this.globalEventListenerFactory().bind(this),
            globalSyncEventListener: this.globalEventListenerFactory(true).bind(this),
            frameworkOverrides: new VueFrameworkOverrides(this),
            providedBeanInstances: {
                frameworkComponentWrapper,
            },
            modules: this.modules,
        };
        this.api = createGrid(this.$el, gridOptions, gridParams);
        this.gridCreated = true;
    }
    // noinspection JSUnusedGlobalSymbols
    destroyed() {
        var _a;
        if (this.gridCreated) {
            (_a = this.api) === null || _a === void 0 ? void 0 : _a.destroy();
            this.isDestroyed = true;
        }
    }
    checkForBindingConflicts() {
        const thisAsAny = this;
        if ((thisAsAny.rowData || this.gridOptions.rowData) &&
            thisAsAny.rowDataModel) {
            console.warn('AG Grid: Using both rowData and rowDataModel. rowData will be ignored.');
        }
    }
    getRowData() {
        var _a;
        const rowData = [];
        (_a = this.api) === null || _a === void 0 ? void 0 : _a.forEachNode((rowNode) => {
            rowData.push(rowNode.data);
        });
        return rowData;
    }
    updateModelIfUsed(eventType) {
        if (this.gridReadyFired &&
            this.$listeners['data-model-changed'] &&
            AgGridVue_1.ROW_DATA_EVENTS.has(eventType)) {
            if (this.emitRowModel) {
                this.emitRowModel();
            }
        }
    }
    getRowDataBasedOnBindings() {
        const thisAsAny = this;
        const rowDataModel = thisAsAny.rowDataModel;
        return rowDataModel ? rowDataModel :
            thisAsAny.rowData ? thisAsAny.rowData : thisAsAny.gridOptions.rowData;
    }
    debounce(func, delay) {
        let timeout;
        return () => {
            const later = function () {
                func();
            };
            window.clearTimeout(timeout);
            timeout = window.setTimeout(later, delay);
        };
    }
};
AgGridVue.ROW_DATA_EVENTS = new Set(['rowDataUpdated', 'cellValueChanged', 'rowValueChanged']);
AgGridVue.ALWAYS_SYNC_GLOBAL_EVENTS = new Set([Events.EVENT_GRID_PRE_DESTROYED]);
__decorate([
    Prop(Boolean)
], AgGridVue.prototype, "autoParamsRefresh", void 0);
__decorate([
    Prop({ default: () => [] })
], AgGridVue.prototype, "componentDependencies", void 0);
__decorate([
    Prop({ default: () => [] })
], AgGridVue.prototype, "modules", void 0);
AgGridVue = AgGridVue_1 = __decorate([
    Bean('agGridVue'),
    Component({
        props,
        computed,
        watch,
        model,
    })
], AgGridVue);
export { AgGridVue };
