type InteractionTypes = 'click' | 'hover' | 'drag-start' | 'drag' | 'drag-end' | 'leave';
type Listener<T extends InteractionTypes> = {
    symbol?: Symbol;
    handler: (event: InteractionEvent<T>) => void;
};

type SUPPORTED_EVENTS =
    | 'click'
    | 'mousedown'
    | 'mousemove'
    | 'mouseup'
    | 'mouseout'
    | 'touchstart'
    | 'touchmove'
    | 'touchend'
    | 'touchcancel';
const EVENT_HANDLERS: SUPPORTED_EVENTS[] = [
    'click',
    'mousedown',
    'mousemove',
    'mouseup',
    'mouseout',
    'touchstart',
    'touchmove',
    'touchend',
    'touchcancel',
];

export type InteractionEvent<T extends InteractionTypes> = {
    type: T;
    offsetX: number;
    offsetY: number;
    pageX?: number;
    pageY?: number;
    sourceEvent: Event;
} & (T extends 'drag' ? { startX: number; startY: number } : {});

const CSS = `
.ag-chart-wrapper {
    touch-action: none;
}
`;

/**
 * Manages user interactions with a specific HTMLElement (or interactions that bubble from it's
 * children)
 */
export class InteractionManager {
    private static interactionDocuments: Document[] = [];

    private readonly element: HTMLElement;

    private registeredListeners: Partial<{ [I in InteractionTypes]: Listener<I>[] }> = {};
    private eventHandler = (event: MouseEvent | TouchEvent) => this.processEvent(event);

    private mouseDown = false;
    private touchDown = false;

    public constructor(element: HTMLElement, doc = document) {
        this.element = element;

        for (const type of EVENT_HANDLERS) {
            element.addEventListener(type, this.eventHandler);
        }

        if (InteractionManager.interactionDocuments.indexOf(doc) < 0) {
            const styleElement = document.createElement('style');
            styleElement.innerHTML = CSS;
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            InteractionManager.interactionDocuments.push(doc);
        }
    }

    public addListener<T extends InteractionTypes>(type: T, cb: (event: InteractionEvent<T>) => void): Symbol {
        const symbol = Symbol(type);

        if (!this.registeredListeners[type]) {
            this.registeredListeners[type] = [];
        }

        this.registeredListeners[type]?.push({ symbol, handler: cb as any });

        return symbol;
    }

    public removeListener(listenerSymbol: Symbol) {
        Object.entries(this.registeredListeners).forEach(([type, listeners]) => {
            const match = listeners?.findIndex((entry: Listener<any>) => entry.symbol === listenerSymbol);

            if (match != null && match >= 0) {
                listeners?.splice(match, 1);
            }
            if (match != null && listeners?.length === 0) {
                delete this.registeredListeners[type as InteractionTypes];
            }
        });
    }

    public destroy() {
        for (const type of EVENT_HANDLERS) {
            this.element.removeEventListener(type, this.eventHandler);
        }
    }

    private processEvent(event: MouseEvent | TouchEvent) {
        let types: InteractionTypes[] = [];
        switch (event.type) {
            case 'click':
                types = ['click'];
                break;

            case 'mousedown':
                types = ['drag-start'];
                this.mouseDown = true;
                break;
            case 'touchstart':
                types = ['drag-start'];
                this.touchDown = true;
                break;

            case 'touchmove':
            case 'mousemove':
                types = [this.mouseDown || this.touchDown ? 'drag' : 'hover'];
                break;

            case 'mouseup':
                types = ['drag-end'];
                this.mouseDown = false;
                break;
            case 'touchend':
                types = ['drag-end', 'click'];
                this.touchDown = false;
                break;

            case 'mouseout':
            case 'touchcancel':
                types = ['leave'];
                break;
        }

        let offsetX = 0;
        let offsetY = 0;
        let pageX;
        let pageY;
        if (event instanceof MouseEvent) {
            const mouseEvent = event as MouseEvent;
            pageX = mouseEvent.pageX;
            pageY = mouseEvent.pageY;
            offsetX = mouseEvent.offsetX;
            offsetY = mouseEvent.offsetY;
        } else if (event instanceof TouchEvent) {
            const touchEvent = event as TouchEvent;
            const rect = this.element.getBoundingClientRect();
            const lastTouch = touchEvent.touches[0] ?? touchEvent.changedTouches[0];
            pageX = lastTouch?.pageX;
            pageY = lastTouch?.pageY;
            offsetX = lastTouch?.clientX - rect.left;
            offsetY = lastTouch?.clientY - rect.top;
        }

        for (const type of types) {
            const listeners = this.registeredListeners[type as InteractionTypes] ?? [];
            const interactionEvent = {
                type,
                offsetX,
                offsetY,
                pageX,
                pageY,
                sourceEvent: event,
            };

            listeners.forEach((listener: Listener<any>) => {
                try {
                    listener.handler(interactionEvent);
                } catch (e) {
                    console.error(e);
                }
            });
            if (listeners.length > 0) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }
}
