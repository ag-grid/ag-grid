import { asyncSetTimeout } from '../utils';

export type InteractionEventOptions = MouseEventInit | PointerEventInit | TouchEventInit;

export type DragInteractionType = 'mouse' | 'pointer' | 'touch';

export const DRAG_INTERACTION_TYPES: readonly DragInteractionType[] = ['mouse', 'pointer', 'touch'];

export const DRAG_NO_MOVE_INTERACTION_CASES: Array<[boolean, DragInteractionType]> = [true, false].flatMap(
    (suppressMoveWhenRowDragging) =>
        DRAG_INTERACTION_TYPES.map(
            (eventType) => [suppressMoveWhenRowDragging, eventType] as [boolean, DragInteractionType]
        )
);

const POINTER_COMPATIBILITY_MOUSE_EVENTS: Record<string, string> = {
    pointerdown: 'mousedown',
    pointermove: 'mousemove',
    pointerup: 'mouseup',
    pointercancel: 'mouseup',
};

const INTERACTION_EVENT_NAMES: Record<DragInteractionType, { down: string; move: string; up: string }> = {
    mouse: { down: 'mousedown', move: 'mousemove', up: 'mouseup' },
    pointer: { down: 'pointerdown', move: 'pointermove', up: 'pointerup' },
    touch: { down: 'touchstart', move: 'touchmove', up: 'touchend' },
} as const;

export class DragEventDispatcher {
    public readonly dataTransfer: DataTransfer;
    private readonly eventType: DragInteractionType;
    private readonly dropContainer: Element | null;
    private upTarget: Element | Document | null = null;
    private dragHandle: Element | null = null;
    private _currentDropTarget: Element | null = null;
    private _currentX = 0;
    private _currentY = 0;

    public get currentDropTarget(): Element | null {
        return this._currentDropTarget;
    }

    public get currentX(): number {
        return this._currentX;
    }

    public get currentY(): number {
        return this._currentY;
    }

    public constructor(eventType: DragInteractionType, dropContainer?: Element | null) {
        this.eventType = eventType;
        this.dropContainer = dropContainer ?? null;
        const dataTransfer = new DataTransfer();
        dataTransfer.effectAllowed = 'all';
        this.dataTransfer = dataTransfer;
    }

    public async startDrag(dragHandle: Element, clientX: number, clientY: number): Promise<void> {
        const { down } = INTERACTION_EVENT_NAMES[this.eventType];

        this.dragHandle = dragHandle;
        const moveTarget = this.getMoveTarget();
        this.upTarget = moveTarget;

        await this.fire(dragHandle, down, { clientX, clientY, buttons: 1, button: 0 });

        this._currentDropTarget = null;
        this._currentX = clientX;
        this._currentY = clientY;

        await this.fire(dragHandle, 'dragstart', { clientX, clientY });
    }

    public async movePointer(targetElement: Element, clientX: number, clientY: number): Promise<void> {
        const dropContainer = this.getDropContainer();
        const dragHandle = this.dragHandle;
        if (!dragHandle) {
            throw new Error('DragEventDispatcher.movePointer called before startDrag');
        }

        const moveTarget = this.getMoveTarget();

        const { move } = INTERACTION_EVENT_NAMES[this.eventType];
        await this.fire(moveTarget, move, { clientX, clientY, buttons: 1 });

        const previousDropTarget = this._currentDropTarget;
        const targetChanged = previousDropTarget !== targetElement;

        if (targetChanged && previousDropTarget) {
            const leaveOpts = { clientX, clientY, relatedTarget: targetElement };
            await this.fire(previousDropTarget, 'dragleave', leaveOpts);
            if (previousDropTarget !== dropContainer) {
                await this.fire(dropContainer, 'dragleave', leaveOpts);
            }
        }

        if (targetChanged) {
            const enterOpts = { clientX, clientY, relatedTarget: previousDropTarget ?? null };
            if (targetElement !== dropContainer) {
                await this.fire(dropContainer, 'dragenter', enterOpts);
            }
            await this.fire(targetElement, 'dragenter', enterOpts);
        }

        this.dataTransfer.dropEffect = 'move';
        if (targetElement !== dropContainer) {
            await this.fire(dropContainer, 'dragover', { clientX, clientY });
        }
        await this.fire(targetElement, 'dragover', { clientX, clientY });

        await this.fire(dragHandle, 'drag', { clientX, clientY });

        await asyncSetTimeout(0);

        this._currentDropTarget = targetElement;
        this._currentX = clientX;
        this._currentY = clientY;
    }

