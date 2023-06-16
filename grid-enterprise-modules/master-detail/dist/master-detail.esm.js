/**
          * @ag-grid-enterprise/master-detail - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v30.0.1
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
import { Autowired, BeanStub, RowNode, Events, _, RefSelector, Component, Grid, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class DetailCellRendererCtrl extends BeanStub {
    constructor() {
        super(...arguments);
        this.loadRowDataVersion = 0;
        this.needRefresh = false;
    }
    init(comp, params) {
        this.params = params;
        this.comp = comp;
        const doNothingBecauseInsidePinnedSection = params.pinned != null;
        if (doNothingBecauseInsidePinnedSection) {
            return;
        }
        this.setAutoHeightClasses();
        this.setupRefreshStrategy();
        this.addThemeToDetailGrid();
        this.createDetailGrid();
        this.loadRowData();
        this.addManagedListener(params.node.parent, RowNode.EVENT_DATA_CHANGED, () => {
            this.needRefresh = true;
        });
        this.addManagedListener(this.eventService, Events.EVENT_FULL_WIDTH_ROW_FOCUSED, this.onFullWidthRowFocused.bind(this));
    }
    onFullWidthRowFocused(e) {
        const params = this.params;
        const row = { rowIndex: params.node.rowIndex, rowPinned: params.node.rowPinned };
        const eventRow = { rowIndex: e.rowIndex, rowPinned: e.rowPinned };
        const isSameRow = this.rowPositionUtils.sameRow(row, eventRow);
        if (!isSameRow) {
            return;
        }
        this.focusService.focusInto(this.comp.getGui(), e.fromBelow);
    }
    setAutoHeightClasses() {
        const autoHeight = this.gridOptionsService.is('detailRowAutoHeight');
        const parentClass = autoHeight ? 'ag-details-row-auto-height' : 'ag-details-row-fixed-height';
        const detailClass = autoHeight ? 'ag-details-grid-auto-height' : 'ag-details-grid-fixed-height';
        this.comp.addOrRemoveCssClass(parentClass, true);
        this.comp.addOrRemoveDetailGridCssClass(detailClass, true);
    }
    setupRefreshStrategy() {
        const providedStrategy = this.params.refreshStrategy;
        const validSelection = providedStrategy == 'everything' || providedStrategy == 'nothing' || providedStrategy == 'rows';
        if (validSelection) {
            this.refreshStrategy = providedStrategy;
            return;
        }
        if (providedStrategy != null) {
            console.warn("AG Grid: invalid cellRendererParams.refreshStrategy = '" + providedStrategy +
                "' supplied, defaulting to refreshStrategy = 'rows'.");
        }
        this.refreshStrategy = 'rows';
    }
    addThemeToDetailGrid() {
        // this is needed by environment service of the child grid, the class needs to be on
        // the grid div itself - the browser's CSS on the other hand just inherits from the parent grid theme.
        const { theme } = this.environment.getTheme();
        if (theme) {
            this.comp.addOrRemoveDetailGridCssClass(theme, true);
        }
    }
    createDetailGrid() {
        if (_.missing(this.params.detailGridOptions)) {
            console.warn('AG Grid: could not find detail grid options for master detail, ' +
                'please set gridOptions.detailCellRendererParams.detailGridOptions');
            return;
        }
        const autoHeight = this.gridOptionsService.is('detailRowAutoHeight');
        // we clone the detail grid options, as otherwise it would be shared
        // across many instances, and that would be a problem because we set
        // api and columnApi into gridOptions
        const gridOptions = Object.assign({}, this.params.detailGridOptions);
        if (autoHeight) {
            gridOptions.domLayout = 'autoHeight';
        }
        this.comp.setDetailGrid(gridOptions);
    }
    registerDetailWithMaster(api, columnApi) {
        const rowId = this.params.node.id;
        const masterGridApi = this.params.api;
        const gridInfo = {
            id: rowId,
            api: api,
            columnApi: columnApi
        };
        const rowNode = this.params.node;
        // register with api
        masterGridApi.addDetailGridInfo(rowId, gridInfo);
        // register with node
        rowNode.detailGridInfo = gridInfo;
        this.addDestroyFunc(() => {
            // the gridInfo can be stale if a refresh happens and
            // a new row is created before the old one is destroyed.
            if (rowNode.detailGridInfo !== gridInfo) {
                return;
            }
            masterGridApi.removeDetailGridInfo(rowId); // unregister from api
            rowNode.detailGridInfo = null; // unregister from node
        });
    }
    loadRowData() {
        // in case a refresh happens before the last refresh completes (as we depend on async
        // application logic) we keep track on what the latest call was.
        this.loadRowDataVersion++;
        const versionThisCall = this.loadRowDataVersion;
        const userFunc = this.params.getDetailRowData;
        if (!userFunc) {
            console.warn('AG Grid: could not find getDetailRowData for master / detail, ' +
                'please set gridOptions.detailCellRendererParams.getDetailRowData');
            return;
        }
        const successCallback = (rowData) => {
            const mostRecentCall = this.loadRowDataVersion === versionThisCall;
            if (mostRecentCall) {
                this.comp.setRowData(rowData);
            }
        };
        const funcParams = {
            node: this.params.node,
            // we take data from node, rather than params.data
            // as the data could have been updated with new instance
            data: this.params.node.data,
            successCallback: successCallback,
            context: this.gridOptionsService.context
        };
        userFunc(funcParams);
    }
    refresh() {
        const GET_GRID_TO_REFRESH = false;
        const GET_GRID_TO_DO_NOTHING = true;
        // if we return true, it means we pretend to the grid
        // that we have refreshed, so refresh will never happen.
        const doNotRefresh = !this.needRefresh || this.refreshStrategy === 'nothing';
        if (doNotRefresh) {
            // we do nothing in this refresh method, and also tell the grid to do nothing
            return GET_GRID_TO_DO_NOTHING;
        }
        // reset flag, so don't refresh again until more data changes.
        this.needRefresh = false;
        if (this.refreshStrategy === 'everything') {
            // we want full refresh, so tell the grid to destroy and recreate this cell
            return GET_GRID_TO_REFRESH;
        }
        else {
            // do the refresh here, and tell the grid to do nothing
            this.loadRowData();
            return GET_GRID_TO_DO_NOTHING;
        }
    }
}
__decorate$1([
    Autowired('rowPositionUtils')
], DetailCellRendererCtrl.prototype, "rowPositionUtils", void 0);
__decorate$1([
    Autowired('focusService')
], DetailCellRendererCtrl.prototype, "focusService", void 0);

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class DetailCellRenderer extends Component {
    init(params) {
        this.params = params;
        this.selectAndSetTemplate();
        const compProxy = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            addOrRemoveDetailGridCssClass: (cssClassName, on) => this.eDetailGrid.classList.toggle(cssClassName, on),
            setDetailGrid: gridOptions => this.setDetailGrid(gridOptions),
            setRowData: rowData => this.setRowData(rowData),
            getGui: () => this.eDetailGrid
        };
        this.ctrl = this.createManagedBean(new DetailCellRendererCtrl());
        this.ctrl.init(compProxy, params);
    }
    refresh() {
        return this.ctrl && this.ctrl.refresh();
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
    selectAndSetTemplate() {
        if (this.params.pinned) {
            this.setTemplate('<div class="ag-details-row"></div>');
            return;
        }
        const setDefaultTemplate = () => {
            this.setTemplate(DetailCellRenderer.TEMPLATE);
        };
        if (_.missing(this.params.template)) {
            // use default template
            setDefaultTemplate();
        }
        else {
            // use user provided template
            if (typeof this.params.template === 'string') {
                this.setTemplate(this.params.template);
            }
            else if (typeof this.params.template === 'function') {
                const templateFunc = this.params.template;
                const template = templateFunc(this.params);
                this.setTemplate(template);
            }
            else {
                console.warn('AG Grid: detailCellRendererParams.template should be function or string');
                setDefaultTemplate();
            }
        }
        if (this.eDetailGrid == null) {
            console.warn('AG Grid: reference to eDetailGrid was missing from the details template. ' +
                'Please add ref="eDetailGrid" to the template.');
        }
    }
    setDetailGrid(gridOptions) {
        if (!this.eDetailGrid) {
            return;
        }
        // AG-1715
        // this is only needed when suppressReactUi=true, once we remove the old way
        // of doing react, and Master / Details is all native React, then we
        // can remove this code.
        const agGridReact = this.context.getBean('agGridReact');
        const agGridReactCloned = agGridReact ? _.cloneObject(agGridReact) : undefined;
        // when we create detail grid, the detail grid needs frameworkComponentWrapper so that
        // it created child components correctly, ie  Angular detail grid can have Angular cell renderer.
        // this is only used by Angular and Vue, as React uses native React AG Grid detail grids
        const frameworkComponentWrapper = this.context.getBean('frameworkComponentWrapper');
        const frameworkOverrides = this.getFrameworkOverrides();
        // tslint:disable-next-line
        new Grid(this.eDetailGrid, gridOptions, {
            frameworkOverrides,
            providedBeanInstances: {
                agGridReact: agGridReactCloned,
                frameworkComponentWrapper: frameworkComponentWrapper
            }
        });
        this.detailApi = gridOptions.api;
        this.ctrl.registerDetailWithMaster(gridOptions.api, gridOptions.columnApi);
        this.addDestroyFunc(() => {
            if (gridOptions.api) {
                gridOptions.api.destroy();
            }
        });
    }
    setRowData(rowData) {
        // ensure detail grid api still exists (grid may be destroyed when async call tries to set data)
        this.detailApi && this.detailApi.setRowData(rowData);
    }
}
DetailCellRenderer.TEMPLATE = `<div class="ag-details-row" role="gridcell">
            <div ref="eDetailGrid" class="ag-details-grid" role="presentation"></div>
        </div>`;
__decorate([
    RefSelector('eDetailGrid')
], DetailCellRenderer.prototype, "eDetailGrid", void 0);

// DO NOT UPDATE MANUALLY: Generated from script during build time
const VERSION = '30.0.1';

const MasterDetailModule = {
    version: VERSION,
    moduleName: ModuleNames.MasterDetailModule,
    beans: [],
    userComponents: [
        { componentName: 'agDetailCellRenderer', componentClass: DetailCellRenderer }
    ],
    controllers: [
        { controllerName: 'detailCellRenderer', controllerClass: DetailCellRendererCtrl }
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

export { MasterDetailModule };
