/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v15.0.0
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
var floatingFilterWrapper_1 = require("../../filter/floatingFilterWrapper");
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
var overlayWrapperComponent_1 = require("../../rendering/overlays/overlayWrapperComponent");
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
        this.agDeprecatedNames = {};
        this.jsComponents = {};
        this.frameworkComponents = {};
    }
    ComponentProvider.prototype.postConstruct = function () {
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
        this.agGridDefaults = {
            //THE FOLLOWING COMPONENTS HAVE NO DEFAULTS, THEY NEED TO BE SPECIFIED AS AN SPECIFIC FLAVOUR
            //THERE ARE NO DEFAULTS THAT FIT ALL PURPOSES
            //THEY ARE ADDED HERE TO AVOID THE NOT FOUND WARNING.
            agColumnFilter: {
                defaultImpl: null,
                overridable: false
            },
            agCustomColumnFloatingFilter: {
                defaultImpl: null,
                overridable: false
            },
            //date
            agDateInput: {
                defaultImpl: dateFilter_1.DefaultDateComponent,
                overridable: true
            },
            //header
            agColumnHeader: {
                defaultImpl: headerComp_1.HeaderComp,
                overridable: true
            },
            agColumnGroupHeader: {
                defaultImpl: headerGroupComp_1.HeaderGroupComp,
                overridable: true
            },
            //floating filters
            agSetColumnFloatingFilter: {
                defaultImpl: floatingFilter_1.SetFloatingFilterComp,
                overridable: true
            },
            agTextColumnFloatingFilter: {
                defaultImpl: floatingFilter_1.TextFloatingFilterComp,
                overridable: true
            },
            agNumberColumnFloatingFilter: {
                defaultImpl: floatingFilter_1.NumberFloatingFilterComp,
                overridable: true
            },
            agDateColumnFloatingFilter: {
                defaultImpl: floatingFilter_1.DateFloatingFilterComp,
                overridable: true
            },
            agReadModelAsStringFloatingFilter: {
                defaultImpl: floatingFilter_1.ReadModelAsStringFloatingFilterComp,
                overridable: false
            },
            agFloatingFilterWrapper: {
                defaultImpl: floatingFilterWrapper_1.FloatingFilterWrapperComp,
                overridable: false
            },
            agEmptyFloatingFilterWrapper: {
                defaultImpl: floatingFilterWrapper_1.EmptyFloatingFilterWrapperComp,
                overridable: false
            },
            // renderers
            agCellRenderer: {
                defaultImpl: null,
                overridable: false
            },
            agFullWidthCellRenderer: {
                defaultImpl: null,
                overridable: false
            },
            agInnerCellRenderer: {
                defaultImpl: null,
                overridable: false
            },
            agGroupRowInnerCellRenderer: {
                defaultImpl: null,
                overridable: false
            },
            agAnimateShowChangeCellRenderer: {
                defaultImpl: animateShowChangeCellRenderer_1.AnimateShowChangeCellRenderer,
                overridable: true
            },
            agAnimateSlideCellRenderer: {
                defaultImpl: animateSlideCellRenderer_1.AnimateSlideCellRenderer,
                overridable: true
            },
            agGroupCellRenderer: {
                defaultImpl: groupCellRenderer_1.GroupCellRenderer,
                overridable: true
            },
            agGroupRowRenderer: {
                defaultImpl: groupCellRenderer_1.GroupCellRenderer,
                overridable: false
            },
            agLoadingCellRenderer: {
                defaultImpl: rowComp_1.LoadingCellRenderer,
                overridable: true
            },
            agOverlayWrapper: {
                defaultImpl: overlayWrapperComponent_1.OverlayWrapperComponent,
                overridable: false
            },
            agLoadingOverlay: {
                defaultImpl: loadingOverlayComponent_1.LoadingOverlayComponent,
                overridable: true
            },
            agNoRowsOverlay: {
                defaultImpl: noRowsOverlayComponent_1.NoRowsOverlayComponent,
                overridable: true
            },
            agPinnedRowCellRenderer: {
                defaultImpl: null,
                overridable: false
            },
            //editors
            agCellEditor: {
                defaultImpl: textCellEditor_1.TextCellEditor,
                overridable: false
            },
            agTextCellEditor: {
                defaultImpl: textCellEditor_1.TextCellEditor,
                overridable: true
            },
            agText: {
                defaultImpl: textCellEditor_1.TextCellEditor,
                overridable: false
            },
            agSelectCellEditor: {
                defaultImpl: selectCellEditor_1.SelectCellEditor,
                overridable: true
            },
            agSelect: {
                defaultImpl: selectCellEditor_1.SelectCellEditor,
                overridable: false
            },
            agPopupTextCellEditor: {
                defaultImpl: popupTextCellEditor_1.PopupTextCellEditor,
                overridable: true
            },
            agPopupText: {
                defaultImpl: popupTextCellEditor_1.PopupTextCellEditor,
                overridable: false
            },
            agPopupSelectCellEditor: {
                defaultImpl: popupSelectCellEditor_1.PopupSelectCellEditor,
                overridable: true
            },
            agPopupSelect: {
                defaultImpl: popupSelectCellEditor_1.PopupSelectCellEditor,
                overridable: false
            },
            agLargeTextCellEditor: {
                defaultImpl: largeTextCellEditor_1.LargeTextCellEditor,
                overridable: true
            },
            agLargeText: {
                defaultImpl: largeTextCellEditor_1.LargeTextCellEditor,
                overridable: false
            },
            //filter
            agTextColumnFilter: {
                defaultImpl: textFilter_1.TextFilter,
                overridable: false
            },
            agNumberColumnFilter: {
                defaultImpl: numberFilter_1.NumberFilter,
                overridable: false
            },
            agDateColumnFilter: {
                defaultImpl: dateFilter_1.DateFilter,
                overridable: false
            }
        };
    };
    ComponentProvider.prototype.init = function () {
        var _this = this;
        var componentProvider = this.context.getBean('componentProvider');
        if (this.gridOptions.components != null) {
            Object.keys(this.gridOptions.components).forEach(function (it) {
                componentProvider.registerComponent(it, _this.gridOptions.components[it]);
            });
        }
        if (this.gridOptions.frameworkComponents != null) {
            Object.keys(this.gridOptions.frameworkComponents).forEach(function (it) {
                componentProvider.registerFwComponent(it, _this.gridOptions.frameworkComponents[it]);
            });
        }
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
            return this.assertCanBeOverride(name, {
                type: componentResolver_1.ComponentType.FRAMEWORK,
                component: this.frameworkComponents[name],
                source: RegisteredComponentSource.REGISTERED
            });
        }
        if (this.jsComponents[name]) {
            return this.assertCanBeOverride(name, {
                type: componentResolver_1.ComponentType.AG_GRID,
                component: this.jsComponents[name],
                source: RegisteredComponentSource.REGISTERED
            });
        }
        if (this.agGridDefaults[name]) {
            return this.agGridDefaults[name].defaultImpl ?
                {
                    type: componentResolver_1.ComponentType.AG_GRID,
                    component: this.agGridDefaults[name].defaultImpl,
                    source: RegisteredComponentSource.DEFAULT
                } :
                null;
        }
        if (Object.keys(this.agGridDefaults).indexOf(name) < 0) {
            console.warn("ag-grid: Looking for component [" + name + "] but it wasn't found.");
        }
        return null;
    };
    ComponentProvider.prototype.assertCanBeOverride = function (name, toAssert) {
        var overridable = this.agGridDefaults[name] ? this.agGridDefaults[name].overridable : true;
        if (!overridable) {
            throw Error("ag-grid: You are trying to register a component which is not overridable and which name it is used internally in ag-grid: [" + name + "]. Please change the name of the component");
        }
        return toAssert;
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
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], ComponentProvider.prototype, "context", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ComponentProvider.prototype, "postConstruct", null);
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