    public async finishDrag(finalDropTarget?: Element | null | undefined): Promise<void> {
        const dragHandle = this.dragHandle;
        const currentDropTarget = finalDropTarget ?? this._currentDropTarget;
        const currentX = this._currentX;
        const currentY = this._currentY;

        if (!dragHandle) {
            throw new Error('DragEventDispatcher.finishDrag called before startDrag');
        }

        if (!currentDropTarget) {
            throw new Error('DragEventDispatcher.finishDrag called without a drop target');
        }

        const resolvedUpTarget = this.resolveUpTarget();
        const { up } = INTERACTION_EVENT_NAMES[this.eventType];

        await this.fire(currentDropTarget, 'drop', { clientX: currentX, clientY: currentY });
        await this.fire(dragHandle, 'dragend', { clientX: currentX, clientY: currentY });
        await this.fire(resolvedUpTarget, up, { clientX: currentX, clientY: currentY, buttons: 0 });
    }

    public async cancelDrag(): Promise<void> {
        const dragHandle = this.dragHandle;
        const x = this._currentX;
        const y = this._currentY;

        if (!dragHandle) {
            throw new Error('DragEventDispatcher.cancelDrag called before startDrag');
        }

        const moveTarget = this.getMoveTarget();
        const resolvedUpTarget = this.resolveUpTarget();
        const { up } = INTERACTION_EVENT_NAMES[this.eventType];

        this.dataTransfer.dropEffect = 'none';
        if (this.eventType === 'pointer') {
            await this.fire(moveTarget, 'pointercancel', { clientX: x, clientY: y, buttons: 0 });
        } else if (this.eventType === 'touch') {
            const opts: InteractionEventOptions = { clientX: x, clientY: y };
            await this.fire(moveTarget, 'touchcancel', opts);
            const ownerDocument = determineOwnerDocument(this.getDropContainer(), moveTarget, dragHandle);
            if (ownerDocument !== moveTarget) {
                await this.fire(ownerDocument, 'touchcancel', opts);
            }
            await asyncSetTimeout(0);
        } else {
            const dropContainer = this.getDropContainer();
            const ownerDocument = determineOwnerDocument(dropContainer, moveTarget, dragHandle);
            const rootEventTarget = determineRootEventTarget(dropContainer, ownerDocument);
            await this.fireESC(rootEventTarget);
        }

        await this.fire(dragHandle, 'dragend', { clientX: x, clientY: y });
        await this.fire(resolvedUpTarget, up, { clientX: x, clientY: y, buttons: 0 });
    }

    private reset() {
        this.upTarget = null;
        this.dragHandle = null;
        this._currentDropTarget = null;
        this._currentX = 0;
        this._currentY = 0;
    }

    private getMoveTarget(): Element | Document {
        const dragHandle = this.dragHandle;
        if (!dragHandle) {
            throw new Error('DragEventDispatcher is missing a drag handle');
        }
        if (this.eventType === 'touch') {
            return dragHandle;
        }
        return dragHandle.ownerDocument ?? document;
    }

    private getDropContainer(): Element {
        const provided = this.dropContainer;
        if (provided) {
            return provided;
        }
        const moveTarget = this.getMoveTarget();
        if (moveTarget instanceof Element) {
            return moveTarget.ownerDocument?.documentElement ?? document.documentElement;
        }
        if (moveTarget instanceof Document) {
            return moveTarget.documentElement;
        }
        return document.documentElement;
    }

    private resolveUpTarget(upTarget?: Element | Document | null): Element | Document {
        const resolved = upTarget ?? this.upTarget ?? this.getMoveTarget();
        if (!resolved) {
            throw new Error('DragEventDispatcher is missing an up target');
        }
        this.upTarget = resolved;
        return resolved;
    }

