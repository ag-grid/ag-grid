import type { AgComponentEvent, AgComponentSelector } from '../agStack/agComponent';
import { AgComponentStub } from '../agStack/agComponent';
import type { Bean } from '../context/bean';
import type { BeanCollection, BeanName, Context } from '../context/context';
import type { GridOptions } from '../entities/gridOptions';
import type { AgEventType } from '../eventTypes';
import type { AgEventListener, AgEventTypeParams, AllEventsWithoutGridCommon } from '../events';
import type { GRID_OPTION_DEFAULTS } from '../gridOptionsDefault';
import type { BooleanProps, GridOptionsService, PropertyChangedSource } from '../gridOptionsService';

export type ComponentEvent = AgComponentEvent;

export type ComponentSelector = AgComponentSelector<AgComponentSelectorType, BeanCollection>;

/** All the AG Grid components that are used within internal templates via <ag-autocomplete> syntax */
export type AgComponentSelectorType =
    | 'AG-AUTOCOMPLETE'
    | 'AG-CHECKBOX'
    | 'AG-COLOR-INPUT'
    | 'AG-COLOR-PICKER'
    | 'AG-FAKE-HORIZONTAL-SCROLL'
    | 'AG-FAKE-VERTICAL-SCROLL'
    | 'AG-FILTER-BUTTON'
    | 'AG-FILTERS-TOOL-PANEL-HEADER'
    | 'AG-FILTERS-TOOL-PANEL-LIST'
    | 'AG-GRID-BODY'
    | 'AG-GRID-HEADER-DROP-ZONES'
    | 'AG-GROUP-COMPONENT'
    | 'AG-HEADER-ROOT'
    | 'AG-INPUT-DATE-FIELD'
    | 'AG-INPUT-NUMBER-FIELD'
    | 'AG-INPUT-RANGE'
    | 'AG-INPUT-TEXT-AREA'
    | 'AG-INPUT-TEXT-FIELD'
    | 'AG-NAME-VALUE'
    | 'AG-OVERLAY-WRAPPER'
    | 'AG-PAGE-SIZE-SELECTOR'
    | 'AG-PAGINATION'
    | 'AG-PRIMARY-COLS-HEADER'
    | 'AG-PRIMARY-COLS-LIST'
    | 'AG-PRIMARY-COLS'
    | 'AG-ROW-CONTAINER'
    | 'AG-SELECT'
    | 'AG-SIDE-BAR'
    | 'AG-SIDE-BAR-BUTTONS'
    | 'AG-SLIDER'
    | 'AG-SORT-INDICATOR'
    | 'AG-STATUS-BAR'
    | 'AG-TOGGLE-BUTTON'
    | 'AG-WATERMARK';

export class Component<TLocalEvent extends string = AgComponentEvent> extends AgComponentStub<
    Component<any>,
    BeanName,
    BeanCollection,
    Bean,
    Context,
    AgEventListener<any, any, any>,
    TLocalEvent,
    AgEventType,
    AgEventTypeParams,
    AllEventsWithoutGridCommon,
    GridOptions,
    typeof GRID_OPTION_DEFAULTS,
    BooleanProps,
    PropertyChangedSource,
    'gridPropertyChanged',
    GridOptionsService,
    AgComponentSelectorType
> {
    protected override propertiesChangedEventType = 'gridPropertyChanged' as const;
}
