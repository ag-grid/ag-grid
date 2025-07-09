import type { AgEvent } from '../../events';

export interface BaseProperties {
    tabIndex?: number;
}

export type BasePropertyDefaults = 'tabIndex';

export interface AgPropertyChangeSet<TProperties> {
    /** Unique id which can be used to link changes of multiple properties that were updated together.
     * i.e a user updated multiple properties at the same time.
     */
    id: number;
    /** All the properties that have been updated in this change set */
    properties: (keyof (TProperties & BaseProperties))[];
}
export interface AgPropertyChangedEvent<TProperties, TEventType extends string, TEventSource> extends AgEvent {
    type: TEventType;
    changeSet: AgPropertyChangeSet<TProperties> | undefined;
    source: TEventSource;
}

export type AgPropertyKey<TProperties> = keyof (TProperties & BaseProperties) & string;

export type AgPropertyValue<TProperties, K extends AgPropertyKey<TProperties>> = (TProperties & BaseProperties)[K];

export type AgPropertyValueOrDefault<
    TProperties,
    TPropertyDefaults extends AgPropertyKey<TProperties>,
    K extends AgPropertyKey<TProperties>,
> = K extends TPropertyDefaults | BasePropertyDefaults
    ? NonNullable<AgPropertyValue<TProperties, K>>
    : AgPropertyValue<TProperties, K>;

/**
 * For boolean properties the changed value will have been coerced to a boolean, so we do not want the type to include the undefined value.
 */
type PropertiesOrBooleanCoercedValue<
    TProperties,
    TBooleanProperties,
    K extends AgPropertyKey<TProperties>,
> = K extends TBooleanProperties ? boolean : AgPropertyValue<TProperties, K>;

export interface AgPropertyValueChangedEvent<
    TProperties,
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

export type AgPropertyChangedListener<TProperties, TPropertiesEventType extends string, TEventSource> = (
    event: AgPropertyChangedEvent<TProperties, TPropertiesEventType, TEventSource>
) => void;
export type AgPropertyValueChangedListener<
    TProperties,
    TBooleanProperties,
    TEventSource,
    K extends AgPropertyKey<TProperties>,
> = (event: AgPropertyValueChangedEvent<TProperties, TBooleanProperties, TEventSource, K>) => void;

export interface IPropertiesService<TProperties, TPropertyDefaults extends AgPropertyKey<TProperties>> {
    addPropertyEventListener(event: any, listener: any): void;
    removePropertyEventListener(event: any, listener: any): void;
    get<K extends AgPropertyKey<TProperties>>(property: K): AgPropertyValueOrDefault<TProperties, TPropertyDefaults, K>;
}
