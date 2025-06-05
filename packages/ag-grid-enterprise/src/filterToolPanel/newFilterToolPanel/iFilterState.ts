import type { AgColumn } from 'ag-grid-community';

interface FilterPanelBaseState {
    column: AgColumn;
    name: string;
}

export interface FilterPanelSummaryState extends FilterPanelBaseState {
    expanded: false;
    summary: string;
}

export interface FilterPanelDetailState extends FilterPanelBaseState {
    expanded: true;
    type: string;
    options: { value: string; text: string }[];
    detail: HTMLElement;
}

export type FilterPanelFilterState = FilterPanelSummaryState | FilterPanelDetailState;
