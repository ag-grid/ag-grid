"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserComponentRegistry = void 0;
const beanStub_1 = require("../../context/beanStub");
const context_1 = require("../../context/context");
const readOnlyFloatingFilter_1 = require("../../filter/floating/provided/readOnlyFloatingFilter");
const dateFilter_1 = require("../../filter/provided/date/dateFilter");
const dateFloatingFilter_1 = require("../../filter/provided/date/dateFloatingFilter");
const defaultDateComponent_1 = require("../../filter/provided/date/defaultDateComponent");
const numberFilter_1 = require("../../filter/provided/number/numberFilter");
const numberFloatingFilter_1 = require("../../filter/provided/number/numberFloatingFilter");
const textFilter_1 = require("../../filter/provided/text/textFilter");
const textFloatingFilter_1 = require("../../filter/provided/text/textFloatingFilter");
const headerComp_1 = require("../../headerRendering/cells/column/headerComp");
const sortIndicatorComp_1 = require("../../headerRendering/cells/column/sortIndicatorComp");
const headerGroupComp_1 = require("../../headerRendering/cells/columnGroup/headerGroupComp");
const moduleNames_1 = require("../../modules/moduleNames");
const moduleRegistry_1 = require("../../modules/moduleRegistry");
const largeTextCellEditor_1 = require("../../rendering/cellEditors/largeTextCellEditor");
const selectCellEditor_1 = require("../../rendering/cellEditors/selectCellEditor");
const textCellEditor_1 = require("../../rendering/cellEditors/textCellEditor");
const animateShowChangeCellRenderer_1 = require("../../rendering/cellRenderers/animateShowChangeCellRenderer");
const animateSlideCellRenderer_1 = require("../../rendering/cellRenderers/animateSlideCellRenderer");
const groupCellRenderer_1 = require("../../rendering/cellRenderers/groupCellRenderer");
const loadingCellRenderer_1 = require("../../rendering/cellRenderers/loadingCellRenderer");
const loadingOverlayComponent_1 = require("../../rendering/overlays/loadingOverlayComponent");
const noRowsOverlayComponent_1 = require("../../rendering/overlays/noRowsOverlayComponent");
const tooltipComponent_1 = require("../../rendering/tooltipComponent");
const function_1 = require("../../utils/function");
const object_1 = require("../../utils/object");
const fuzzyMatch_1 = require("../../utils/fuzzyMatch");
const numberCellEditor_1 = require("../../rendering/cellEditors/numberCellEditor");
const dateCellEditor_1 = require("../../rendering/cellEditors/dateCellEditor");
const dateStringCellEditor_1 = require("../../rendering/cellEditors/dateStringCellEditor");
const checkboxCellRenderer_1 = require("../../rendering/cellRenderers/checkboxCellRenderer");
const checkboxCellEditor_1 = require("../../rendering/cellEditors/checkboxCellEditor");
let UserComponentRegistry = class UserComponentRegistry extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.agGridDefaults = {
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
        this.enterpriseAgDefaultCompsModule = {
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
        this.jsComps = {};
    }
    init() {
        if (this.gridOptions.components != null) {
            (0, object_1.iterateObject)(this.gridOptions.components, (key, component) => this.registerJsComponent(key, component));
        }
    }
    registerDefaultComponent(name, component) {
        if (this.agGridDefaults[name]) {
            console.error(`Trying to overwrite a default component. You should call registerComponent`);
            return;
        }
        this.agGridDefaults[name] = component;
    }
    registerJsComponent(name, component) {
        this.jsComps[name] = component;
    }
    retrieve(propertyName, name) {
        const createResult = (component, componentFromFramework) => ({ componentFromFramework, component });
        // FrameworkOverrides.frameworkComponent() is used in two locations:
        // 1) for Vue, user provided components get registered via a framework specific way.
        // 2) for React, it's how the React UI provides alternative default components (eg GroupCellRenderer and DetailCellRenderer)
        const registeredViaFrameworkComp = this.getFrameworkOverrides().frameworkComponent(name, this.gridOptions.components);
        if (registeredViaFrameworkComp != null) {
            return createResult(registeredViaFrameworkComp, true);
        }
        const jsComponent = this.jsComps[name];
        if (jsComponent) {
            const isFwkComp = this.getFrameworkOverrides().isFrameworkComponent(jsComponent);
            return createResult(jsComponent, isFwkComp);
        }
        const defaultComponent = this.agGridDefaults[name];
        if (defaultComponent) {
            return createResult(defaultComponent, false);
        }
        const moduleForComponent = this.enterpriseAgDefaultCompsModule[name];
        if (moduleForComponent) {
            moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleForComponent, `AG Grid '${propertyName}' component: ${name}`, this.context.getGridId());
        }
        else {
            (0, function_1.doOnce)(() => { this.warnAboutMissingComponent(propertyName, name); }, "MissingComp" + name);
        }
        return null;
    }
    warnAboutMissingComponent(propertyName, componentName) {
        const validComponents = [
            // Don't include the old names / internals in potential suggestions
            ...Object.keys(this.agGridDefaults).filter(k => !['agCellEditor', 'agGroupRowRenderer', 'agSortIndicator'].includes(k)),
            ...Object.keys(this.jsComps)
        ];
        const suggestions = (0, fuzzyMatch_1.fuzzySuggestions)(componentName, validComponents, true, 0.8).values;
        console.warn(`AG Grid: Could not find '${componentName}' component. It was configured as "${propertyName}: '${componentName}'" but it wasn't found in the list of registered components.`);
        if (suggestions.length > 0) {
            console.warn(`         Did you mean: [${suggestions.slice(0, 3)}]?`);
        }
        console.warn(`If using a custom component check it has been registered as described in: ${this.getFrameworkOverrides().getDocLink('components/')}`);
    }
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
exports.UserComponentRegistry = UserComponentRegistry;
