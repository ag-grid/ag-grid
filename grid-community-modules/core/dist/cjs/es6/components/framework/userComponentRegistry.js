/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
        this.deprecatedAgGridDefaults = {
            agPopupTextCellEditor: 'AG Grid: Since v27.1 The agPopupTextCellEditor is deprecated. Instead use { cellEditor: "agTextCellEditor", cellEditorPopup: true }',
            agPopupSelectCellEditor: 'AG Grid: Since v27.1 the agPopupSelectCellEditor is deprecated. Instead use { cellEditor: "agSelectCellEditor", cellEditorPopup: true }',
        };
        this.jsComps = {};
        this.fwComps = {};
    }
    init() {
        if (this.gridOptions.components != null) {
            object_1.iterateObject(this.gridOptions.components, (key, component) => this.registerJsComponent(key, component));
        }
        if (this.gridOptions.frameworkComponents != null) {
            object_1.iterateObject(this.gridOptions.frameworkComponents, (key, component) => this.registerFwComponent(key, component));
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
        if (this.fwComps[name]) {
            console.error(`Trying to register a component that you have already registered for frameworks: ${name}`);
            return;
        }
        this.jsComps[name] = component;
    }
    /**
     * B the business interface (ie IHeader)
     * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
     */
    registerFwComponent(name, component) {
        const warningMessage = `AG Grid: As of v27, registering components via grid property frameworkComponents is deprecated. Instead register both JavaScript AND Framework Components via the components property.`;
        function_1.doOnce(() => console.warn(warningMessage), `UserComponentRegistry.frameworkComponentsDeprecated`);
        this.fwComps[name] = component;
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
        const frameworkComponent = this.fwComps[name];
        if (frameworkComponent) {
            return createResult(frameworkComponent, true);
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
            moduleRegistry_1.ModuleRegistry.assertRegistered(moduleForComponent, `AG Grid '${propertyName}' component: ${name}`);
        }
        else if (this.deprecatedAgGridDefaults[name]) {
            function_1.doOnce(() => console.warn(this.deprecatedAgGridDefaults[name]), name);
        }
        else {
            function_1.doOnce(() => { this.warnAboutMissingComponent(propertyName, name); }, "MissingComp" + name);
        }
        return null;
    }
    warnAboutMissingComponent(propertyName, componentName) {
        const validComponents = [
            // Don't include the old names / internals in potential suggestions
            ...Object.keys(this.agGridDefaults).filter(k => !['agCellEditor', 'agGroupRowRenderer', 'agSortIndicator'].includes(k)),
            ...Object.keys(this.jsComps),
            ...Object.keys(this.fwComps)
        ];
        const suggestions = fuzzyMatch_1.fuzzySuggestions(componentName, validComponents, true, 0.8);
        console.warn(`AG Grid: Could not find '${componentName}' component. It was configured as "${propertyName}: '${componentName}'" but it wasn't found in the list of registered components.`);
        if (suggestions.length > 0) {
            console.warn(`         Did you mean: [${suggestions.slice(0, 3)}]?`);
        }
        console.warn(`If using a custom component check it has been registered as described in: https://ag-grid.com/javascript-data-grid/components/`);
    }
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
exports.UserComponentRegistry = UserComponentRegistry;
