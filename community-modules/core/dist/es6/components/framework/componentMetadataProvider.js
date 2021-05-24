/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, PostConstruct } from "../../context/context";
import { BeanStub } from "../../context/beanStub";
var ComponentMetadataProvider = /** @class */ (function (_super) {
    __extends(ComponentMetadataProvider, _super);
    function ComponentMetadataProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ComponentMetadataProvider.prototype.postConstruct = function () {
        this.componentMetaData = {
            dateComponent: {
                mandatoryMethodList: ['getDate', 'setDate'],
                optionalMethodList: ['afterGuiAttached', 'setInputPlaceholder', 'setInputAriaLabel']
            },
            detailCellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh']
            },
            headerComponent: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh']
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
                optionalMethodList: ['isPopup', 'isCancelBeforeStart', 'isCancelAfterEnd', 'getPopupPosition', 'focusIn', 'focusOut', 'afterGuiAttached']
            },
            innerRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            fullWidthCellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh', 'afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            pinnedRowCellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh', 'afterGuiAttached'],
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
        Autowired("agComponentUtils")
    ], ComponentMetadataProvider.prototype, "agComponentUtils", void 0);
    __decorate([
        PostConstruct
    ], ComponentMetadataProvider.prototype, "postConstruct", null);
    ComponentMetadataProvider = __decorate([
        Bean("componentMetadataProvider")
    ], ComponentMetadataProvider);
    return ComponentMetadataProvider;
}(BeanStub));
export { ComponentMetadataProvider };
