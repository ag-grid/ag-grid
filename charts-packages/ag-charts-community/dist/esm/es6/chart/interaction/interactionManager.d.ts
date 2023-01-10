import { BaseManager } from './baseManager';
declare type InteractionTypes = 'click' | 'hover' | 'drag-start' | 'drag' | 'drag-end' | 'leave' | 'page-left';
export declare type InteractionEvent<T extends InteractionTypes> = {
    type: T;
    offsetX: number;
    offsetY: number;
    pageX: number;
    pageY: number;
    sourceEvent: Event;
    /** Consume the event, don't notify other listeners! */
    consume(): void;
} & (T extends 'drag' ? {
    startX: number;
    startY: number;
} : {});
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
