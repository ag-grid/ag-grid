/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v14.1.0
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
var RegisteredComponentSource;
(function (RegisteredComponentSource) {
    RegisteredComponentSource[RegisteredComponentSource["DEFAULT"] = 0] = "DEFAULT";
    RegisteredComponentSource[RegisteredComponentSource["REGISTERED"] = 1] = "REGISTERED";
})(RegisteredComponentSource = exports.RegisteredComponentSource || (exports.RegisteredComponentSource = {}));
var ComponentProvider = (function () {
    function ComponentProvider() {
        this.jsComponents = {};
        this.frameworkComponents = {};
    }
    ComponentProvider.prototype.postConstruct = function () {
        this.agGridDefaults = {
            //THE FOLLOWING COMPONENTS HAVE NO DEFAULTS, THEY NEED TO BE SPECIFIED AS AN SPECIFIC FLAVOUR
            //THERE ARE NO DEFAULTS THAT FIT ALL PURPOSES
            //THEY ARE ADDED HERE TO AVOID THE NOT FOUND WARNING.
            filterComponent: null,
            customFloatingFilterComponent: null,
            //date
            dateComponent: dateFilter_1.DefaultDateComponent,
            //header
            headerComponent: headerComp_1.HeaderComp,
            headerGroupComponent: headerGroupComp_1.HeaderGroupComp,
            //floating filters
            setFloatingFilterComponent: floatingFilter_1.SetFloatingFilterComp,
            textFloatingFilterComponent: floatingFilter_1.TextFloatingFilterComp,
            numberFloatingFilterComponent: floatingFilter_1.NumberFloatingFilterComp,
            dateFloatingFilterComponent: floatingFilter_1.DateFloatingFilterComp,
            readModelAsStringFloatingFilterComponent: floatingFilter_1.ReadModelAsStringFloatingFilterComp,
            floatingFilterWrapperComponent: floatingFilterWrapper_1.FloatingFilterWrapperComp,
            emptyFloatingFilterWrapperComponent: floatingFilterWrapper_1.EmptyFloatingFilterWrapperComp,
            //renderers
            cellRenderer: null,
            fullWidthCellRenderer: null,
            innerRenderer: null,
            groupRowInnerRenderer: null,
            animateShowChange: animateShowChangeCellRenderer_1.AnimateShowChangeCellRenderer,
            animateSlide: animateSlideCellRenderer_1.AnimateSlideCellRenderer,
            group: groupCellRenderer_1.GroupCellRenderer,
            groupRowRenderer: groupCellRenderer_1.GroupCellRenderer,
            loadingCellRenderer: rowComp_1.LoadingCellRenderer,
            pinnedRowCellRenderer: null,
            //editors
            cellEditor: textCellEditor_1.TextCellEditor,
            textCellEditor: textCellEditor_1.TextCellEditor,
            text: textCellEditor_1.TextCellEditor,
            selectCellEditor: selectCellEditor_1.SelectCellEditor,
            select: selectCellEditor_1.SelectCellEditor,
            popupTextCellEditor: popupTextCellEditor_1.PopupTextCellEditor,
            popupText: popupTextCellEditor_1.PopupTextCellEditor,
            popupSelectCellEditor: popupSelectCellEditor_1.PopupSelectCellEditor,
            popupSelect: popupSelectCellEditor_1.PopupSelectCellEditor,
            largeTextCellEditor: largeTextCellEditor_1.LargeTextCellEditor,
            largeText: largeTextCellEditor_1.LargeTextCellEditor,
            //filter
            textColumnFilter: textFilter_1.TextFilter,
            numberColumnFilter: numberFilter_1.NumberFilter,
            dateColumnFilter: dateFilter_1.DateFilter,
        };
    };
    ComponentProvider.prototype.registerComponent = function (name, component) {
        // console.warn(`ag-grid: registering components is a lab feature, is not intended to be used or supported yet.`);
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
    ComponentProvider.prototype.registerFwComponent = function (name, component) {
        // console.warn(`ag-grid: registering components is a lab feature, is not intended to be used or supported yet.`);
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
    ComponentProvider.prototype.retrieve = function (name) {
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
            return {
                type: componentResolver_1.ComponentType.AG_GRID,
                component: this.agGridDefaults[name],
                source: RegisteredComponentSource.DEFAULT
            };
        }
        if (Object.keys(this.agGridDefaults).indexOf(name) < 0) {
            console.warn("ag-grid: Looking for component [" + name + "] but it wasn't found.");
        }
        return null;
    };
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ComponentProvider.prototype, "postConstruct", null);
    ComponentProvider = __decorate([
        context_1.Bean('componentProvider')
    ], ComponentProvider);
    return ComponentProvider;
}());
exports.ComponentProvider = ComponentProvider;
