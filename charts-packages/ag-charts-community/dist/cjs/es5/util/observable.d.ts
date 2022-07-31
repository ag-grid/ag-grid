export interface TypedEvent {
    readonly type: string;
}
export interface SourceEvent<S> extends TypedEvent {
    readonly source: S;
}
export interface PropertyChangeEvent<S, V> extends SourceEvent<S> {
    readonly value: V;
    readonly oldValue: V;
}
export declare type SourceEventListener<S> = (event: SourceEvent<S>) => any;
export declare type PropertyChangeEventListener<S, V> = (event: PropertyChangeEvent<S, V>) => any;
export declare class Observable {
    static readonly privateKeyPrefix = "_";
    private allPropertyListeners;
    private allEventListeners;
    addPropertyListener<K extends string & keyof this>(name: K, listener: PropertyChangeEventListener<this, this[K]>, scope?: Object): void;
    removePropertyListener<K extends string & keyof this>(name: K, listener?: PropertyChangeEventListener<this, this[K]>, scope?: Object): void;
    protected notifyPropertyListeners<K extends string & keyof this>(name: K, oldValue: this[K], value: this[K]): void;
    addEventListener(type: string, listener: SourceEventListener<this>, scope?: Object): void;
    removeEventListener(type: string, listener?: SourceEventListener<this>, scope?: Object): void;
    clearEventListeners(): void;
    protected notifyEventListeners(types: string[]): void;
    fireEvent<E extends TypedEvent>(event: Omit<E, 'source'>): void;
}
