export interface TypedEvent {
    type: string;
}
export interface BrowserEvent extends TypedEvent {
    event: Event;
}
export interface PropertyChangeEvent<S, V> extends TypedEvent {
    source: S;
    value: V;
    oldValue: V;
}
export declare type TypedEventListener = (event: TypedEvent) => any;
export declare type PropertyChangeEventListener<S, V> = (event: PropertyChangeEvent<S, V>) => any;
export declare class Observable {
    static readonly privateKeyPrefix = "_";
    private propertyListeners;
    private eventListeners;
    addPropertyListener<K extends string & keyof this>(name: K, listener: PropertyChangeEventListener<this, this[K]>): PropertyChangeEventListener<this, this[K]>;
    removePropertyListener<K extends string & keyof this>(name: K, listener: PropertyChangeEventListener<this, this[K]>): void;
    protected notifyPropertyListeners<K extends string & keyof this>(name: K, oldValue: this[K], value: this[K]): void;
    addEventListener(type: string, listener: TypedEventListener): TypedEventListener;
    removeEventListener(type: string, listener: TypedEventListener): void;
    protected notifyEventListeners(types: string[]): void;
    fireEvent<E extends TypedEvent>(event: E): void;
}
export declare function reactive(events?: string[], property?: string): (target: any, key: string) => void;
