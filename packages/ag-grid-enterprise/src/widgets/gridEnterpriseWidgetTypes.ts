import type {
    AgEventTypeParams,
    AgGridCommon,
    ContainerType,
    GridOptionsService,
    GridOptionsWithDefaults,
    _AgComponentSelectorType,
    _BeanCollection,
} from 'ag-grid-community';

import type { AgGroupComponent, AgGroupComponentParams } from '../agStack/agGroupComponent';
import type { AgPanel } from '../agStack/agPanel';
import type { AgSlider } from '../agStack/agSlider';
import type { AgTabbedLayout } from '../agStack/agTabbedLayout';
import type { AgTabbedItem } from '../agStack/iTabbedLayout';
import type { PanelOptions } from './panel';

export type GridSlider = AgSlider<
    _BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    _AgComponentSelectorType
>;

export type GridPanel = AgPanel<
    _BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    _AgComponentSelectorType,
    PanelOptions
>;

export type TabbedLayout = AgTabbedLayout<
    _BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    _AgComponentSelectorType,
    ContainerType
>;

export type TabbedItem = AgTabbedItem<ContainerType>;

export type GroupComponent = AgGroupComponent<
    _BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    _AgComponentSelectorType
>;

export type GroupComponentParams = AgGroupComponentParams<_BeanCollection>;
