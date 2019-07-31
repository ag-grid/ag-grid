/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../../context/context");
var agComponentUtils_1 = require("./agComponentUtils");
var ComponentMetadataProvider = /** @class */ (function () {
    function ComponentMetadataProvider() {
    }
    ComponentMetadataProvider.prototype.postConstruct = function () {
        this.componentMetaData = {
            dateComponent: {
                mandatoryMethodList: ['getDate', 'setDate'],
                optionalMethodList: ['afterGuiAttached']
            },
            detailCellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            headerComponent: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            headerGroupComponent: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            loadingCellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            loadingOverlayComponent: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            noRowsOverlayComponent: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            floatingFilterComponent: {
                mandatoryMethodList: ['onParentModelChanged'],
                optionalMethodList: ['afterGuiAttached']
            },
            floatingFilterWrapperComponent: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            cellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh', 'afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            cellEditor: {
                mandatoryMethodList: ['getValue'],
                optionalMethodList: ['isPopup', 'isCancelBeforeStart', 'isCancelAfterEnd', 'focusIn', 'focusOut', 'afterGuiAttached']
            },
            innerRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            fullWidthCellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            pinnedRowCellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh', 'afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            groupRowInnerRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            groupRowRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            filter: {
                mandatoryMethodList: ['isFilterActive', 'doesFilterPass', 'getModel', 'setModel'],
                optionalMethodList: ['afterGuiAttached', 'onNewRowsLoaded', 'getModelAsString', 'onFloatingFilterChanged']
            },
            filterComponent: {
                mandatoryMethodList: ['isFilterActive', 'doesFilterPass', 'getModel', 'setModel'],
                optionalMethodList: ['afterGuiAttached', 'onNewRowsLoaded', 'getModelAsString', 'onFloatingFilterChanged']
            },
            statusPanel: {
                mandatoryMethodList: [],
                optionalMethodList: ['afterGuiAttached'],
            },
            toolPanel: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh', 'afterGuiAttached']
            },
            tooltipComponent: {
                mandatoryMethodList: [],
                optionalMethodList: []
            }
        };
    };
    ComponentMetadataProvider.prototype.retrieve = function (name) {
        return this.componentMetaData[name];
    };
    __decorate([
        context_1.Autowired("agComponentUtils"),
        __metadata("design:type", agComponentUtils_1.AgComponentUtils)
    ], ComponentMetadataProvider.prototype, "agComponentUtils", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ComponentMetadataProvider.prototype, "postConstruct", null);
    ComponentMetadataProvider = __decorate([
        context_1.Bean("componentMetadataProvider")
    ], ComponentMetadataProvider);
    return ComponentMetadataProvider;
}());
exports.ComponentMetadataProvider = ComponentMetadataProvider;
