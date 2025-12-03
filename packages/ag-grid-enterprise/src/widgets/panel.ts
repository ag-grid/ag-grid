import type {
    AgColumn,
    AgEventTypeParams,
    GridOptionsWithDefaults,
    IRowNode,
    _BeanCollection,
} from 'ag-grid-community';

import type { AgPanelOptions, AgPanelPostProcessPopupParams } from '../agStack/agPanel';

export interface PanelPostProcessPopupParams extends AgPanelPostProcessPopupParams {
    column?: AgColumn | null;
    rowNode?: IRowNode | null;
}

export interface PanelOptions
    extends AgPanelOptions<_BeanCollection, GridOptionsWithDefaults, AgEventTypeParams, PanelPostProcessPopupParams> {}
