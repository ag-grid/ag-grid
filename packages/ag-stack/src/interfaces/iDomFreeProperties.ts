import type { AgEvent } from './agEvent';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type AgPropertyChangedSource = 'api' | 'optionsUpdated';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AgPropertyChangeSet<TProperties> {
    /** Unique id which can be used to link changes of multiple properties that were updated together.
     * i.e a user updated multiple properties at the same time.
     */
    id: number;
    /** All the properties that have been updated in this change set */
    properties: (keyof TProperties)[];
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AgPropertyChangedEvent<TProperties> extends AgEvent {
    type: 'propertyChanged';
    changeSet: AgPropertyChangeSet<TProperties> | undefined;
    source: AgPropertyChangedSource;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type AgPropertyKey<TProperties> = keyof TProperties & string;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AgPropertyValueChangedEvent<TProperties, K extends AgPropertyKey<TProperties>> extends AgEvent {
    type: K;
    changeSet: AgPropertyChangeSet<TProperties> | undefined;
    currentValue: TProperties[K];
    previousValue: TProperties[K];
    source: AgPropertyChangedSource;
}

export type AgPropertyChangedListener<TProperties> = (event: AgPropertyChangedEvent<TProperties>) => void;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type AgPropertyValueChangedListener<TProperties, K extends AgPropertyKey<TProperties>> = (
    event: AgPropertyValueChangedEvent<TProperties, K>
) => void;

/**
 * Reading properties and listening for changes. `IPropertiesService` adds the DOM-ownership members.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface IDomFreePropertiesService<TProperties> {
    readonly beanName: 'gos';

    addPropertyEventListener<K extends keyof TProperties & string>(
        event: K,
        listener: AgPropertyValueChangedListener<TProperties, K>
    ): void;

    removePropertyEventListener<K extends keyof TProperties & string>(
        event: K,
        listener: AgPropertyValueChangedListener<TProperties, K>
    ): void;

    get<K extends AgPropertyKey<TProperties>>(property: K): TProperties[K];
}

/**
 * Listening for a whole change set. Separate from {@link IDomFreePropertiesService} because not every store offers it.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface IPropertiesChangedSource<TProperties> {
    addPropertiesChangedListener(listener: AgPropertyChangedListener<TProperties>): void;

    removePropertiesChangedListener(listener: AgPropertyChangedListener<TProperties>): void;
}

/**
 * A properties store that also emits change sets.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export type IObservablePropertiesService<TProperties> = IDomFreePropertiesService<TProperties> &
    IPropertiesChangedSource<TProperties>;
