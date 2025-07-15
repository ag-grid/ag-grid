import type { AgEvent } from './agEvent';
import type { BaseProperties } from './baseProperties';
import type { WithoutCommon } from './iEvent';

export type AgPropertyChangedSource = 'api' | 'optionsUpdated';

export interface AgPropertyChangeSet<TProperties extends BaseProperties> {
    /** Unique id which can be used to link changes of multiple properties that were updated together.
     * i.e a user updated multiple properties at the same time.
     */
    id: number;
    /** All the properties that have been updated in this change set */
    properties: (keyof TProperties)[];
}
export interface AgPropertyChangedEvent<TProperties extends BaseProperties> extends AgEvent {
    type: 'propertyChanged';
    changeSet: AgPropertyChangeSet<TProperties> | undefined;
    source: AgPropertyChangedSource;
}

export type AgPropertyKey<TProperties extends BaseProperties> = keyof TProperties & string;

export interface AgPropertyValueChangedEvent<TProperties extends BaseProperties, K extends AgPropertyKey<TProperties>>
    extends AgEvent {
    type: K;
    changeSet: AgPropertyChangeSet<TProperties> | undefined;
    currentValue: TProperties[K];
    previousValue: TProperties[K];
    source: AgPropertyChangedSource;
}

export type AgPropertyChangedListener<TProperties extends BaseProperties> = (
    event: AgPropertyChangedEvent<TProperties>
) => void;

export type AgPropertyValueChangedListener<TProperties extends BaseProperties, K extends AgPropertyKey<TProperties>> = (
    event: AgPropertyValueChangedEvent<TProperties, K>
) => void;

/**
 *  Get the properties that are of type `any`.
 *  Works by finding the properties that can extend a non existing string.
 *  This will only be the properties of type `any`.
 */
export type AnyProperties<TProperties extends BaseProperties> = {
    [K in keyof TProperties]: TProperties[K] extends 'NO_MATCH' ? K : never;
}[keyof TProperties];

type GetKeys<T, U> = {
    [K in keyof T]: T[K] extends U | undefined ? K : never;
}[keyof T];

/**
 * Get all the properties that strictly contain the provided type.
 * Does not include `any` properties.
 */
type KeysOfType<TProperties extends BaseProperties, U> = Exclude<GetKeys<TProperties, U>, AnyProperties<TProperties>>;

type NoArgFuncs<TProperties extends BaseProperties> = KeysOfType<TProperties, () => any>;
type AnyArgFuncs<TProperties extends BaseProperties> = KeysOfType<TProperties, (arg: 'NO_MATCH') => any>;
export type AgCallbackProps<TProperties extends BaseProperties, TCommon> = Exclude<
    KeysOfType<TProperties, (params: TCommon) => any>,
    NoArgFuncs<TProperties> | AnyArgFuncs<TProperties>
>;

export type AgExtractParamsFromCallback<TCallback> = TCallback extends (params: infer PA) => any ? PA : never;
export type AgExtractReturnTypeFromCallback<TCommon, TCallback> = TCallback extends (params: TCommon) => infer RT
    ? RT
    : never;
export type AgWrappedCallback<
    TProperties extends BaseProperties,
    TCommon,
    K extends AgCallbackProps<TProperties, TCommon>,
    OriginalCallback extends TProperties[K],
> =
    | undefined
    | ((
          params: WithoutCommon<TCommon, AgExtractParamsFromCallback<OriginalCallback>>
      ) => AgExtractReturnTypeFromCallback<TCommon, OriginalCallback>);

export interface IPropertiesService<TProperties extends BaseProperties, TCommon> {
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

    getCallback<K extends AgCallbackProps<TProperties, TCommon>>(
        property: K
    ): AgWrappedCallback<TProperties, TCommon, K, TProperties[K]>;

    addCommon<T extends TCommon>(params: WithoutCommon<TCommon, T>): T;
}
