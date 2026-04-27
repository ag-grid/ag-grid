import type { AgColumn, AgEventTypeParams, BeanCollection, GridOptionsWithDefaults, IRowNode } from 'ag-grid-community';

import type { AgPanelOptions, AgPanelPostProcessPopupParams } from '../agStack/agPanel';

export interface PanelPostProcessPopupParams extends AgPanelPostProcessPopupParams {
    column?: AgColumn | null;
    rowNode?: IRowNode | null;
}

export interface PanelOptions
    extends AgPanelOptions<BeanCollection, GridOptionsWithDefaults, AgEventTypeParams, PanelPostProcessPopupParams> {}
