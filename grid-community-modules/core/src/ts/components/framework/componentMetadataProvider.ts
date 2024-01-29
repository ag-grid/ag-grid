import { Autowired, Bean, PostConstruct } from "../../context/context";
import { IComponent } from "../../interfaces/iComponent";
import { AgComponentUtils } from "./agComponentUtils";
import { BeanStub } from "../../context/beanStub";

export interface ComponentMetadata {
    mandatoryMethodList: string[];
    optionalMethodList: string[];
    functionAdapter?: (callback: any) => { new(): IComponent<any> };
}

@Bean("componentMetadataProvider")
export class ComponentMetadataProvider extends BeanStub {

    private componentMetaData: { [key: string]: ComponentMetadata };

    @Autowired("agComponentUtils")
    private agComponentUtils: AgComponentUtils;

    @PostConstruct
    public postConstruct() {
        this.componentMetaData = {
            dateComponent: {
                mandatoryMethodList: ['getDate', 'setDate'],
                optionalMethodList: ['afterGuiAttached', 'setInputPlaceholder', 'setInputAriaLabel', 'setDisabled', 'onParamsUpdated', 'refresh']
            },
            detailCellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            headerComponent: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh']
            },
            headerGroupComponent: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            loadingCellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            loadingOverlayComponent: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh']
            },
            noRowsOverlayComponent: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh']
            },
            floatingFilterComponent: {
                mandatoryMethodList: ['onParentModelChanged'],
                optionalMethodList: ['afterGuiAttached', 'onParamsUpdated', 'refresh']
            },
            cellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh', 'afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            cellEditor: {
                mandatoryMethodList: ['getValue'],
                optionalMethodList: ['isPopup', 'isCancelBeforeStart', 'isCancelAfterEnd', 'getPopupPosition', 'focusIn', 'focusOut', 'afterGuiAttached', 'refresh']
            },
            innerRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            fullWidthCellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh', 'afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            groupRowRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            filter: {
                mandatoryMethodList: ['isFilterActive', 'doesFilterPass', 'getModel', 'setModel'],
                optionalMethodList: ['afterGuiAttached', 'afterGuiDetached', 'onNewRowsLoaded', 'getModelAsString', 'onFloatingFilterChanged', 'onAnyFilterChanged', 'refresh']
            },
            statusPanel: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh'],
            },
            toolPanel: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh', 'getState']
            },
            tooltipComponent: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            menuItem: {
                mandatoryMethodList: [],
                optionalMethodList: ['setActive', 'select', 'setExpanded', 'configureDefaults']
            },
        };
    }

    public retrieve(name: string): ComponentMetadata {
        return this.componentMetaData[name];
    }
}
