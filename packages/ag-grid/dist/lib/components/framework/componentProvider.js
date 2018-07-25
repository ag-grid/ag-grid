/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
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
var textCellEditor_1 = require("../../rendering/cellEditors/textCellEditor");
var context_1 = require("../../context/context");
var dateFilter_1 = require("../../filter/dateFilter");
var headerComp_1 = require("../../headerRendering/header/headerComp");
var headerGroupComp_1 = require("../../headerRendering/headerGroup/headerGroupComp");
var floatingFilter_1 = require("../../filter/floatingFilter");
var componentResolver_1 = require("./componentResolver");
var groupCellRenderer_1 = require("../../rendering/cellRenderers/groupCellRenderer");
var animateShowChangeCellRenderer_1 = require("../../rendering/cellRenderers/animateShowChangeCellRenderer");
var animateSlideCellRenderer_1 = require("../../rendering/cellRenderers/animateSlideCellRenderer");
var rowComp_1 = require("../../rendering/rowComp");
var selectCellEditor_1 = require("../../rendering/cellEditors/selectCellEditor");
var popupTextCellEditor_1 = require("../../rendering/cellEditors/popupTextCellEditor");
var popupSelectCellEditor_1 = require("../../rendering/cellEditors/popupSelectCellEditor");
var largeTextCellEditor_1 = require("../../rendering/cellEditors/largeTextCellEditor");
var textFilter_1 = require("../../filter/textFilter");
var numberFilter_1 = require("../../filter/numberFilter");
var loadingOverlayComponent_1 = require("../../rendering/overlays/loadingOverlayComponent");
var noRowsOverlayComponent_1 = require("../../rendering/overlays/noRowsOverlayComponent");
var utils_1 = require("../../utils");
var RegisteredComponentSource;
(function (RegisteredComponentSource) {
    RegisteredComponentSource[RegisteredComponentSource["DEFAULT"] = 0] = "DEFAULT";
    RegisteredComponentSource[RegisteredComponentSource["REGISTERED"] = 1] = "REGISTERED";
})(RegisteredComponentSource = exports.RegisteredComponentSource || (exports.RegisteredComponentSource = {}));
var ComponentProvider = (function () {
    function ComponentProvider() {
        this.agGridDefaults = {
            //date
            agDateInput: dateFilter_1.DefaultDateComponent,
            //header
            agColumnHeader: headerComp_1.HeaderComp,
            agColumnGroupHeader: headerGroupComp_1.HeaderGroupComp,
            //floating filters
            agSetColumnFloatingFilter: floatingFilter_1.SetFloatingFilterComp,
            agTextColumnFloatingFilter: floatingFilter_1.TextFloatingFilterComp,
            agNumberColumnFloatingFilter: floatingFilter_1.NumberFloatingFilterComp,
            agDateColumnFloatingFilter: floatingFilter_1.DateFloatingFilterComp,
            // renderers
            agAnimateShowChangeCellRenderer: animateShowChangeCellRenderer_1.AnimateShowChangeCellRenderer,
            agAnimateSlideCellRenderer: animateSlideCellRenderer_1.AnimateSlideCellRenderer,
            agGroupCellRenderer: groupCellRenderer_1.GroupCellRenderer,
            agGroupRowRenderer: groupCellRenderer_1.GroupCellRenderer,
            agLoadingCellRenderer: rowComp_1.LoadingCellRenderer,
            //editors
            agCellEditor: textCellEditor_1.TextCellEditor,
            agTextCellEditor: textCellEditor_1.TextCellEditor,
            agSelectCellEditor: selectCellEditor_1.SelectCellEditor,
            agPopupTextCellEditor: popupTextCellEditor_1.PopupTextCellEditor,
            agPopupSelectCellEditor: popupSelectCellEditor_1.PopupSelectCellEditor,
            agLargeTextCellEditor: largeTextCellEditor_1.LargeTextCellEditor,
            //filter
            agTextColumnFilter: textFilter_1.TextFilter,
            agNumberColumnFilter: numberFilter_1.NumberFilter,
            agDateColumnFilter: dateFilter_1.DateFilter,
            //overlays
            agLoadingOverlay: loadingOverlayComponent_1.LoadingOverlayComponent,
            agNoRowsOverlay: noRowsOverlayComponent_1.NoRowsOverlayComponent
        };
        this.agDeprecatedNames = {
            set: {
                newComponentName: 'agSetColumnFilter',
                propertyHolder: 'filter'
            },
            text: {
                newComponentName: 'agTextColumnFilter',
                propertyHolder: 'filter'
            },
            number: {
                newComponentName: 'agNumberColumnFilter',
                propertyHolder: 'filter'
            },
            date: {
                newComponentName: 'agDateColumnFilter',
                propertyHolder: 'filter'
            },
            group: {
                newComponentName: 'agGroupCellRenderer',
                propertyHolder: 'cellRenderer'
            },
            animateShowChange: {
                newComponentName: 'agAnimateShowChangeCellRenderer',
                propertyHolder: 'cellRenderer'
            },
            animateSlide: {
                newComponentName: 'agAnimateSlideCellRenderer',
                propertyHolder: 'cellRenderer'
            },
            select: {
                newComponentName: 'agSelectCellEditor',
                propertyHolder: 'cellEditor'
            },
            largeText: {
                newComponentName: 'agLargeTextCellEditor',
                propertyHolder: 'cellEditor'
            },
            popupSelect: {
                newComponentName: 'agPopupSelectCellEditor',
                propertyHolder: 'cellEditor'
            },
            popupText: {
                newComponentName: 'agPopupTextCellEditor',
                propertyHolder: 'cellEditor'
            },
            richSelect: {
                newComponentName: 'agRichSelectCellEditor',
                propertyHolder: 'cellEditor'
            },
            headerComponent: {
                newComponentName: 'agColumnHeader',
                propertyHolder: 'headerComponent'
            }
        };
        this.jsComponents = {};
        this.frameworkComponents = {};
    }
    ComponentProvider.prototype.init = function () {
        var _this = this;
        if (this.gridOptions.components != null) {
            Object.keys(this.gridOptions.components).forEach(function (it) {
                _this.registerComponent(it, _this.gridOptions.components[it]);
            });
        }
        if (this.gridOptions.frameworkComponents != null) {
            Object.keys(this.gridOptions.frameworkComponents).forEach(function (it) {
                _this.registerFwComponent(it, _this.gridOptions.frameworkComponents[it]);
            });
        }
    };
    ComponentProvider.prototype.registerDefaultComponent = function (rawName, component, overridable) {
        if (overridable === void 0) { overridable = true; }
        var name = this.translateIfDeprecated(rawName);
        if (this.agGridDefaults[name]) {
            console.error("Trying to overwrite a default component. You should call registerComponent");
            return;
        }
        this.agGridDefaults[name] = component;
    };
    ComponentProvider.prototype.registerComponent = function (rawName, component) {
        var name = this.translateIfDeprecated(rawName);
        if (this.frameworkComponents[name]) {
            console.error("Trying to register a component that you have already registered for frameworks: " + name);
            return;
        }
        this.jsComponents[name] = component;
    };
    /**
     * B the business interface (ie IHeader)
     * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
     */
    ComponentProvider.prototype.registerFwComponent = function (rawName, component) {
        var name = this.translateIfDeprecated(rawName);
        if (this.jsComponents[name]) {
            console.error("Trying to register a component that you have already registered for plain javascript: " + name);
            return;
        }
        this.frameworkComponents[name] = component;
    };
    /**
     * B the business interface (ie IHeader)
     * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
     */
    ComponentProvider.prototype.retrieve = function (rawName) {
        var name = this.translateIfDeprecated(rawName);
        if (this.frameworkComponents[name]) {
            return {
                type: componentResolver_1.ComponentType.FRAMEWORK,
                component: this.frameworkComponents[name],
                source: RegisteredComponentSource.REGISTERED
            };
        }
        if (this.jsComponents[name]) {
            return {
                type: componentResolver_1.ComponentType.AG_GRID,
                component: this.jsComponents[name],
                source: RegisteredComponentSource.REGISTERED
            };
        }
        if (this.agGridDefaults[name]) {
            return this.agGridDefaults[name] ?
                {
                    type: componentResolver_1.ComponentType.AG_GRID,
                    component: this.agGridDefaults[name],
                    source: RegisteredComponentSource.DEFAULT
                } :
                null;
        }
        if (Object.keys(this.agGridDefaults).indexOf(name) < 0) {
            console.warn("ag-grid: Looking for component [" + name + "] but it wasn't found.");
        }
        return null;
    };
    ComponentProvider.prototype.translateIfDeprecated = function (raw) {
        var deprecatedInfo = this.agDeprecatedNames[raw];
        if (deprecatedInfo != null) {
            utils_1._.doOnce(function () {
                console.warn("ag-grid. Since v15.0 component names have been renamed to be namespaced. You should rename " + deprecatedInfo.propertyHolder + ":" + raw + " to " + deprecatedInfo.propertyHolder + ":" + deprecatedInfo.newComponentName);
            }, 'DEPREACTE_COMPONENT_' + raw);
            return deprecatedInfo.newComponentName;
        }
        return raw;
    };
    __decorate([
        context_1.Autowired('gridOptions'),
        __metadata("design:type", Object)
    ], ComponentProvider.prototype, "gridOptions", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ComponentProvider.prototype, "init", null);
    ComponentProvider = __decorate([
        context_1.Bean('componentProvider')
    ], ComponentProvider);
    return ComponentProvider;
}());
exports.ComponentProvider = ComponentProvider;
