export type MouseEventName = 'mouseup' | 'mousemove' | 'mousedown' | 'contextmenu';

const MOUSE_EVENTS: MouseEventName[] = ['mousedown', 'mousemove', 'mouseup', 'contextmenu'];

interface CreateForwardMouseEventsThroughElementParams {
    /**
     * Element to forward events through
     */
    element: HTMLElement;
    /**
     * @param event MouseEvent
     * @returns Whether to forward the mouse event or not
     */
    condition?: (event: Event) => boolean;
}

interface ForwardMouseEventThroughElementParams {
    /**
     * Element to forward events through
     */
    element: HTMLElement;
    event: MouseEvent;
    mouseEventName: MouseEventName;
}

/**
 * Forward a mouse event through another element by
 * checking underneath and forwarding the event to
 * the element underneath
 */
function forwardMouseEventThroughElement({ element, event, mouseEventName }: ForwardMouseEventThroughElementParams) {
    const initialPointerEventsValue = element.style.pointerEvents;

    // Remove pointer events, so that `document.elementFromPoint` can see what is underneath
    element.style.pointerEvents = 'none';

    const { clientX, clientY, button, buttons, cancelable, view, bubbles } = event;

    const elemUnderneath = document.elementFromPoint(clientX, clientY);

    const elemMouseEvent: MouseEvent = new MouseEvent(mouseEventName, {
        clientX,
        clientY,
        cancelable,
        view,
        button,
        buttons,
        bubbles,
    });
    elemUnderneath?.dispatchEvent(elemMouseEvent);

    // Set pointer events to initial value
    element.style.pointerEvents = initialPointerEventsValue;
}

export function initForwardMouseEventsThroughElement({
    element,
    condition = () => true,
}: CreateForwardMouseEventsThroughElementParams) {
    const createMouseHandler = (mouseEventName: MouseEventName) => (event) => {
        if (condition(event)) {
            forwardMouseEventThroughElement({
                element,
                event,
                mouseEventName,
            });
        }
    };
    const mouseHandlers: Record<MouseEventName, (event: Event) => void> = {} as Record<
        MouseEventName,
        (event: Event) => void
    >;

    // Add event listeners for all mouse events
    MOUSE_EVENTS.forEach((mouseEventName) => {
        const handler = createMouseHandler(mouseEventName);

        element.addEventListener(mouseEventName, handler);
        mouseHandlers[mouseEventName] = handler;
    });

    // Remove event listeners for all mouse events
    const cleanUp = () => {
        Object.keys(mouseHandlers).forEach((mouseEventName) => {
            element.removeEventListener(mouseEventName, mouseHandlers[mouseEventName]);
        });
    };

    return {
        cleanUp,
    };
}
