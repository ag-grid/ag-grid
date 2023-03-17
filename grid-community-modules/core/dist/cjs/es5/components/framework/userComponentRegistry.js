/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserComponentRegistry = void 0;
var beanStub_1 = require("../../context/beanStub");
var context_1 = require("../../context/context");
var readOnlyFloatingFilter_1 = require("../../filter/floating/provided/readOnlyFloatingFilter");
var dateFilter_1 = require("../../filter/provided/date/dateFilter");
var dateFloatingFilter_1 = require("../../filter/provided/date/dateFloatingFilter");
var defaultDateComponent_1 = require("../../filter/provided/date/defaultDateComponent");
var numberFilter_1 = require("../../filter/provided/number/numberFilter");
var numberFloatingFilter_1 = require("../../filter/provided/number/numberFloatingFilter");
var textFilter_1 = require("../../filter/provided/text/textFilter");
var textFloatingFilter_1 = require("../../filter/provided/text/textFloatingFilter");
var headerComp_1 = require("../../headerRendering/cells/column/headerComp");
var sortIndicatorComp_1 = require("../../headerRendering/cells/column/sortIndicatorComp");
var headerGroupComp_1 = require("../../headerRendering/cells/columnGroup/headerGroupComp");
var moduleNames_1 = require("../../modules/moduleNames");
var moduleRegistry_1 = require("../../modules/moduleRegistry");
var largeTextCellEditor_1 = require("../../rendering/cellEditors/largeTextCellEditor");
var selectCellEditor_1 = require("../../rendering/cellEditors/selectCellEditor");
var textCellEditor_1 = require("../../rendering/cellEditors/textCellEditor");
var animateShowChangeCellRenderer_1 = require("../../rendering/cellRenderers/animateShowChangeCellRenderer");
var animateSlideCellRenderer_1 = require("../../rendering/cellRenderers/animateSlideCellRenderer");
var groupCellRenderer_1 = require("../../rendering/cellRenderers/groupCellRenderer");
var loadingCellRenderer_1 = require("../../rendering/cellRenderers/loadingCellRenderer");
var loadingOverlayComponent_1 = require("../../rendering/overlays/loadingOverlayComponent");
var noRowsOverlayComponent_1 = require("../../rendering/overlays/noRowsOverlayComponent");
var tooltipComponent_1 = require("../../rendering/tooltipComponent");
var function_1 = require("../../utils/function");
var object_1 = require("../../utils/object");
var fuzzyMatch_1 = require("../../utils/fuzzyMatch");
var UserComponentRegistry = /** @class */ (function (_super) {
    __extends(UserComponentRegistry, _super);
    function UserComponentRegistry() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.agGridDefaults = {
            //date
            agDateInput: defaultDateComponent_1.DefaultDateComponent,
            //header
            agColumnHeader: headerComp_1.HeaderComp,
            agColumnGroupHeader: headerGroupComp_1.HeaderGroupComp,
            agSortIndicator: sortIndicatorComp_1.SortIndicatorComp,
            //floating filters
            agTextColumnFloatingFilter: textFloatingFilter_1.TextFloatingFilter,
            agNumberColumnFloatingFilter: numberFloatingFilter_1.NumberFloatingFilter,
            agDateColumnFloatingFilter: dateFloatingFilter_1.DateFloatingFilter,
            agReadOnlyFloatingFilter: readOnlyFloatingFilter_1.ReadOnlyFloatingFilter,
            // renderers
            agAnimateShowChangeCellRenderer: animateShowChangeCellRenderer_1.AnimateShowChangeCellRenderer,
            agAnimateSlideCellRenderer: animateSlideCellRenderer_1.AnimateSlideCellRenderer,
            agGroupCellRenderer: groupCellRenderer_1.GroupCellRenderer,
            agGroupRowRenderer: groupCellRenderer_1.GroupCellRenderer,
            agLoadingCellRenderer: loadingCellRenderer_1.LoadingCellRenderer,
            //editors
            agCellEditor: textCellEditor_1.TextCellEditor,
            agTextCellEditor: textCellEditor_1.TextCellEditor,
            agSelectCellEditor: selectCellEditor_1.SelectCellEditor,
            agLargeTextCellEditor: largeTextCellEditor_1.LargeTextCellEditor,
            //filter
            agTextColumnFilter: textFilter_1.TextFilter,
            agNumberColumnFilter: numberFilter_1.NumberFilter,
            agDateColumnFilter: dateFilter_1.DateFilter,
            //overlays
            agLoadingOverlay: loadingOverlayComponent_1.LoadingOverlayComponent,
            agNoRowsOverlay: noRowsOverlayComponent_1.NoRowsOverlayComponent,
            // tooltips
            agTooltipComponent: tooltipComponent_1.TooltipComponent
        };
        /** Used to provide useful error messages if a user is trying to use an enterprise component without loading the module. */
        _this.enterpriseAgDefaultCompsModule = {
            agSetColumnFilter: moduleNames_1.ModuleNames.SetFilterModule,
            agSetColumnFloatingFilter: moduleNames_1.ModuleNames.SetFilterModule,
            agMultiColumnFilter: moduleNames_1.ModuleNames.MultiFilterModule,
            agMultiColumnFloatingFilter: moduleNames_1.ModuleNames.MultiFilterModule,
            agGroupColumnFilter: moduleNames_1.ModuleNames.RowGroupingModule,
            agGroupColumnFloatingFilter: moduleNames_1.ModuleNames.RowGroupingModule,
            agRichSelect: moduleNames_1.ModuleNames.RichSelectModule,
            agRichSelectCellEditor: moduleNames_1.ModuleNames.RichSelectModule,
            agDetailCellRenderer: moduleNames_1.ModuleNames.MasterDetailModule,
            agSparklineCellRenderer: moduleNames_1.ModuleNames.SparklinesModule
        };
        _this.deprecatedAgGridDefaults = {
            agPopupTextCellEditor: 'AG Grid: Since v27.1 The agPopupTextCellEditor is deprecated. Instead use { cellEditor: "agTextCellEditor", cellEditorPopup: true }',
            agPopupSelectCellEditor: 'AG Grid: Since v27.1 the agPopupSelectCellEditor is deprecated. Instead use { cellEditor: "agSelectCellEditor", cellEditorPopup: true }',
        };
        _this.jsComps = {};
        _this.fwComps = {};
        return _this;
    }
    UserComponentRegistry.prototype.init = function () {
        var _this = this;
        if (this.gridOptions.components != null) {
            object_1.iterateObject(this.gridOptions.components, function (key, component) { return _this.registerJsComponent(key, component); });
        }
        if (this.gridOptions.frameworkComponents != null) {
            object_1.iterateObject(this.gridOptions.frameworkComponents, function (key, component) { return _this.registerFwComponent(key, component); });
        }
    };
    UserComponentRegistry.prototype.registerDefaultComponent = function (name, component) {
        if (this.agGridDefaults[name]) {
            console.error("Trying to overwrite a default component. You should call registerComponent");
            return;
        }
        this.agGridDefaults[name] = component;
    };
    UserComponentRegistry.prototype.registerJsComponent = function (name, component) {
        if (this.fwComps[name]) {
            console.error("Trying to register a component that you have already registered for frameworks: " + name);
            return;
        }
        this.jsComps[name] = component;
    };
    /**
     * B the business interface (ie IHeader)
     * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
     */
    UserComponentRegistry.prototype.registerFwComponent = function (name, component) {
        var warningMessage = "AG Grid: As of v27, registering components via grid property frameworkComponents is deprecated. Instead register both JavaScript AND Framework Components via the components property.";
        function_1.doOnce(function () { return console.warn(warningMessage); }, "UserComponentRegistry.frameworkComponentsDeprecated");
        this.fwComps[name] = component;
    };
    UserComponentRegistry.prototype.retrieve = function (propertyName, name) {
        var _this = this;
        var createResult = function (component, componentFromFramework) { return ({ componentFromFramework: componentFromFramework, component: component }); };
        // FrameworkOverrides.frameworkComponent() is used in two locations:
        // 1) for Vue, user provided components get registered via a framework specific way.
        // 2) for React, it's how the React UI provides alternative default components (eg GroupCellRenderer and DetailCellRenderer)
        var registeredViaFrameworkComp = this.getFrameworkOverrides().frameworkComponent(name, this.gridOptions.components);
        if (registeredViaFrameworkComp != null) {
            return createResult(registeredViaFrameworkComp, true);
        }
        var frameworkComponent = this.fwComps[name];
        if (frameworkComponent) {
            return createResult(frameworkComponent, true);
        }
        var jsComponent = this.jsComps[name];
        if (jsComponent) {
            var isFwkComp = this.getFrameworkOverrides().isFrameworkComponent(jsComponent);
            return createResult(jsComponent, isFwkComp);
        }
        var defaultComponent = this.agGridDefaults[name];
        if (defaultComponent) {
            return createResult(defaultComponent, false);
        }
        var moduleForComponent = this.enterpriseAgDefaultCompsModule[name];
        if (moduleForComponent) {
            moduleRegistry_1.ModuleRegistry.assertRegistered(moduleForComponent, "AG Grid '" + propertyName + "' component: " + name);
        }
        else if (this.deprecatedAgGridDefaults[name]) {
            function_1.doOnce(function () { return console.warn(_this.deprecatedAgGridDefaults[name]); }, name);
        }
        else {
            function_1.doOnce(function () { _this.warnAboutMissingComponent(propertyName, name); }, "MissingComp" + name);
        }
        return null;
    };
    UserComponentRegistry.prototype.warnAboutMissingComponent = function (propertyName, componentName) {
        var validComponents = __spread(Object.keys(this.agGridDefaults).filter(function (k) { return !['agCellEditor', 'agGroupRowRenderer', 'agSortIndicator'].includes(k); }), Object.keys(this.jsComps), Object.keys(this.fwComps));
        var suggestions = fuzzyMatch_1.fuzzySuggestions(componentName, validComponents, true, 0.8);
        console.warn("AG Grid: Could not find '" + componentName + "' component. It was configured as \"" + propertyName + ": '" + componentName + "'\" but it wasn't found in the list of registered components.");
        if (suggestions.length > 0) {
            console.warn("         Did you mean: [" + suggestions.slice(0, 3) + "]?");
        }
        console.warn("If using a custom component check it has been registered as described in: https://ag-grid.com/javascript-data-grid/components/");
    };
    __decorate([
        context_1.Autowired('gridOptions')
    ], UserComponentRegistry.prototype, "gridOptions", void 0);
    __decorate([
        context_1.PostConstruct
    ], UserComponentRegistry.prototype, "init", null);
    UserComponentRegistry = __decorate([
        context_1.Bean('userComponentRegistry')
    ], UserComponentRegistry);
    return UserComponentRegistry;
}(beanStub_1.BeanStub));
exports.UserComponentRegistry = UserComponentRegistry;
