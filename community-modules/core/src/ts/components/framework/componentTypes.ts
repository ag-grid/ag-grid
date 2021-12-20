export interface ComponentType {
    propertyName: string;
    cellRenderer: boolean;
    newPropName: string;
}

export const DateComponent: ComponentType = {
    propertyName: 'dateComponent',
    cellRenderer: false,
    newPropName: 'dateComp'
};

export const HeaderComponent: ComponentType = {
    propertyName: 'headerComponent',
    cellRenderer: false,
    newPropName: 'headerComp'
};

export const HeaderGroupComponent: ComponentType = {
    propertyName: 'headerGroupComponent',
    cellRenderer: false,
    newPropName: 'headerGroupComp'
};

export const CellRendererComponent: ComponentType = {
    propertyName: 'cellRenderer',
    cellRenderer: true,
    newPropName: 'cellComp'
};

export const CellEditorComponent: ComponentType = {
    propertyName: 'cellEditor',
    cellRenderer: false,
    newPropName: 'editorComp'
};

export const InnerRendererComponent: ComponentType = {
    propertyName: 'innerRenderer',
    cellRenderer: true,
    newPropName: 'innerCellComp'
};

export const LoadingOverlayComponent: ComponentType = {
    propertyName: 'loadingOverlayComponent',
    cellRenderer: false,
    newPropName: 'loadingOverlayComp'
};

export const NoRowsOverlayComponent: ComponentType = {
    propertyName: 'noRowsOverlayComponent',
    cellRenderer: false,
    newPropName: 'noRowsOverlayComp'
};

export const TooltipComponent: ComponentType = {
    propertyName: 'tooltipComponent',
    cellRenderer: false,
    newPropName: 'tooltipComp'
};

export const FilterComponent: ComponentType = {
    propertyName: 'filter',
    cellRenderer: false,
    newPropName: 'filterComp'
};

export const FloatingFilterComponent: ComponentType = {
    propertyName: 'floatingFilterComponent',
    cellRenderer: false,
    newPropName: 'floatingFilterComp'
};

export const ToolPanelComponent: ComponentType = {
    propertyName: 'toolPanel',
    cellRenderer: false,
    newPropName: 'toolPanelComp'
};

export const StatusPanelComponent: ComponentType = {
    propertyName: 'statusPanel',
    cellRenderer: false,
    newPropName: 'statusPanelComp'
};

export const FullWidth: ComponentType = {
    propertyName: 'fullWidthCellRenderer',
    cellRenderer: true,
    newPropName: 'fullWidthComp'
};

export const FullWidthLoading: ComponentType = {
    propertyName: 'loadingCellRenderer',
    cellRenderer: true,
    newPropName: 'loadingRowComp'
};

export const FullWidthGroup: ComponentType = {
    propertyName: 'groupRowRenderer',
    cellRenderer: true,
    newPropName: 'groupRowComp'
};

export const FullWidthDetail: ComponentType = {
    propertyName: 'detailCellRenderer',
    cellRenderer: true,
    newPropName: 'detailRowComp'
};


