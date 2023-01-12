import { isNumber } from '../../util/value';
import { BaseManager, Listener } from './baseManager';

type InteractionTypes = 'click' | 'hover' | 'drag-start' | 'drag' | 'drag-end' | 'leave' | 'page-left';

type SUPPORTED_EVENTS =
    | 'click'
    | 'mousedown'
    | 'mousemove'
    | 'mouseup'
    | 'mouseout'
    | 'mouseenter'
    | 'touchstart'
    | 'touchmove'
    | 'touchend'
    | 'touchcancel'
    | 'pagehide';
const WINDOW_EVENT_HANDLERS: SUPPORTED_EVENTS[] = ['pagehide', 'mousemove', 'mouseup'];
const EVENT_HANDLERS: SUPPORTED_EVENTS[] = [
    'click',
    'mousedown',
    'mouseout',
    'mouseenter',
    'touchstart',
    'touchmove',
    'touchend',
    'touchcancel',
];

export type InteractionEvent<T extends InteractionTypes> = {
    type: T;
    offsetX: number;
    offsetY: number;
    pageX: number;
    pageY: number;
    sourceEvent: Event;
    /** Consume the event, don't notify other listeners! */
    consume(): void;
} & (T extends 'drag' ? { startX: number; startY: number } : {});

interface Coords {
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
    offsetX: number;
    offsetY: number;
}

const CSS = `
.ag-chart-wrapper {
    touch-action: none;
}
`;

/**
 * Manages user interactions with a specific HTMLElement (or interactions that bubble from it's
 * children)
 */
export class InteractionManager extends BaseManager<InteractionTypes, InteractionEvent<InteractionTypes>> {
    private static interactionDocuments: Document[] = [];

    private readonly rootElement: HTMLElement;
    private readonly element: HTMLElement;

    private eventHandler = (event: MouseEvent | TouchEvent | Event) => this.processEvent(event);

    private mouseDown = false;
    private touchDown = false;
    private dragStartElement?: HTMLElement;

    public constructor(element: HTMLElement, doc = document) {
        super();

        this.rootElement = doc.body;
        this.element = element;

        for (const type of EVENT_HANDLERS) {
            if (type.startsWith('touch')) {
                element.addEventListener(type, this.eventHandler, { passive: true });
            } else {
                element.addEventListener(type, this.eventHandler);
            }
        }

        for (const type of WINDOW_EVENT_HANDLERS) {
            window.addEventListener(type, this.eventHandler);
        }

        if (InteractionManager.interactionDocuments.indexOf(doc) < 0) {
            const styleElement = document.createElement('style');
            styleElement.innerHTML = CSS;
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            InteractionManager.interactionDocuments.push(doc);
        }
    }

    public destroy() {
        for (const type of WINDOW_EVENT_HANDLERS) {
            window.removeEventListener(type, this.eventHandler);
        }

        for (const type of EVENT_HANDLERS) {
            this.element.removeEventListener(type, this.eventHandler);
        }
    }

    private processEvent(event: MouseEvent | TouchEvent | Event) {
        const types: InteractionTypes[] = this.decideInteractionEventTypes(event);

        if (types.length > 0) {
            // Async dispatch to avoid blocking the event-processing thread.
            this.dispatchEvent(event, types);
        }
    }

    private async dispatchEvent(event: MouseEvent | TouchEvent | Event, types: InteractionTypes[]) {
        const coords = this.calculateCoordinates(event);

        if (coords == null) {
            return;
        }

        for (const type of types) {
            const interactionType = type as InteractionTypes;
            const listeners = this.registeredListeners[interactionType] ?? [];
            const interactionEvent = this.buildEvent({ event, ...coords, type: interactionType });

            listeners.forEach((listener: Listener<any>) => {
                try {
                    if (!interactionEvent.consumed) {
                        listener.handler(interactionEvent);
                    }
                } catch (e) {
                    console.error(e);
                }
            });
        }
    }

