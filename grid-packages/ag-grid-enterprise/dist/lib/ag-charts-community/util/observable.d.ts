export interface TypedEvent {
    readonly type: string;
}
export type TypedEventListener = (event: TypedEvent) => any;
export declare class Observable {
    private eventListeners;
    addEventListener(eventType: string, listener: TypedEventListener): void;
    removeEventListener(type: string, listener: TypedEventListener): void;
    hasEventListener(type: string): boolean;
    clearEventListeners(): void;
    protected fireEvent<TEvent extends TypedEvent>(event: TEvent): void;
}
