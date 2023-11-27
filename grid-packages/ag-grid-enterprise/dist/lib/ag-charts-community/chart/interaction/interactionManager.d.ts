import { BaseManager } from './baseManager';
type InteractionTypes = 'click' | 'dblclick' | 'contextmenu' | 'hover' | 'drag-start' | 'drag' | 'drag-end' | 'leave' | 'page-left' | 'wheel';
export type InteractionEvent<T extends InteractionTypes = InteractionTypes> = {
    type: T;
    offsetX: number;
    offsetY: number;
    pageX: number;
    pageY: number;
    sourceEvent: Event;
    pauses: PauseTypes[];
    /** Consume the event, don't notify other listeners! */
    consume(): void;
    consumed?: boolean;
};
type PauseTypes = 'animation' | 'context-menu';
type ListenerMeta = {
    bypassPause?: PauseTypes[];
};
/**
 * Manages user interactions with a specific HTMLElement (or interactions that bubble from it's
 * children)
 */
export declare class InteractionManager extends BaseManager<InteractionTypes, InteractionEvent<InteractionTypes>, ListenerMeta> {
    private static interactionDocuments;
    private readonly rootElement;
    private readonly element;
    private readonly window;
    private eventHandler;
    private mouseDown;
    private touchDown;
    private dragStartElement?;
    private pausers;
    constructor(element: HTMLElement, document: Document, window: Window);
    destroy(): void;
    resume(pauseType: PauseTypes): void;
    pause(pauseType: PauseTypes): void;
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
