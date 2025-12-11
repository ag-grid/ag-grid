import { AgComponentStub } from '../agStack/core/agComponentStub';
import type { AgBaseComponent, AgComponentEvent, AgComponentSelector } from '../agStack/interfaces/agComponent';
import type { AgWidgetSelectorType } from '../agStack/widgets/agWidgetSelectorType';
import type { BeanCollection } from '../context/context';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { AgGridCommon } from '../interfaces/iCommon';

export type ComponentEvent = AgComponentEvent;

export type ComponentSelector<TComponent extends AgBaseComponent<BeanCollection> = AgBaseComponent<BeanCollection>> =
    AgComponentSelector<AgComponentSelectorType, BeanCollection, TComponent>;

/** All the AG Grid components that are used within internal templates via <ag-autocomplete> syntax */
export type AgComponentSelectorType =
    | AgWidgetSelectorType
    | 'AG-AUTOCOMPLETE'
    | 'AG-FAKE-HORIZONTAL-SCROLL'
    | 'AG-FAKE-VERTICAL-SCROLL'
    | 'AG-FILTER-BUTTON'
    | 'AG-FILTERS-TOOL-PANEL-HEADER'
    | 'AG-FILTERS-TOOL-PANEL-LIST'
    | 'AG-GRID-BODY'
    | 'AG-GRID-HEADER-DROP-ZONES'
    | 'AG-HEADER-ROOT'
    | 'AG-NAME-VALUE'
    | 'AG-OVERLAY-WRAPPER'
    | 'AG-PAGE-SIZE-SELECTOR'
    | 'AG-PAGINATION'
    | 'AG-PRIMARY-COLS-HEADER'
    | 'AG-PRIMARY-COLS-LIST'
    | 'AG-ROW-CONTAINER'
    | 'AG-SIDE-BAR'
    | 'AG-SIDE-BAR-BUTTONS'
    | 'AG-SORT-INDICATOR'
    | 'AG-STATUS-BAR'
    | 'AG-WATERMARK'
    | 'AG-FORMULA-INPUT-FIELD';

export class Component<TLocalEvent extends string = AgComponentEvent> extends AgComponentStub<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType,
    TLocalEvent
> {}
