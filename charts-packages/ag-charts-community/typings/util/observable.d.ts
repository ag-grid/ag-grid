export interface TypedEvent {
    readonly type: string;
}
export interface SourceEvent<S> extends TypedEvent {
    readonly source: S;
}
export declare type SourceEventListener<S> = (event: SourceEvent<S>) => any;
export declare class Observable {
    static readonly privateKeyPrefix = "_";
    private allEventListeners;
    addEventListener(type: string, listener: SourceEventListener<this>, scope?: Object): void;
    removeEventListener(type: string, listener?: SourceEventListener<this>, scope?: Object): void;
    clearEventListeners(): void;
    protected notifyEventListeners(types: string[]): void;
    protected fireEvent<E extends TypedEvent>(event: Omit<E, 'source'>): void;
}
