import type { AgEvent } from './agEvent';

export interface BaseProperties {
    tabIndex?: number;
}

export interface BasePropertyDefaults {
    tabIndex: number;
}

export interface AgPropertyChangeSet<TProperties extends BaseProperties> {
    /** Unique id which can be used to link changes of multiple properties that were updated together.
     * i.e a user updated multiple properties at the same time.
     */
    id: number;
    /** All the properties that have been updated in this change set */
    properties: (keyof TProperties)[];
}
export interface AgPropertyChangedEvent<TProperties extends BaseProperties, TEventType extends string, TEventSource>
    extends AgEvent {
    type: TEventType;
    changeSet: AgPropertyChangeSet<TProperties> | undefined;
    source: TEventSource;
}

export type AgPropertyKey<TProperties extends BaseProperties> = keyof TProperties & string;

export type AgPropertyValue<TProperties extends BaseProperties, K extends AgPropertyKey<TProperties>> = TProperties[K];

export type AgPropertyValueOrDefault<
    TProperties extends BaseProperties,
    TPropertyDefaults extends BasePropertyDefaults,
    K extends AgPropertyKey<TProperties>,
> = K extends keyof TPropertyDefaults & string
    ? NonNullable<AgPropertyValue<TProperties, K>>
    : AgPropertyValue<TProperties, K>;

/**
 * For boolean properties the changed value will have been coerced to a boolean, so we do not want the type to include the undefined value.
 */
type PropertiesOrBooleanCoercedValue<
    TProperties extends BaseProperties,
    TBooleanProperties,
    K extends AgPropertyKey<TProperties>,
> = K extends TBooleanProperties ? boolean : AgPropertyValue<TProperties, K>;

export interface AgPropertyValueChangedEvent<
    TProperties extends BaseProperties,
    TBooleanProperties,
    TEventSource,
    K extends AgPropertyKey<TProperties>,
> extends AgEvent {
    type: K;
    changeSet: AgPropertyChangeSet<TProperties> | undefined;
    currentValue: PropertiesOrBooleanCoercedValue<TProperties, TBooleanProperties, K>;
    previousValue: PropertiesOrBooleanCoercedValue<TProperties, TBooleanProperties, K>;
    source: TEventSource;
}

export type AgPropertyChangedListener<
    TProperties extends BaseProperties,
    TPropertiesEventType extends string,
    TEventSource,
> = (event: AgPropertyChangedEvent<TProperties, TPropertiesEventType, TEventSource>) => void;

export type AgPropertyValueChangedListener<
    TProperties extends BaseProperties,
    TBooleanProperties,
    TEventSource,
    K extends AgPropertyKey<TProperties>,
> = (event: AgPropertyValueChangedEvent<TProperties, TBooleanProperties, TEventSource, K>) => void;

export interface IPropertiesService<
    TProperties extends BaseProperties,
    TPropertyDefaults extends BasePropertyDefaults,
    TBooleanProperties,
    TEventSource,
> {
    addPropertyEventListener<K extends keyof TProperties & string>(
        event: K,
        listener: AgPropertyValueChangedListener<TProperties, TBooleanProperties, TEventSource, K>
    ): void;
    removePropertyEventListener<K extends keyof TProperties & string>(
        event: K,
        listener: AgPropertyValueChangedListener<TProperties, TBooleanProperties, TEventSource, K>
    ): void;
    get<K extends AgPropertyKey<TProperties>>(property: K): AgPropertyValueOrDefault<TProperties, TPropertyDefaults, K>;
}
