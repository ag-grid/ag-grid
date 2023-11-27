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
import { BeanStub } from "../../context/beanStub";
import { Autowired, Bean, PostConstruct } from "../../context/context";
import { ReadOnlyFloatingFilter } from "../../filter/floating/provided/readOnlyFloatingFilter";
import { DateFilter } from "../../filter/provided/date/dateFilter";
import { DateFloatingFilter } from "../../filter/provided/date/dateFloatingFilter";
import { DefaultDateComponent } from "../../filter/provided/date/defaultDateComponent";
import { NumberFilter } from "../../filter/provided/number/numberFilter";
import { NumberFloatingFilter } from "../../filter/provided/number/numberFloatingFilter";
import { TextFilter } from "../../filter/provided/text/textFilter";
import { TextFloatingFilter } from "../../filter/provided/text/textFloatingFilter";
import { HeaderComp } from "../../headerRendering/cells/column/headerComp";
import { SortIndicatorComp } from "../../headerRendering/cells/column/sortIndicatorComp";
import { HeaderGroupComp } from "../../headerRendering/cells/columnGroup/headerGroupComp";
import { ModuleNames } from "../../modules/moduleNames";
import { ModuleRegistry } from "../../modules/moduleRegistry";
import { LargeTextCellEditor } from "../../rendering/cellEditors/largeTextCellEditor";
import { SelectCellEditor } from "../../rendering/cellEditors/selectCellEditor";
import { TextCellEditor } from "../../rendering/cellEditors/textCellEditor";
import { AnimateShowChangeCellRenderer } from "../../rendering/cellRenderers/animateShowChangeCellRenderer";
import { AnimateSlideCellRenderer } from "../../rendering/cellRenderers/animateSlideCellRenderer";
import { GroupCellRenderer } from "../../rendering/cellRenderers/groupCellRenderer";
import { LoadingCellRenderer } from "../../rendering/cellRenderers/loadingCellRenderer";
import { LoadingOverlayComponent } from "../../rendering/overlays/loadingOverlayComponent";
import { NoRowsOverlayComponent } from "../../rendering/overlays/noRowsOverlayComponent";
import { TooltipComponent } from "../../rendering/tooltipComponent";
import { doOnce } from "../../utils/function";
import { iterateObject } from '../../utils/object';
import { fuzzySuggestions } from '../../utils/fuzzyMatch';
import { NumberCellEditor } from "../../rendering/cellEditors/numberCellEditor";
import { DateCellEditor } from "../../rendering/cellEditors/dateCellEditor";
import { DateStringCellEditor } from "../../rendering/cellEditors/dateStringCellEditor";
import { CheckboxCellRenderer } from "../../rendering/cellRenderers/checkboxCellRenderer";
import { CheckboxCellEditor } from "../../rendering/cellEditors/checkboxCellEditor";
var UserComponentRegistry = /** @class */ (function (_super) {
    __extends(UserComponentRegistry, _super);
    function UserComponentRegistry() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.agGridDefaults = {
            //date
            agDateInput: DefaultDateComponent,
            //header
            agColumnHeader: HeaderComp,
            agColumnGroupHeader: HeaderGroupComp,
            agSortIndicator: SortIndicatorComp,
            //floating filters
            agTextColumnFloatingFilter: TextFloatingFilter,
            agNumberColumnFloatingFilter: NumberFloatingFilter,
            agDateColumnFloatingFilter: DateFloatingFilter,
            agReadOnlyFloatingFilter: ReadOnlyFloatingFilter,
            // renderers
            agAnimateShowChangeCellRenderer: AnimateShowChangeCellRenderer,
            agAnimateSlideCellRenderer: AnimateSlideCellRenderer,
            agGroupCellRenderer: GroupCellRenderer,
            agGroupRowRenderer: GroupCellRenderer,
            agLoadingCellRenderer: LoadingCellRenderer,
            agCheckboxCellRenderer: CheckboxCellRenderer,
            //editors
            agCellEditor: TextCellEditor,
            agTextCellEditor: TextCellEditor,
            agNumberCellEditor: NumberCellEditor,
            agDateCellEditor: DateCellEditor,
            agDateStringCellEditor: DateStringCellEditor,
            agSelectCellEditor: SelectCellEditor,
            agLargeTextCellEditor: LargeTextCellEditor,
            agCheckboxCellEditor: CheckboxCellEditor,
            //filter
            agTextColumnFilter: TextFilter,
            agNumberColumnFilter: NumberFilter,
            agDateColumnFilter: DateFilter,
            //overlays
            agLoadingOverlay: LoadingOverlayComponent,
            agNoRowsOverlay: NoRowsOverlayComponent,
            // tooltips
            agTooltipComponent: TooltipComponent
        };
        /** Used to provide useful error messages if a user is trying to use an enterprise component without loading the module. */
        _this.enterpriseAgDefaultCompsModule = {
            agSetColumnFilter: ModuleNames.SetFilterModule,
            agSetColumnFloatingFilter: ModuleNames.SetFilterModule,
            agMultiColumnFilter: ModuleNames.MultiFilterModule,
            agMultiColumnFloatingFilter: ModuleNames.MultiFilterModule,
            agGroupColumnFilter: ModuleNames.RowGroupingModule,
            agGroupColumnFloatingFilter: ModuleNames.RowGroupingModule,
            agRichSelect: ModuleNames.RichSelectModule,
            agRichSelectCellEditor: ModuleNames.RichSelectModule,
            agDetailCellRenderer: ModuleNames.MasterDetailModule,
            agSparklineCellRenderer: ModuleNames.SparklinesModule
        };
        _this.jsComps = {};
        return _this;
    }
    UserComponentRegistry.prototype.init = function () {
        var _this = this;
        if (this.gridOptions.components != null) {
            iterateObject(this.gridOptions.components, function (key, component) { return _this.registerJsComponent(key, component); });
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
            ModuleRegistry.__assertRegistered(moduleForComponent, "AG Grid '".concat(propertyName, "' component: ").concat(name), this.context.getGridId());
        }
        else {
            doOnce(function () { _this.warnAboutMissingComponent(propertyName, name); }, "MissingComp" + name);
        }
        return null;
    };
    UserComponentRegistry.prototype.warnAboutMissingComponent = function (propertyName, componentName) {
        var validComponents = __spreadArray(__spreadArray([], __read(Object.keys(this.agGridDefaults).filter(function (k) { return !['agCellEditor', 'agGroupRowRenderer', 'agSortIndicator'].includes(k); })), false), __read(Object.keys(this.jsComps)), false);
        var suggestions = fuzzySuggestions(componentName, validComponents, true, 0.8).values;
        console.warn("AG Grid: Could not find '".concat(componentName, "' component. It was configured as \"").concat(propertyName, ": '").concat(componentName, "'\" but it wasn't found in the list of registered components."));
        if (suggestions.length > 0) {
            console.warn("         Did you mean: [".concat(suggestions.slice(0, 3), "]?"));
        }
        console.warn("If using a custom component check it has been registered as described in: ".concat(this.getFrameworkOverrides().getDocLink('components/')));
    };
    __decorate([
        Autowired('gridOptions')
    ], UserComponentRegistry.prototype, "gridOptions", void 0);
    __decorate([
        PostConstruct
    ], UserComponentRegistry.prototype, "init", null);
    UserComponentRegistry = __decorate([
        Bean('userComponentRegistry')
    ], UserComponentRegistry);
    return UserComponentRegistry;
}(BeanStub));
export { UserComponentRegistry };
