import type { Bean } from '../context/bean';
import type { BeanCollection, BeanName, Context } from '../context/context';
import type { AgComponentEvent, AgComponentSelectorParams } from '../context/newContext/agComponent';
import { AgComponent } from '../context/newContext/agComponent';
import type { GridOptions } from '../entities/gridOptions';
import type { AgEventType } from '../eventTypes';
import type { AgEvent, AgEventListener, AgEventTypeParams, AllEventsWithoutGridCommon } from '../events';
import type { GRID_OPTION_DEFAULTS } from '../gridOptionsDefault';
import type { BooleanProps, GridOptionsService, PropertyChangedSource } from '../gridOptionsService';

/** The RefPlaceholder is used to control when data-ref attribute should be applied to the component
 * There are hanging data-refs in the DOM that are not being used internally by the component which we don't want to apply to the component.
 * There is also the case where data-refs are solely used for passing parameters to the component and should not be applied to the component.
 * It also enables validation to catch typo errors in the data-ref attribute vs component name.
 * The value is `null` so that it can be identified in the component and distinguished from just missing with undefined.
 * The `null` value also allows for existing falsy checks to work as expected when code can be run before the template is setup.
 */
export const RefPlaceholder: any = null;

export type ComponentEvent = AgComponentEvent;
export interface VisibleChangedEvent extends AgEvent<'displayChanged'> {
    visible: boolean;
}

export type ComponentSelector = AgComponentSelectorParams<Component<any>, AgComponentSelector>;

/** All the AG Grid components that are used within internal templates via <ag-autocomplete> syntax */
export type AgComponentSelector =
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

export class Component<TLocalEvent extends string = AgComponentEvent> extends AgComponent<
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
    AgComponentSelector
> {
    protected override propertiesChangedEventType = 'gridPropertyChanged' as const;
}
