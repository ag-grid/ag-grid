import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { IComponent } from '../../interfaces/iComponent';
import type { AgComponentUtils } from './agComponentUtils';

export interface ComponentMetadata {
    mandatoryMethodList: string[];
    optionalMethodList: string[];
    functionAdapter?: (callback: any) => { new (): IComponent<any> };
}

export class ComponentMetadataProvider extends BeanStub implements NamedBean {
    beanName = 'componentMetadataProvider' as const;

    private componentMetaData: { [key: string]: ComponentMetadata };

    private agComponentUtils: AgComponentUtils;

    public wireBeans(beans: BeanCollection): void {
        this.agComponentUtils = beans.agComponentUtils;
    }

    public postConstruct() {
        this.componentMetaData = {
            dateComponent: {
                mandatoryMethodList: ['getDate', 'setDate'],
                optionalMethodList: [
                    'afterGuiAttached',
                    'setInputPlaceholder',
                    'setInputAriaLabel',
                    'setDisabled',
                    'onParamsUpdated',
                    'refresh',
                ],
            },
            detailCellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils),
            },
            dragAndDropCoverComponent: {
                mandatoryMethodList: ['setIcon', 'setLabel'],
                optionalMethodList: [],
            },
            headerComponent: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh'],
            },
            headerGroupComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
            },
            loadingCellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils),
            },
            loadingOverlayComponent: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh'],
            },
            noRowsOverlayComponent: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh'],
            },
            floatingFilterComponent: {
                mandatoryMethodList: ['onParentModelChanged'],
                optionalMethodList: ['afterGuiAttached', 'onParamsUpdated', 'refresh'],
            },
            cellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh', 'afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils),
            },
            cellEditor: {
                mandatoryMethodList: ['getValue'],
                optionalMethodList: [
                    'isPopup',
                    'isCancelBeforeStart',
                    'isCancelAfterEnd',
                    'getPopupPosition',
                    'focusIn',
                    'focusOut',
                    'afterGuiAttached',
                    'refresh',
                ],
            },
            innerRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils),
            },
            fullWidthCellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh', 'afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils),
            },
            groupRowRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils),
            },
            filter: {
                mandatoryMethodList: ['isFilterActive', 'doesFilterPass', 'getModel', 'setModel'],
                optionalMethodList: [
                    'afterGuiAttached',
                    'afterGuiDetached',
                    'onNewRowsLoaded',
                    'getModelAsString',
                    'onFloatingFilterChanged',
                    'onAnyFilterChanged',
                    'refresh',
                ],
            },
            statusPanel: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh'],
            },
            toolPanel: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh', 'getState'],
            },
            tooltipComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
            },
            menuItem: {
                mandatoryMethodList: [],
                optionalMethodList: ['setActive', 'select', 'setExpanded', 'configureDefaults'],
            },
        };
    }

    public retrieve(name: string): ComponentMetadata {
        return this.componentMetaData[name];
    }
}
