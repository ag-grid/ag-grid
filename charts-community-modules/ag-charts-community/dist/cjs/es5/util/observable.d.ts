export interface TypedEvent {
    readonly type: string;
}
export declare type TypedEventListener = (event: TypedEvent) => any;
export declare class Observable {
    private allEventListeners;
    addEventListener(type: string, listener: TypedEventListener): void;
    removeEventListener(type: string, listener: TypedEventListener): void;
    hasEventListener(type: string): boolean;
    clearEventListeners(): void;
    protected fireEvent<E extends TypedEvent>(event: E): void;
}
