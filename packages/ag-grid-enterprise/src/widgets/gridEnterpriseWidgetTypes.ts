import type {
    AgComponentSelectorType,
    AgEventTypeParams,
    AgGridCommon,
    BeanCollection,
    GridOptionsService,
    GridOptionsWithDefaults,
} from 'ag-grid-community';

import type { AgPanel } from '../agStack/agPanel';
import type { AgSlider } from '../agStack/agSlider';
import type { PanelOptions } from './panel';

export type GridSlider = AgSlider<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType
>;

export type GridPanel = AgPanel<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType,
    PanelOptions
>;
