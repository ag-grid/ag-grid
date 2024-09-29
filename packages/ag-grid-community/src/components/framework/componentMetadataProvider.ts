import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';

export interface ComponentMetadata {
    mandatoryMethodList: string[];
    optionalMethodList: string[];
    adaptFunction?: boolean;
}

export class ComponentMetadataProvider extends BeanStub implements NamedBean {
    beanName = 'componentMetadataProvider' as const;

    private componentMetaData: { [key: string]: ComponentMetadata };

    public postConstruct() {
        this.componentMetaData = {
            dateComponent: {
                mandatoryMethodList: ['getDate', 'setDate'],
                optionalMethodList: [
                    'afterGuiAttached',
                    'setInputPlaceholder',
                    'setInputAriaLabel',
                    'setDisabled',
                    'refresh',
                ],
            },
            detailCellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh'],
                adaptFunction: true,
            },
            dragAndDropImageComponent: {
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
                adaptFunction: true,
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
                optionalMethodList: ['afterGuiAttached', 'refresh'],
            },
            cellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh', 'afterGuiAttached'],
                adaptFunction: true,
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
                adaptFunction: true,
            },
            fullWidthCellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['refresh', 'afterGuiAttached'],
                adaptFunction: true,
            },
            groupRowRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: ['afterGuiAttached'],
                adaptFunction: true,
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
