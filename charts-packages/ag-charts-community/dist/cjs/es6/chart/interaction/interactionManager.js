"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionManager = void 0;
const value_1 = require("../../util/value");
const baseManager_1 = require("./baseManager");
const WINDOW_EVENT_HANDLERS = ['pagehide', 'mousemove', 'mouseup'];
const EVENT_HANDLERS = [
    'click',
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
class InteractionManager extends baseManager_1.BaseManager {
    constructor(element, doc = document) {
        super();
        this.eventHandler = (event) => this.processEvent(event);
        this.mouseDown = false;
        this.touchDown = false;
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
            window.addEventListener(type, this.eventHandler);
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
    processEvent(event) {
        const types = this.decideInteractionEventTypes(event);
        if (types.length > 0) {
            // Async dispatch to avoid blocking the event-processing thread.
            this.dispatchEvent(event, types);
        }
    }
    dispatchEvent(event, types) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const coords = this.calculateCoordinates(event);
            if (coords == null) {
                return;
            }
            for (const type of types) {
                const interactionType = type;
                const listeners = (_a = this.registeredListeners[interactionType]) !== null && _a !== void 0 ? _a : [];
                const interactionEvent = this.buildEvent(Object.assign(Object.assign({ event }, coords), { type: interactionType }));
                listeners.forEach((listener) => {
                    try {
                        if (!interactionEvent.consumed) {
                            listener.handler(interactionEvent);
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                });
            }
        });
    }
    decideInteractionEventTypes(event) {
        switch (event.type) {
            case 'click':
                return ['click'];
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
            const mouseEvent = event;
            const { clientX, clientY, pageX, pageY, offsetX, offsetY } = mouseEvent;
            return this.fixOffsets(event, { clientX, clientY, pageX, pageY, offsetX, offsetY });
        }
        else if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
            const touchEvent = event;
            const lastTouch = (_a = touchEvent.touches[0]) !== null && _a !== void 0 ? _a : touchEvent.changedTouches[0];
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
        return;
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
        let { type, event, clientX, clientY, offsetX, offsetY, pageX, pageY } = opts;
        if (!value_1.isNumber(offsetX) || !value_1.isNumber(offsetY)) {
            const rect = this.element.getBoundingClientRect();
            offsetX = clientX - rect.left;
            offsetY = clientY - rect.top;
        }
        if (!value_1.isNumber(pageX) || !value_1.isNumber(pageY)) {
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
exports.InteractionManager = InteractionManager;
InteractionManager.interactionDocuments = [];
InteractionManager.NULL_COORDS = {
    clientX: -Infinity,
    clientY: -Infinity,
    pageX: -Infinity,
    pageY: -Infinity,
    offsetX: -Infinity,
    offsetY: -Infinity,
};
