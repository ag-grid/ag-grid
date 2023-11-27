var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../../context/beanStub.mjs";
import { Autowired, Bean, PostConstruct } from "../../context/context.mjs";
import { ReadOnlyFloatingFilter } from "../../filter/floating/provided/readOnlyFloatingFilter.mjs";
import { DateFilter } from "../../filter/provided/date/dateFilter.mjs";
import { DateFloatingFilter } from "../../filter/provided/date/dateFloatingFilter.mjs";
import { DefaultDateComponent } from "../../filter/provided/date/defaultDateComponent.mjs";
import { NumberFilter } from "../../filter/provided/number/numberFilter.mjs";
import { NumberFloatingFilter } from "../../filter/provided/number/numberFloatingFilter.mjs";
import { TextFilter } from "../../filter/provided/text/textFilter.mjs";
import { TextFloatingFilter } from "../../filter/provided/text/textFloatingFilter.mjs";
import { HeaderComp } from "../../headerRendering/cells/column/headerComp.mjs";
import { SortIndicatorComp } from "../../headerRendering/cells/column/sortIndicatorComp.mjs";
import { HeaderGroupComp } from "../../headerRendering/cells/columnGroup/headerGroupComp.mjs";
import { ModuleNames } from "../../modules/moduleNames.mjs";
import { ModuleRegistry } from "../../modules/moduleRegistry.mjs";
import { LargeTextCellEditor } from "../../rendering/cellEditors/largeTextCellEditor.mjs";
import { SelectCellEditor } from "../../rendering/cellEditors/selectCellEditor.mjs";
import { TextCellEditor } from "../../rendering/cellEditors/textCellEditor.mjs";
import { AnimateShowChangeCellRenderer } from "../../rendering/cellRenderers/animateShowChangeCellRenderer.mjs";
import { AnimateSlideCellRenderer } from "../../rendering/cellRenderers/animateSlideCellRenderer.mjs";
import { GroupCellRenderer } from "../../rendering/cellRenderers/groupCellRenderer.mjs";
import { LoadingCellRenderer } from "../../rendering/cellRenderers/loadingCellRenderer.mjs";
import { LoadingOverlayComponent } from "../../rendering/overlays/loadingOverlayComponent.mjs";
import { NoRowsOverlayComponent } from "../../rendering/overlays/noRowsOverlayComponent.mjs";
import { TooltipComponent } from "../../rendering/tooltipComponent.mjs";
import { doOnce } from "../../utils/function.mjs";
import { iterateObject } from '../../utils/object.mjs';
import { fuzzySuggestions } from '../../utils/fuzzyMatch.mjs';
import { NumberCellEditor } from "../../rendering/cellEditors/numberCellEditor.mjs";
import { DateCellEditor } from "../../rendering/cellEditors/dateCellEditor.mjs";
import { DateStringCellEditor } from "../../rendering/cellEditors/dateStringCellEditor.mjs";
import { CheckboxCellRenderer } from "../../rendering/cellRenderers/checkboxCellRenderer.mjs";
import { CheckboxCellEditor } from "../../rendering/cellEditors/checkboxCellEditor.mjs";
let UserComponentRegistry = class UserComponentRegistry extends BeanStub {
    constructor() {
        super(...arguments);
        this.agGridDefaults = {
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
        this.enterpriseAgDefaultCompsModule = {
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
        this.jsComps = {};
    }
    init() {
        if (this.gridOptions.components != null) {
            iterateObject(this.gridOptions.components, (key, component) => this.registerJsComponent(key, component));
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
            ModuleRegistry.__assertRegistered(moduleForComponent, `AG Grid '${propertyName}' component: ${name}`, this.context.getGridId());
        }
        else {
            doOnce(() => { this.warnAboutMissingComponent(propertyName, name); }, "MissingComp" + name);
        }
        return null;
    }
    warnAboutMissingComponent(propertyName, componentName) {
        const validComponents = [
            // Don't include the old names / internals in potential suggestions
            ...Object.keys(this.agGridDefaults).filter(k => !['agCellEditor', 'agGroupRowRenderer', 'agSortIndicator'].includes(k)),
            ...Object.keys(this.jsComps)
        ];
        const suggestions = fuzzySuggestions(componentName, validComponents, true, 0.8).values;
        console.warn(`AG Grid: Could not find '${componentName}' component. It was configured as "${propertyName}: '${componentName}'" but it wasn't found in the list of registered components.`);
        if (suggestions.length > 0) {
            console.warn(`         Did you mean: [${suggestions.slice(0, 3)}]?`);
        }
        console.warn(`If using a custom component check it has been registered as described in: ${this.getFrameworkOverrides().getDocLink('components/')}`);
    }
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
export { UserComponentRegistry };
