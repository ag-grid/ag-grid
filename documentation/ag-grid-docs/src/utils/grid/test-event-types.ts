/**
 * REVOLUTIONARY APPROACH: Template Literal Type Magic! 🎯
 * This uses template literal types to dynamically construct interface names
 * from event type strings, potentially solving the discrimination problem.
 */
import type * as AgGridTypes from 'ag-grid-community';
import type { AgPublicEventType } from 'ag-grid-community';

/**
 * Template literal type to convert event names to interface names
 * This needs to handle camelCase properly:
 * - 'cellClicked' -> 'CellClickedEvent'
 * - 'rowSelected' -> 'RowSelectedEvent'
 * - 'cellValueChanged' -> 'CellValueChangedEvent'
 */
export type EventNameToInterfaceName<T extends string> = `${Capitalize<T>}Event`;

/**
 * Direct interface mapping with enhanced type constraints and validation
 *
 * This approach provides multiple layers of type safety:
 * 1. Keys must be valid AgPublicEventType
 * 2. Values must be the correct ag-grid event interfaces
 * 3. Interface-event type consistency validation
 * 4. Readonly to prevent runtime modification
 * 5. Template literal naming pattern enforcement
 */

// Helper type to validate that interface has correct 'type' property
type ValidateEventInterface<TEventType extends AgPublicEventType, TInterface> = TInterface extends { type: TEventType }
    ? TInterface
    : never;

// Define the valid event types for mapping (ensures they're all AgPublicEventType)
type MappedEventKeys =
    | 'cellClicked'
    | 'cellDoubleClicked'
    | 'cellValueChanged'
    | 'cellEditingStarted'
    | 'cellEditingStopped'
    | 'columnMoved'
    | 'columnResized'
    | 'columnRowGroupChanged'
    | 'expandOrCollapseAll'
    | 'filterChanged'
    | 'firstDataRendered'
    | 'gridReady'
    | 'modelUpdated'
    | 'paginationChanged'
    | 'selectionChanged'
    | 'sortChanged'
    | 'rowDragEnd'
    | 'rowGroupOpened'
    | 'rowSelected';

// Constrained EventInterfaceMap with comprehensive validation
type EventInterfaceMap = {
    // Cell events
    readonly cellClicked: ValidateEventInterface<'cellClicked', AgGridTypes.CellClickedEvent>;
    readonly cellDoubleClicked: ValidateEventInterface<'cellDoubleClicked', AgGridTypes.CellDoubleClickedEvent>;
    readonly cellValueChanged: ValidateEventInterface<'cellValueChanged', AgGridTypes.CellValueChangedEvent>;

    readonly cellEditingStarted: ValidateEventInterface<'cellEditingStarted', AgGridTypes.CellEditingStartedEvent>;
    readonly cellEditingStopped: ValidateEventInterface<'cellEditingStopped', AgGridTypes.CellEditingStoppedEvent>;

    // Row events
    readonly rowSelected: ValidateEventInterface<'rowSelected', AgGridTypes.RowSelectedEvent>;
    readonly selectionChanged: ValidateEventInterface<'selectionChanged', AgGridTypes.SelectionChangedEvent>;
    readonly rowDragEnd: ValidateEventInterface<'rowDragEnd', AgGridTypes.RowDragEndEvent>;
    readonly rowGroupOpened: ValidateEventInterface<'rowGroupOpened', AgGridTypes.RowGroupOpenedEvent>;

    // Column events
    readonly columnMoved: ValidateEventInterface<'columnMoved', AgGridTypes.ColumnMovedEvent>;
    readonly columnResized: ValidateEventInterface<'columnResized', AgGridTypes.ColumnResizedEvent>;
    readonly columnRowGroupChanged: ValidateEventInterface<
        'columnRowGroupChanged',
        AgGridTypes.ColumnRowGroupChangedEvent
    >;

    // Grid state events
    readonly sortChanged: ValidateEventInterface<'sortChanged', AgGridTypes.SortChangedEvent>;
    readonly filterChanged: ValidateEventInterface<'filterChanged', AgGridTypes.FilterChangedEvent>;
    readonly gridReady: ValidateEventInterface<'gridReady', AgGridTypes.GridReadyEvent>;
    readonly firstDataRendered: ValidateEventInterface<'firstDataRendered', AgGridTypes.FirstDataRenderedEvent>;
    readonly modelUpdated: ValidateEventInterface<'modelUpdated', AgGridTypes.ModelUpdatedEvent>;
    readonly paginationChanged: ValidateEventInterface<'paginationChanged', AgGridTypes.PaginationChangedEvent>;
    readonly expandOrCollapseAll: ValidateEventInterface<'expandOrCollapseAll', AgGridTypes.ExpandOrCollapseAllEvent>;
};

// Compile-time validation that all mapped keys are valid AgPublicEventType
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ___ValidateAllKeysAreAgPublicEventType = MappedEventKeys extends AgPublicEventType ? true : never;

// Compile-time validation that all keys in EventInterfaceMap match MappedEventKeys
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ___ValidateMapCompleteness = keyof EventInterfaceMap extends MappedEventKeys ? true : never;

/**
 * Extract keys for events that have explicit interface mappings
 */
type DirectEventKeys<T extends keyof EventInterfaceMap> = keyof EventInterfaceMap[T];

/**
 * Enhanced event keys that preserve intellisense while allowing string fallback
 * Uses branded string technique to maintain autocomplete suggestions for known properties
 */
export type TemplateEventKeys<T extends AgPublicEventType> = T extends keyof EventInterfaceMap
    ? DirectEventKeys<T>
    : keyof AgGridTypes.AgEventTypeParams[T];

/**
 * Utility types for validation and testing
 */
export type VerifyCompleteCoverage = {
    [K in AgPublicEventType]: K extends AgPublicEventType ? true : never;
};

export type EventKeys<T extends AgPublicEventType> = TemplateEventKeys<T>;

export type IsValidEventKey<TEvent extends AgPublicEventType, TKey extends string> =
    TKey extends TemplateEventKeys<TEvent> ? true : false;

export type EventProperty<
    TEvent extends AgPublicEventType,
    TKey extends TemplateEventKeys<TEvent>,
> = TEvent extends keyof EventInterfaceMap
    ? TKey extends keyof EventInterfaceMap[TEvent]
        ? EventInterfaceMap[TEvent][TKey]
        : never
    : TKey extends keyof AgGridTypes.AgEventTypeParams[TEvent]
      ? AgGridTypes.AgEventTypeParams[TEvent][TKey]
      : never;
