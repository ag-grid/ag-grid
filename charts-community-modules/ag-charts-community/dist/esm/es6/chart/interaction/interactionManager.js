var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Logger } from '../../util/logger';
import { isNumber } from '../../util/value';
import { BaseManager } from './baseManager';
const WINDOW_EVENT_HANDLERS = ['pagehide', 'mousemove', 'mouseup', 'wheel'];
const EVENT_HANDLERS = [
    'click',
    'dblclick',
    'contextmenu',
    'mousedown',
    'mouseout',
    'mouseenter',
    'touchstart',
    'touchmove',
    'touchend',
    'touchcancel',
];
const CSS = `
.ag-chart-wrapper {
    touch-action: none;
}
`;
/**
 * Manages user interactions with a specific HTMLElement (or interactions that bubble from it's
 * children)
 */
export class InteractionManager extends BaseManager {
    constructor(element, doc = document) {
        super();
        this.eventHandler = (event) => this.processEvent(event);
        this.mouseDown = false;
        this.touchDown = false;
        this.enabled = true;
        this.pausers = [];
        this.rootElement = doc.body;
        this.element = element;
        for (const type of EVENT_HANDLERS) {
            if (type.startsWith('touch')) {
                element.addEventListener(type, this.eventHandler, { passive: true });
            }
            else {
                element.addEventListener(type, this.eventHandler);
            }
        }
        for (const type of WINDOW_EVENT_HANDLERS) {
            if (type === 'wheel') {
                window.addEventListener(type, this.eventHandler, { passive: false });
            }
            else {
                window.addEventListener(type, this.eventHandler);
            }
        }
        if (InteractionManager.interactionDocuments.indexOf(doc) < 0) {
            const styleElement = document.createElement('style');
            styleElement.innerHTML = CSS;
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            InteractionManager.interactionDocuments.push(doc);
        }
    }
    destroy() {
        for (const type of WINDOW_EVENT_HANDLERS) {
            window.removeEventListener(type, this.eventHandler);
        }
        for (const type of EVENT_HANDLERS) {
            this.element.removeEventListener(type, this.eventHandler);
        }
    }
    resume(callerId) {
        this.pausers = this.pausers.filter((id) => id !== callerId);
        this.enabled = this.pausers.length <= 0;
        return this.enabled;
    }
    pause(callerId) {
        this.enabled = false;
        this.pausers.push(callerId);
    }
    processEvent(event) {
        const types = this.decideInteractionEventTypes(event);
        if (types.length > 0 && this.enabled) {
            // Async dispatch to avoid blocking the event-processing thread.
            this.dispatchEvent(event, types).catch((e) => Logger.errorOnce(e));
        }
    }
    dispatchEvent(event, types) {
        return __awaiter(this, void 0, void 0, function* () {
            const coords = this.calculateCoordinates(event);
            if (coords == null) {
                return;
            }
            for (const type of types) {
                const interactionEvent = this.buildEvent(Object.assign(Object.assign({ event }, coords), { type }));
                this.listeners.cancellableDispatch(type, () => interactionEvent.consumed, interactionEvent);
            }
        });
    }
    decideInteractionEventTypes(event) {
        switch (event.type) {
            case 'click':
                return ['click'];
            case 'dblclick':
                return ['dblclick'];
            case 'contextmenu':
                return ['contextmenu'];
            case 'mousedown':
                this.mouseDown = true;
                this.dragStartElement = event.target;
                return ['drag-start'];
            case 'touchstart':
                this.touchDown = true;
                this.dragStartElement = event.target;
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
            case 'wheel':
                return ['wheel'];
        }
        return [];
    }
    isEventOverElement(event) {
        var _a;
        return event.target === this.element || ((_a = event.target) === null || _a === void 0 ? void 0 : _a.parentElement) === this.element;
    }
    calculateCoordinates(event) {
        var _a;
        if (event instanceof MouseEvent) {
            const { clientX, clientY, pageX, pageY, offsetX, offsetY } = event;
            return this.fixOffsets(event, { clientX, clientY, pageX, pageY, offsetX, offsetY });
        }
        else if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
            const lastTouch = (_a = event.touches[0]) !== null && _a !== void 0 ? _a : event.changedTouches[0];
            const { clientX, clientY, pageX, pageY } = lastTouch;
            return Object.assign(Object.assign({}, InteractionManager.NULL_COORDS), { clientX, clientY, pageX, pageY });
        }
        else if (event instanceof PageTransitionEvent) {
            if (event.persisted) {
                // Don't fire the page-left event since the page maybe revisited.
                return;
            }
            return InteractionManager.NULL_COORDS;
        }
        // Unsupported event - abort.
    }
    fixOffsets(event, coords) {
        const offsets = (el) => {
            let x = 0;
            let y = 0;
            while (el) {
                x += el.offsetLeft;
                y += el.offsetTop;
                el = el.offsetParent;
            }
            return { x, y };
        };
        if (this.dragStartElement != null && event.target !== this.dragStartElement) {
            // Offsets need to be relative to the drag-start element to avoid jumps when
            // the pointer moves between element boundaries.
            const offsetDragStart = offsets(this.dragStartElement);
            const offsetEvent = offsets(event.target);
            coords.offsetX -= offsetDragStart.x - offsetEvent.x;
            coords.offsetY -= offsetDragStart.y - offsetEvent.y;
        }
        return coords;
    }
    buildEvent(opts) {
        const { type, event, clientX, clientY } = opts;
        let { offsetX, offsetY, pageX, pageY } = opts;
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
            offsetX: offsetX,
            offsetY: offsetY,
            pageX: pageX,
            pageY: pageY,
            sourceEvent: event,
            consumed: false,
            consume: () => (builtEvent.consumed = true),
        };
        return builtEvent;
    }
}
InteractionManager.interactionDocuments = [];
InteractionManager.NULL_COORDS = {
    clientX: -Infinity,
    clientY: -Infinity,
    pageX: -Infinity,
    pageY: -Infinity,
    offsetX: -Infinity,
    offsetY: -Infinity,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3Rpb25NYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L2ludGVyYWN0aW9uL2ludGVyYWN0aW9uTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDM0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUE2QjVDLE1BQU0scUJBQXFCLEdBQXVCLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDaEcsTUFBTSxjQUFjLEdBQXVCO0lBQ3ZDLE9BQU87SUFDUCxVQUFVO0lBQ1YsYUFBYTtJQUNiLFdBQVc7SUFDWCxVQUFVO0lBQ1YsWUFBWTtJQUNaLFlBQVk7SUFDWixXQUFXO0lBQ1gsVUFBVTtJQUNWLGFBQWE7Q0FDaEIsQ0FBQztBQXNCRixNQUFNLEdBQUcsR0FBRzs7OztDQUlYLENBQUM7QUFJRjs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sa0JBQW1CLFNBQVEsV0FBaUU7SUFlckcsWUFBbUIsT0FBb0IsRUFBRSxHQUFHLEdBQUcsUUFBUTtRQUNuRCxLQUFLLEVBQUUsQ0FBQztRQVZKLGlCQUFZLEdBQUcsQ0FBQyxLQUFxQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRW5FLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFDbEIsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUdsQixZQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ2YsWUFBTyxHQUFhLEVBQUUsQ0FBQztRQUszQixJQUFJLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7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