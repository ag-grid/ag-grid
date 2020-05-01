export interface ComponentType {
    propertyName: string;
    isCellRenderer(): boolean;
}

export const DateComponent: ComponentType = {
    propertyName: 'dateComponent',
    isCellRenderer: () => false
};

export const HeaderComponent: ComponentType = {
    propertyName: 'headerComponent',
    isCellRenderer: () => false,
};

export const HeaderGroupComponent: ComponentType = {
    propertyName: 'headerGroupComponent',
    isCellRenderer: () => false,
};

export const GroupRowInnerRendererComponent: ComponentType = {
    propertyName: 'groupRowInnerRenderer',
    isCellRenderer: () => true,
};

export const CellRendererComponent: ComponentType = {
    propertyName: 'cellRenderer',
    isCellRenderer: () => true,
};

export const PinnedRowCellRendererComponent: ComponentType = {
    propertyName: 'pinnedRowCellRenderer',
    isCellRenderer: () => true,
};

export const CellEditorComponent: ComponentType = {
    propertyName: 'cellEditor',
    isCellRenderer: () => false,
};

export const InnerRendererComponent: ComponentType = {
    propertyName: 'innerRenderer',
    isCellRenderer: () => true,
};

export const LoadingOverlayComponent: ComponentType = {
    propertyName: 'loadingOverlayComponent',
    isCellRenderer: () => false,
};

export const NoRowsOverlayComponent: ComponentType = {
    propertyName: 'noRowsOverlayComponent',
    isCellRenderer: () => false,
};

export const TooltipComponent: ComponentType = {
    propertyName: 'tooltipComponent',
    isCellRenderer: () => false,
};

export const FilterComponent: ComponentType = {
    propertyName: 'filter',
    isCellRenderer: () => false,
};

export const FloatingFilterComponent: ComponentType = {
    propertyName: 'floatingFilterComponent',
    isCellRenderer: () => false,
};

export const ToolPanelComponent: ComponentType = {
    propertyName: 'toolPanel',
    isCellRenderer: () => false,
};

export const StatusPanelComponent: ComponentType = {
    propertyName: 'statusPanel',
    isCellRenderer: () => false,
};
