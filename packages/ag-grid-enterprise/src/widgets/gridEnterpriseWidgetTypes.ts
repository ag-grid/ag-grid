import type {
    AgComponentSelectorType,
    AgEventTypeParams,
    AgGridCommon,
    BeanCollection,
    ContainerType,
    GridOptionsService,
    GridOptionsWithDefaults,
} from 'ag-grid-community';

import type { AgGroupComponent, AgGroupComponentParams } from '../agStack/agGroupComponent';
import type { AgPanel } from '../agStack/agPanel';
import type { AgSlider } from '../agStack/agSlider';
import type { AgTabbedLayout } from '../agStack/agTabbedLayout';
import type { AgTabbedItem } from '../agStack/iTabbedLayout';
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

export type TabbedLayout = AgTabbedLayout<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType,
    ContainerType
>;

export type TabbedItem = AgTabbedItem<ContainerType>;

export type GroupComponent = AgGroupComponent<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType
>;

export type GroupComponentParams = AgGroupComponentParams<BeanCollection>;