    public async fire(
        element: Element | Document,
        eventType: string,
        options: InteractionEventOptions = {}
    ): Promise<void> {
        element.dispatchEvent(this.createInteractionEvent(element, eventType, options));
        const compatibilityMouseEventName = POINTER_COMPATIBILITY_MOUSE_EVENTS[eventType];
        if (compatibilityMouseEventName) {
            element.dispatchEvent(this.createInteractionEvent(element, compatibilityMouseEventName, options));
        }
    }

    public async fireESC(rootEventTarget: EventTarget) {
        rootEventTarget.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true })
        );
    }

    private createInteractionEvent(
        element: Element | Document,
        eventName: string,
        options: InteractionEventOptions | undefined
    ): Event {
        const isDragEvent = eventName.startsWith('drag') || eventName === 'drop';

        if (isDragEvent) {
            const dragEventInit: DragEventInit = {
                bubbles: true,
                cancelable: true,
                ...(options as DragEventInit),
                dataTransfer: this.dataTransfer,
            };
            const dragEvent = new DragEvent(eventName, dragEventInit);
            Object.defineProperty(dragEvent, 'dataTransfer', {
                configurable: true,
                writable: false,
                value: dragEventInit.dataTransfer,
            });
            return dragEvent;
        }

        if (eventName.startsWith('touch')) {
            const isEnd = eventName === 'touchend' || eventName === 'touchcancel';
            const touchEventInit: TouchEventInit = {
                bubbles: true,
                cancelable: true,
                touches: isEnd ? [] : [buildSyntheticTouch(element, options)],
                targetTouches: isEnd ? [] : [buildSyntheticTouch(element, options)],
                changedTouches: [buildSyntheticTouch(element, options)],
                ...(options as TouchEventInit),
            };
            return new TouchEvent(eventName, touchEventInit);
        }

        if (eventName.startsWith('pointer')) {
            const pointerInit: PointerEventInit = {
                bubbles: true,
                cancelable: true,
                pointerId: 1,
                pointerType: 'mouse',
                isPrimary: true,
                ...(options as PointerEventInit),
            };
            return new PointerEvent(eventName, pointerInit);
        }

        return new MouseEvent(eventName, {
            bubbles: true,
            cancelable: true,
            ...(options as MouseEventInit),
        });
    }
}

function buildSyntheticTouch(
    element: Element | Document,
    options: MouseEventInit | PointerEventInit | TouchEventInit | undefined
): Touch {
    const clientX = getClientCoordinate(options, 'clientX');
    const clientY = getClientCoordinate(options, 'clientY');
    const touchTarget = element as unknown as EventTarget;
    return new Touch({
        identifier: 0,
        target: touchTarget,
        clientX,
        clientY,
        pageX: clientX,
        pageY: clientY,
        screenX: clientX,
        screenY: clientY,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        force: 1,
        altitudeAngle: Math.PI / 2,
        azimuthAngle: 0,
        touchType: 'direct',
    });
}

function getClientCoordinate(
    options: MouseEventInit | PointerEventInit | TouchEventInit | undefined,
    key: 'clientX' | 'clientY'
): number {
    if (!options) {
        return 0;
    }

    const value = (options as Record<string, unknown>)[key];
    return typeof value === 'number' ? value : 0;
}

function determineOwnerDocument(
    dropContainer: Element | null,
    moveTarget: Element | Document | null,
    dragHandle: Element | null
): Document {
    if (dropContainer?.ownerDocument) {
        return dropContainer.ownerDocument;
    }
    if (moveTarget instanceof Document) {
        return moveTarget;
    }
    if (moveTarget instanceof Element && moveTarget.ownerDocument) {
        return moveTarget.ownerDocument;
    }
    if (dragHandle?.ownerDocument) {
        return dragHandle.ownerDocument;
    }
    return document;
}

function determineRootEventTarget(dropContainer: Element | null, ownerDocument: Document): EventTarget {
    const rootNode =
        dropContainer && typeof dropContainer.getRootNode === 'function' ? dropContainer.getRootNode() : ownerDocument;
    return (rootNode as EventTarget) ?? ownerDocument;
}
