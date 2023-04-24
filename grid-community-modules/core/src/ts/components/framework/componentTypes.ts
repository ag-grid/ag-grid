export interface ComponentType {
    propertyName: string;
    cellRenderer: boolean;
}

export const DateComponent: ComponentType = {
    propertyName: 'dateComponent',
    cellRenderer: false
};

export const HeaderComponent: ComponentType = {
    propertyName: 'headerComponent',
    cellRenderer: false
};

export const HeaderGroupComponent: ComponentType = {
    propertyName: 'headerGroupComponent',
    cellRenderer: false
};

export const CellRendererComponent: ComponentType = {
    propertyName: 'cellRenderer',
    cellRenderer: true
};

export const CellEditorComponent: ComponentType = {
    propertyName: 'cellEditor',
    cellRenderer: false
};

export const InnerRendererComponent: ComponentType = {
    propertyName: 'innerRenderer',
    cellRenderer: true
};

export const LoadingOverlayComponent: ComponentType = {
    propertyName: 'loadingOverlayComponent',
    cellRenderer: false
};

export const NoRowsOverlayComponent: ComponentType = {
    propertyName: 'noRowsOverlayComponent',
    cellRenderer: false
};

export const TooltipComponent: ComponentType = {
    propertyName: 'tooltipComponent',
    cellRenderer: false
};

export const FilterComponent: ComponentType = {
    propertyName: 'filter',
    cellRenderer: false
};

export const FloatingFilterComponent: ComponentType = {
    propertyName: 'floatingFilterComponent',
    cellRenderer: false
};

export const ToolPanelComponent: ComponentType = {
    propertyName: 'toolPanel',
    cellRenderer: false
};

export const StatusPanelComponent: ComponentType = {
    propertyName: 'statusPanel',
    cellRenderer: false
};

export const FullWidth: ComponentType = {
    propertyName: 'fullWidthCellRenderer',
    cellRenderer: true
};

export const FullWidthLoading: ComponentType = {
    propertyName: 'loadingCellRenderer',
    cellRenderer: true
};

export const FullWidthGroup: ComponentType = {
    propertyName: 'groupRowRenderer',
    cellRenderer: true
};

export const FullWidthDetail: ComponentType = {
    propertyName: 'detailCellRenderer',
    cellRenderer: true
};