    private decideInteractionEventTypes(event: MouseEvent | TouchEvent | Event): InteractionTypes[] {
        switch (event.type) {
            case 'click':
                return ['click'];

            case 'mousedown':
                this.mouseDown = true;
                this.dragStartElement = event.target as HTMLElement;
                return ['drag-start'];
            case 'touchstart':
                this.touchDown = true;
                this.dragStartElement = event.target as HTMLElement;
                return ['drag-start'];

            case 'touchmove':
            case 'mousemove':
                if (!this.mouseDown && !this.touchDown && !this.isEventOverElement(event)) {
                    // We only care about these events if the target is the canvas, unless
                    // we're in the middle of a drag/slide.
                    return [];
                }
                return this.mouseDown || this.touchDown ? ['drag'] : ['hover'];

            case 'mouseup':
                if (!this.mouseDown && !this.isEventOverElement(event)) {
                    // We only care about these events if the target is the canvas, unless
                    // we're in the middle of a drag.
                    return [];
                }
                this.mouseDown = false;
                this.dragStartElement = undefined;
                return ['drag-end'];
            case 'touchend':
                if (!this.touchDown && !this.isEventOverElement(event)) {
                    // We only care about these events if the target is the canvas, unless
                    // we're in the middle of a slide.
                    return [];
                }
                this.touchDown = false;
                this.dragStartElement = undefined;
                return ['drag-end'];

            case 'mouseout':
            case 'touchcancel':
                return ['leave'];

            case 'mouseenter':
                const mouseButtonDown = event instanceof MouseEvent && (event.buttons & 1) === 1;
                if (this.mouseDown !== mouseButtonDown) {
                    this.mouseDown = mouseButtonDown;
                    return [mouseButtonDown ? 'drag-start' : 'drag-end'];
                }
                return [];

            case 'pagehide':
                return ['page-left'];
        }

        return [];
    }

    private isEventOverElement(event: MouseEvent | TouchEvent | Event) {
        return event.target === this.element || (event.target as any)?.parentElement === this.element;
    }

    private static readonly NULL_COORDS: Coords = {
        clientX: -Infinity,
        clientY: -Infinity,
        pageX: -Infinity,
        pageY: -Infinity,
        offsetX: -Infinity,
        offsetY: -Infinity,
    };

    private calculateCoordinates(event: MouseEvent | TouchEvent | Event): Coords | undefined {
        if (event instanceof MouseEvent) {
            const mouseEvent = event as MouseEvent;
            const { clientX, clientY, pageX, pageY, offsetX, offsetY } = mouseEvent;
            return this.fixOffsets(event, { clientX, clientY, pageX, pageY, offsetX, offsetY });
        } else if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
            const touchEvent = event as TouchEvent;
            const lastTouch = touchEvent.touches[0] ?? touchEvent.changedTouches[0];
            const { clientX, clientY, pageX, pageY } = lastTouch;
            return { ...InteractionManager.NULL_COORDS, clientX, clientY, pageX, pageY };
        } else if (event instanceof PageTransitionEvent) {
            if (event.persisted) {
                // Don't fire the page-left event since the page maybe revisited.
                return;
            }
            return InteractionManager.NULL_COORDS;
        }

        // Unsupported event - abort.
        return;
    }

    private fixOffsets(event: MouseEvent, coords: Coords) {
        const offsets = (el: HTMLElement) => {
            let x = 0;
            let y = 0;

            while (el) {
                x += el.offsetLeft;
                y += el.offsetTop;
                el = el.offsetParent as HTMLElement;
            }

            return { x, y };
        };

        if (this.dragStartElement != null && event.target !== this.dragStartElement) {
            // Offsets need to be relative to the drag-start element to avoid jumps when
            // the pointer moves between element boundaries.

            const offsetDragStart = offsets(this.dragStartElement);
            const offsetEvent = offsets(event.target as HTMLElement);
            coords.offsetX -= offsetDragStart.x - offsetEvent.x;
            coords.offsetY -= offsetDragStart.y - offsetEvent.y;
        }
        return coords;
    }

    private buildEvent(opts: {
        type: InteractionTypes;
        event: Event;
        clientX: number;
        clientY: number;
        offsetX?: number;
        offsetY?: number;
        pageX?: number;
        pageY?: number;
    }) {
        let { type, event, clientX, clientY, offsetX, offsetY, pageX, pageY } = opts;

        if (!isNumber(offsetX) || !isNumber(offsetY)) {
            const rect = this.element.getBoundingClientRect();
            offsetX = clientX - rect.left;
            offsetY = clientY - rect.top;
        }
        if (!isNumber(pageX) || !isNumber(pageY)) {
            const pageRect = this.rootElement.getBoundingClientRect();
            pageX = clientX - pageRect.left;
            pageY = clientY - pageRect.top;
        }

        const builtEvent = {
            type,
            offsetX,
            offsetY,
            pageX,
            pageY,
            sourceEvent: event,
            consumed: false,
            consume: () => (builtEvent.consumed = true),
        };

        return builtEvent;
    }
}
