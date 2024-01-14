"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
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
var numberCellEditor_1 = require("../../rendering/cellEditors/numberCellEditor");
var dateCellEditor_1 = require("../../rendering/cellEditors/dateCellEditor");
var dateStringCellEditor_1 = require("../../rendering/cellEditors/dateStringCellEditor");
var checkboxCellRenderer_1 = require("../../rendering/cellRenderers/checkboxCellRenderer");
var checkboxCellEditor_1 = require("../../rendering/cellEditors/checkboxCellEditor");
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
            agCheckboxCellRenderer: checkboxCellRenderer_1.CheckboxCellRenderer,
            //editors
            agCellEditor: textCellEditor_1.TextCellEditor,
            agTextCellEditor: textCellEditor_1.TextCellEditor,
            agNumberCellEditor: numberCellEditor_1.NumberCellEditor,
            agDateCellEditor: dateCellEditor_1.DateCellEditor,
            agDateStringCellEditor: dateStringCellEditor_1.DateStringCellEditor,
            agSelectCellEditor: selectCellEditor_1.SelectCellEditor,
            agLargeTextCellEditor: largeTextCellEditor_1.LargeTextCellEditor,
            agCheckboxCellEditor: checkboxCellEditor_1.CheckboxCellEditor,
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
        _this.jsComps = {};
        return _this;
    }
    UserComponentRegistry.prototype.init = function () {
        var _this = this;
        if (this.gridOptions.components != null) {
            (0, object_1.iterateObject)(this.gridOptions.components, function (key, component) { return _this.registerJsComponent(key, component); });
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
        this.jsComps[name] = component;
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
            moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleForComponent, "AG Grid '".concat(propertyName, "' component: ").concat(name), this.context.getGridId());
        }
        else {
            (0, function_1.doOnce)(function () { _this.warnAboutMissingComponent(propertyName, name); }, "MissingComp" + name);
        }
        return null;
    };
    UserComponentRegistry.prototype.warnAboutMissingComponent = function (propertyName, componentName) {
        var validComponents = __spreadArray(__spreadArray([], __read(Object.keys(this.agGridDefaults).filter(function (k) { return !['agCellEditor', 'agGroupRowRenderer', 'agSortIndicator'].includes(k); })), false), __read(Object.keys(this.jsComps)), false);
        var suggestions = (0, fuzzyMatch_1.fuzzySuggestions)(componentName, validComponents, true, 0.8).values;
        console.warn("AG Grid: Could not find '".concat(componentName, "' component. It was configured as \"").concat(propertyName, ": '").concat(componentName, "'\" but it wasn't found in the list of registered components."));
        if (suggestions.length > 0) {
            console.warn("         Did you mean: [".concat(suggestions.slice(0, 3), "]?"));
        }
        console.warn("If using a custom component check it has been registered as described in: ".concat(this.getFrameworkOverrides().getDocLink('components/')));
    };
    __decorate([
        (0, context_1.Autowired)('gridOptions')
    ], UserComponentRegistry.prototype, "gridOptions", void 0);
    __decorate([
        context_1.PostConstruct
    ], UserComponentRegistry.prototype, "init", null);
    UserComponentRegistry = __decorate([
        (0, context_1.Bean)('userComponentRegistry')
    ], UserComponentRegistry);
    return UserComponentRegistry;
}(beanStub_1.BeanStub));
exports.UserComponentRegistry = UserComponentRegistry;
