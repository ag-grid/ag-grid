var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AgGridVue_1;
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Bean, ComponentUtil, Grid } from '@ag-grid-community/core';
import { VueFrameworkComponentWrapper } from './VueFrameworkComponentWrapper';
import { getAgGridProperties } from './Utils';
import { AgGridColumn } from './AgGridColumn';
import { VueFrameworkOverrides } from './VueFrameworkOverrides';
const [props, watch, model] = getAgGridProperties();
let AgGridVue = AgGridVue_1 = class AgGridVue extends Vue {
    constructor() {
        super(...arguments);
        this.gridCreated = false;
        this.isDestroyed = false;
        this.gridReadyFired = false;
        this.emitRowModel = null;
    }
    static kebabProperty(property) {
        return property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    render(h) {
        return h('div');
    }
    globalEventListener(eventType, event) {
        if (this.isDestroyed) {
            return;
        }
        if (eventType === 'gridReady') {
            this.gridReadyFired = true;
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
    }
    processChanges(propertyName, currentValue, previousValue) {
        if (this.gridCreated) {
            if (this.skipChange(propertyName, currentValue, previousValue)) {
                return;
            }
            const changes = {};
            changes[propertyName] = {
                currentValue,
                previousValue,
            };
            ComponentUtil.processOnChange(changes, this.gridOptions, this.gridOptions.api, this.gridOptions.columnApi);
        }
    }
    // noinspection JSUnusedGlobalSymbols
    mounted() {
        // we debounce the model update to prevent a flood of updates in the event there are many individual
        // cell/row updates
        this.emitRowModel = this.debounce(() => {
            this.$emit('data-model-changed', Object.freeze(this.getRowData()));
        }, 20);
        const frameworkComponentWrapper = new VueFrameworkComponentWrapper(this);
        const gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
        this.checkForBindingConflicts();
        gridOptions.rowData = this.getRowDataBasedOnBindings();
        if (AgGridColumn.hasChildColumns(this.$slots)) {
            gridOptions.columnDefs = AgGridColumn.mapChildColumnDefs(this.$slots);
        }
        const gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkOverrides: new VueFrameworkOverrides(this),
            providedBeanInstances: {
                frameworkComponentWrapper,
            },
            modules: this.modules,
        };
        new Grid(this.$el, gridOptions, gridParams);
        this.gridCreated = true;
    }
    // noinspection JSUnusedGlobalSymbols
    destroyed() {
        if (this.gridCreated) {
            if (this.gridOptions.api) {
                this.gridOptions.api.destroy();
            }
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
        const rowData = [];
        this.gridOptions.api.forEachNode((rowNode) => {
            rowData.push(rowNode.data);
        });
        return rowData;
    }
    updateModelIfUsed(eventType) {
        if (this.gridReadyFired &&
            this.$listeners['data-model-changed'] &&
            AgGridVue_1.ROW_DATA_EVENTS.indexOf(eventType) !== -1) {
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
    /*
     * Prevents an infinite loop when using v-model for the rowData
     */
    skipChange(propertyName, currentValue, previousValue) {
        if (this.gridReadyFired &&
            propertyName === 'rowData' &&
            this.$listeners['data-model-changed']) {
            if (currentValue === previousValue) {
                return true;
            }
            if (currentValue && previousValue) {
                const currentRowData = currentValue;
                const previousRowData = previousValue;
                if (currentRowData.length === previousRowData.length) {
                    for (let i = 0; i < currentRowData.length; i++) {
                        if (currentRowData[i] !== previousRowData[i]) {
                            return false;
                        }
                    }
                    return true;
                }
            }
        }
        return false;
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
AgGridVue.ROW_DATA_EVENTS = ['rowDataChanged', 'rowDataUpdated', 'cellValueChanged', 'rowValueChanged'];
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
        watch,
        model,
    })
], AgGridVue);
export { AgGridVue };
