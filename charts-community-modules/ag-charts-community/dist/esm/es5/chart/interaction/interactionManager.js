var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { isNumber } from '../../util/value';
import { BaseManager } from './baseManager';
var WINDOW_EVENT_HANDLERS = ['pagehide', 'mousemove', 'mouseup', 'wheel'];
var EVENT_HANDLERS = [
    'click',
    'dblclick',
    'mousedown',
    'mouseout',
    'mouseenter',
    'touchstart',
    'touchmove',
    'touchend',
    'touchcancel',
];
var CSS = "\n.ag-chart-wrapper {\n    touch-action: none;\n}\n";
/**
 * Manages user interactions with a specific HTMLElement (or interactions that bubble from it's
 * children)
 */
var InteractionManager = /** @class */ (function (_super) {
    __extends(InteractionManager, _super);
    function InteractionManager(element, doc) {
        var e_1, _a, e_2, _b;
        if (doc === void 0) { doc = document; }
        var _this = _super.call(this) || this;
        _this.eventHandler = function (event) { return _this.processEvent(event); };
        _this.mouseDown = false;
        _this.touchDown = false;
        _this.rootElement = doc.body;
        _this.element = element;
        try {
            for (var EVENT_HANDLERS_1 = __values(EVENT_HANDLERS), EVENT_HANDLERS_1_1 = EVENT_HANDLERS_1.next(); !EVENT_HANDLERS_1_1.done; EVENT_HANDLERS_1_1 = EVENT_HANDLERS_1.next()) {
                var type = EVENT_HANDLERS_1_1.value;
                if (type.startsWith('touch')) {
                    element.addEventListener(type, _this.eventHandler, { passive: true });
                }
                else {
                    element.addEventListener(type, _this.eventHandler);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (EVENT_HANDLERS_1_1 && !EVENT_HANDLERS_1_1.done && (_a = EVENT_HANDLERS_1.return)) _a.call(EVENT_HANDLERS_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var WINDOW_EVENT_HANDLERS_1 = __values(WINDOW_EVENT_HANDLERS), WINDOW_EVENT_HANDLERS_1_1 = WINDOW_EVENT_HANDLERS_1.next(); !WINDOW_EVENT_HANDLERS_1_1.done; WINDOW_EVENT_HANDLERS_1_1 = WINDOW_EVENT_HANDLERS_1.next()) {
                var type = WINDOW_EVENT_HANDLERS_1_1.value;
                window.addEventListener(type, _this.eventHandler);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (WINDOW_EVENT_HANDLERS_1_1 && !WINDOW_EVENT_HANDLERS_1_1.done && (_b = WINDOW_EVENT_HANDLERS_1.return)) _b.call(WINDOW_EVENT_HANDLERS_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (InteractionManager.interactionDocuments.indexOf(doc) < 0) {
            var styleElement = document.createElement('style');
            styleElement.innerHTML = CSS;
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            InteractionManager.interactionDocuments.push(doc);
        }
        return _this;
    }
    InteractionManager.prototype.destroy = function () {
        var e_3, _a, e_4, _b;
        try {
            for (var WINDOW_EVENT_HANDLERS_2 = __values(WINDOW_EVENT_HANDLERS), WINDOW_EVENT_HANDLERS_2_1 = WINDOW_EVENT_HANDLERS_2.next(); !WINDOW_EVENT_HANDLERS_2_1.done; WINDOW_EVENT_HANDLERS_2_1 = WINDOW_EVENT_HANDLERS_2.next()) {
                var type = WINDOW_EVENT_HANDLERS_2_1.value;
                window.removeEventListener(type, this.eventHandler);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (WINDOW_EVENT_HANDLERS_2_1 && !WINDOW_EVENT_HANDLERS_2_1.done && (_a = WINDOW_EVENT_HANDLERS_2.return)) _a.call(WINDOW_EVENT_HANDLERS_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
        try {
            for (var EVENT_HANDLERS_2 = __values(EVENT_HANDLERS), EVENT_HANDLERS_2_1 = EVENT_HANDLERS_2.next(); !EVENT_HANDLERS_2_1.done; EVENT_HANDLERS_2_1 = EVENT_HANDLERS_2.next()) {
                var type = EVENT_HANDLERS_2_1.value;
                this.element.removeEventListener(type, this.eventHandler);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (EVENT_HANDLERS_2_1 && !EVENT_HANDLERS_2_1.done && (_b = EVENT_HANDLERS_2.return)) _b.call(EVENT_HANDLERS_2);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    InteractionManager.prototype.processEvent = function (event) {
        var types = this.decideInteractionEventTypes(event);
        if (types.length > 0) {
            // Async dispatch to avoid blocking the event-processing thread.
            this.dispatchEvent(event, types);
        }
    };
    InteractionManager.prototype.dispatchEvent = function (event, types) {
        return __awaiter(this, void 0, void 0, function () {
            var coords, _loop_1, this_1, types_1, types_1_1, type;
            var e_5, _a;
            return __generator(this, function (_b) {
                coords = this.calculateCoordinates(event);
                if (coords == null) {
                    return [2 /*return*/];
                }
                _loop_1 = function (type) {
                    var interactionEvent = this_1.buildEvent(__assign(__assign({ event: event }, coords), { type: type }));
                    this_1.listeners.cancellableDispatch(type, function () { return interactionEvent.consumed; }, interactionEvent);
                };
                this_1 = this;
                try {
                    for (types_1 = __values(types), types_1_1 = types_1.next(); !types_1_1.done; types_1_1 = types_1.next()) {
                        type = types_1_1.value;
                        _loop_1(type);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (types_1_1 && !types_1_1.done && (_a = types_1.return)) _a.call(types_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                return [2 /*return*/];
            });
        });
    };
    InteractionManager.prototype.decideInteractionEventTypes = function (event) {
        switch (event.type) {
            case 'click':
                return ['click'];
            case 'dblclick':
                return ['dblclick'];
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
                var mouseButtonDown = event instanceof MouseEvent && (event.buttons & 1) === 1;
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
    };
    InteractionManager.prototype.isEventOverElement = function (event) {
        var _a;
        return event.target === this.element || ((_a = event.target) === null || _a === void 0 ? void 0 : _a.parentElement) === this.element;
    };
    InteractionManager.prototype.calculateCoordinates = function (event) {
        var _a;
        if (event instanceof MouseEvent) {
            var clientX = event.clientX, clientY = event.clientY, pageX = event.pageX, pageY = event.pageY, offsetX = event.offsetX, offsetY = event.offsetY;
            return this.fixOffsets(event, { clientX: clientX, clientY: clientY, pageX: pageX, pageY: pageY, offsetX: offsetX, offsetY: offsetY });
        }
        else if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
            var lastTouch = (_a = event.touches[0]) !== null && _a !== void 0 ? _a : event.changedTouches[0];
            var clientX = lastTouch.clientX, clientY = lastTouch.clientY, pageX = lastTouch.pageX, pageY = lastTouch.pageY;
            return __assign(__assign({}, InteractionManager.NULL_COORDS), { clientX: clientX, clientY: clientY, pageX: pageX, pageY: pageY });
        }
        else if (event instanceof PageTransitionEvent) {
            if (event.persisted) {
                // Don't fire the page-left event since the page maybe revisited.
                return;
            }
            return InteractionManager.NULL_COORDS;
        }
        // Unsupported event - abort.
    };
    InteractionManager.prototype.fixOffsets = function (event, coords) {
        var offsets = function (el) {
            var x = 0;
            var y = 0;
            while (el) {
                x += el.offsetLeft;
                y += el.offsetTop;
                el = el.offsetParent;
            }
            return { x: x, y: y };
        };
        if (this.dragStartElement != null && event.target !== this.dragStartElement) {
            // Offsets need to be relative to the drag-start element to avoid jumps when
            // the pointer moves between element boundaries.
            var offsetDragStart = offsets(this.dragStartElement);
            var offsetEvent = offsets(event.target);
            coords.offsetX -= offsetDragStart.x - offsetEvent.x;
            coords.offsetY -= offsetDragStart.y - offsetEvent.y;
        }
        return coords;
    };
    InteractionManager.prototype.buildEvent = function (opts) {
        var type = opts.type, event = opts.event, clientX = opts.clientX, clientY = opts.clientY;
        var offsetX = opts.offsetX, offsetY = opts.offsetY, pageX = opts.pageX, pageY = opts.pageY;
        if (!isNumber(offsetX) || !isNumber(offsetY)) {
            var rect = this.element.getBoundingClientRect();
            offsetX = clientX - rect.left;
            offsetY = clientY - rect.top;
        }
        if (!isNumber(pageX) || !isNumber(pageY)) {
            var pageRect = this.rootElement.getBoundingClientRect();
            pageX = clientX - pageRect.left;
            pageY = clientY - pageRect.top;
        }
        var builtEvent = {
            type: type,
            offsetX: offsetX,
            offsetY: offsetY,
            pageX: pageX,
            pageY: pageY,
            sourceEvent: event,
            consumed: false,
            consume: function () { return (builtEvent.consumed = true); },
        };
        return builtEvent;
    };
    InteractionManager.interactionDocuments = [];
    InteractionManager.NULL_COORDS = {
        clientX: -Infinity,
        clientY: -Infinity,
        pageX: -Infinity,
        pageY: -Infinity,
        offsetX: -Infinity,
        offsetY: -Infinity,
    };
    return InteractionManager;
}(BaseManager));
export { InteractionManager };
