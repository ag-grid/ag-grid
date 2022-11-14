import { BeanStub } from "../../context/beanStub";
import { Autowired, Bean, PostConstruct } from "../../context/context";
import { GridOptions } from "../../entities/gridOptions";
import { ReadOnlyFloatingFilter } from "../../filter/floating/provided/readOnlyFloatingFilter";
import { DateFilter } from "../../filter/provided/date/dateFilter";
import { DateFloatingFilter } from "../../filter/provided/date/dateFloatingFilter";
import { DefaultDateComponent } from "../../filter/provided/date/defaultDateComponent";
import { NumberFilter } from "../../filter/provided/number/numberFilter";
import { NumberFloatingFilter } from "../../filter/provided/number/numberFloatingFilter";
import { TextFilter } from "../../filter/provided/text/textFilter";
import { TextFloatingFilter } from "../../filter/provided/text/textFloatingFilter";
import { HeaderComp } from "../../headerRendering/cells/column/headerComp";
import { HeaderGroupComp } from "../../headerRendering/cells/columnGroup/headerGroupComp";
import { SortIndicatorComp } from "../../headerRendering/cells/column/sortIndicatorComp";
import { IComponent } from "../../interfaces/iComponent";
import { LargeTextCellEditor } from "../../rendering/cellEditors/largeTextCellEditor";
import { PopupSelectCellEditor } from "../../rendering/cellEditors/popupSelectCellEditor";
import { PopupTextCellEditor } from "../../rendering/cellEditors/popupTextCellEditor";
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
import { AgComponentUtils } from "./agComponentUtils";

/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
export interface RegisteredComponent {
    component: any;
    componentFromFramework: boolean;
}

export interface DeprecatedComponentName {
    propertyHolder: string;
    newComponentName: string;
}

@Bean('userComponentRegistry')
export class UserComponentRegistry extends BeanStub {

    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('agComponentUtils') private readonly agComponentUtils: AgComponentUtils;

    private agGridDefaults: { [key: string]: any } = {
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

        //editors
        agCellEditor: TextCellEditor,
        agTextCellEditor: TextCellEditor,
        agSelectCellEditor: SelectCellEditor,
        agPopupTextCellEditor: PopupTextCellEditor,
        agPopupSelectCellEditor: PopupSelectCellEditor,
        agLargeTextCellEditor: LargeTextCellEditor,

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

    private agDeprecatedNames: { [key: string]: DeprecatedComponentName; } = {
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

    private jsComps: { [key: string]: any } = {};
    private fwComps: { [key: string]: any } = {};

    @PostConstruct
    private init(): void {
        if (this.gridOptions.components != null) {
            iterateObject(this.gridOptions.components, (key, component) => this.registerJsComponent(key, component));
        }

        if (this.gridOptions.frameworkComponents != null) {
            iterateObject(this.gridOptions.frameworkComponents,
                (key, component) => this.registerFwComponent(key, component as any));
        }
    }

    public registerDefaultComponent(rawName: string, component: any) {
        const name = this.translateIfDeprecated(rawName);

        if (this.agGridDefaults[name]) {
            console.error(`Trying to overwrite a default component. You should call registerComponent`);
            return;
        }

        this.agGridDefaults[name] = component;
    }

    private registerJsComponent(rawName: string, component: any) {
        const name = this.translateIfDeprecated(rawName);

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
    private registerFwComponent<A extends IComponent<any> & B, B>(rawName: string, component: { new(): IComponent<B>; }) {
        const warningMessage = `AG Grid: As of v27, registering components via grid property frameworkComponents is deprecated. Instead register both JavaScript AND Framework Components via the components property.`;
        doOnce( ()=> console.warn(warningMessage), `UserComponentRegistry.frameworkComponentsDeprecated`);

        const name = this.translateIfDeprecated(rawName);
        this.fwComps[name] = component;
    }

    public retrieve(rawName: string): {componentFromFramework: boolean, component: any} | null {
        const name = this.translateIfDeprecated(rawName);

        const createResult = (component: any, componentFromFramework: boolean) => ({componentFromFramework, component});

        // FrameworkOverrides.frameworkComponent() is used in two locations:
        // 1) for Vue, user provided components get registered via a framework specific way.
        // 2) for React, it's how the React UI provides alternative default components (eg GroupCellRenderer and DetailCellRenderer)
        const registeredViaFrameworkComp = this.getFrameworkOverrides().frameworkComponent(name, this.gridOptions.components);
        if (registeredViaFrameworkComp!=null) {
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

        if (Object.keys(this.agGridDefaults).indexOf(name) < 0) {
            console.warn(`AG Grid: Looking for component [${name}] but it wasn't found.`);
        }

        return null;
    }

    private translateIfDeprecated(raw: string): string {
        const deprecatedInfo = this.agDeprecatedNames[raw];

        if (deprecatedInfo != null) {
            doOnce(() => {
                console.warn(`AG Grid: Since v15.0 component names have been renamed to be namespaced. You should rename ${deprecatedInfo.propertyHolder}:${raw} to ${deprecatedInfo.propertyHolder}:${deprecatedInfo.newComponentName}`);
            }, 'DEPRECATE_COMPONENT_' + raw);

            return deprecatedInfo.newComponentName;
        }

        return raw;
    }
}
