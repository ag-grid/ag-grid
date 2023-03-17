import { BaseManager } from './baseManager';
declare type InteractionTypes = 'click' | 'dblclick' | 'hover' | 'drag-start' | 'drag' | 'drag-end' | 'leave' | 'page-left' | 'wheel';
export declare type InteractionEvent<T extends InteractionTypes> = {
    type: T;
    offsetX: number;
    offsetY: number;
    pageX: number;
    pageY: number;
    sourceEvent: Event;
    /** Consume the event, don't notify other listeners! */
    consume(): void;
};
/**
 * Manages user interactions with a specific HTMLElement (or interactions that bubble from it's
 * children)
 */
export declare class InteractionManager extends BaseManager<InteractionTypes, InteractionEvent<InteractionTypes>> {
    private static interactionDocuments;
    private readonly rootElement;
    private readonly element;
    private eventHandler;
    private mouseDown;
    private touchDown;
    private dragStartElement?;
    constructor(element: HTMLElement, doc?: Document);
    destroy(): void;
    private processEvent;
    private dispatchEvent;
    private decideInteractionEventTypes;
    private isEventOverElement;
    private static readonly NULL_COORDS;
    private calculateCoordinates;
    private fixOffsets;
    private buildEvent;
}
export {};
