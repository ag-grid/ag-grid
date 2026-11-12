import { FORM_FIELD_SELECTOR, _addManagedElementListeners, _getWindow } from 'ag-stack';

import { BeanStub } from '../context/beanStub';
import type { GridBodyScrollFeature } from './gridBodyScrollFeature';

type Axis = 'x' | 'y';

interface WheelGesture {
    axis: Axis | null;
    x: number;
    y: number;
    lastAxisInputTime: number;
}

interface TouchGesture {
    id: number;
    axis: Axis | null;
    ownsScroll: boolean;
    startX: number;
    startY: number;
    x: number;
    y: number;
    time: number;
    velocity: number;
    velocitySamples: { position: number; time: number }[];
    remainder: number;
}

const WHEEL_GESTURE_GAP = 200;
const WHEEL_AXIS_DOMINANCE_RATIO = 2;
const WHEEL_THRESHOLD = 4;
const TOUCH_THRESHOLD = 6;
const MOMENTUM_DECAY = 250;
const MIN_VELOCITY = 0.02;
const MAX_VELOCITY = 3;
const RELEASE_WINDOW = 80;

// Controls and grid handles own their touch gestures for editing, activation and dragging.
const TOUCH_SCROLL_EXCLUDE_SELECTOR =
    `${FORM_FIELD_SELECTOR}, a, [contenteditable]:not([contenteditable="false"]), ` +
    '.ag-row-drag, .ag-header-cell-resize, .ag-fill-handle, .ag-selection-handle';

function isElement(target: EventTarget): target is Element {
    // Elements can be created in another window or adopted into this document.
    return (target as Node).nodeType === 1;
}

/** Opt-in input handling; the viewport and fake scrollbars keep their existing synchronisation. */
export class ScrollGestureFeature extends BeanStub {
    private wheelGesture: WheelGesture | null = null;
    private touchGesture: TouchGesture | null = null;
    private removeTouchListeners: (() => void) | null = null;
    private momentumFrame: { window: Window; id: number } | null = null;

    private viewport: HTMLElement;
    private scrollFeature: GridBodyScrollFeature;

    public init(gridBody: HTMLElement, viewport: HTMLElement, scrollFeature: GridBodyScrollFeature): void {
        this.viewport = viewport;
        this.scrollFeature = scrollFeature;
        const stopMomentum = this.stopMomentum.bind(this);
        _addManagedElementListeners(this, viewport, {
            wheel: this.gos.get('suppressPreventDefaultOnMouseWheel') ? undefined : this.onWheel.bind(this),
            touchstart: this.gos.get('suppressTouch') ? undefined : this.onTouchStart.bind(this),
        });
        _addManagedElementListeners(this, gridBody, {
            pointerdown: stopMomentum,
            keydown: stopMomentum,
        });
        const document = viewport.ownerDocument;
        document.addEventListener('visibilitychange', stopMomentum);
        this.addDestroyFunc(() => document.removeEventListener('visibilitychange', stopMomentum));
    }

    public override destroy(): void {
        this.stopMomentum();
        this.clearTouchGesture();
        this.wheelGesture = null;
        super.destroy();
    }

    private isBlocked(): boolean {
        return (
            !!this.beans.dragSvc?.dragging ||
            (this.gos.get('suppressScrollWhenPopupsAreOpen') && !!this.beans.popupSvc?.hasAnchoredPopup())
        );
    }

    private hasNestedScroller(event: Event, win: Window): boolean {
        for (const element of event.composedPath()) {
            if (element === this.viewport) {
                break;
            }
            if (!isElement(element)) {
                continue;
            }
            const style = win.getComputedStyle(element);
            if (
                (/auto|scroll/.test(style.overflowY) && element.scrollHeight > element.clientHeight) ||
                (/auto|scroll/.test(style.overflowX) && element.scrollWidth > element.clientWidth)
            ) {
                return true;
            }
        }
        return false;
    }

    private onWheel(event: WheelEvent): void {
        this.stopMomentum();
        if (event.defaultPrevented || !event.cancelable || event.ctrlKey || event.metaKey || this.isBlocked()) {
            this.wheelGesture = null;
            return;
        }
        const win = _getWindow(this.beans);
        const time = win.performance.now();
        let gesture = this.wheelGesture;
        if (!gesture || time - gesture.lastAxisInputTime > WHEEL_GESTURE_GAP) {
            this.wheelGesture = null;
            gesture = null;
        }
        // Keep ownership when scrolling moves nested content under the pointer.
        if (!gesture?.axis && this.hasNestedScroller(event, win)) {
            this.wheelGesture = null;
            return;
        }
        gesture ??= { axis: null, x: 0, y: 0, lastAxisInputTime: time };

        let { deltaX: x, deltaY: y } = event;
        if (event.shiftKey && x === 0) {
            x = y;
            y = 0;
        }
        if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
            const lineHeight = Number.parseFloat(win.getComputedStyle(this.viewport).lineHeight) || 16;
            x *= lineHeight;
            y *= lineHeight;
        } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
            x *= this.viewport.clientWidth;
            y *= this.viewport.clientHeight;
        }
        if (x === 0 && y === 0) {
            return;
        }

        const axisDelta = gesture.axis === 'x' ? x : y;
        const perpendicularDelta = gesture.axis === 'x' ? y : x;
        // Discarded perpendicular input must not renew the lock indefinitely. Near-diagonal drift still does.
        if (!gesture.axis || Math.abs(perpendicularDelta) <= Math.abs(axisDelta) * WHEEL_AXIS_DOMINANCE_RATIO) {
            gesture.lastAxisInputTime = time;
        }
        gesture.x += x;
        gesture.y += y;
        const axis = gesture.axis ?? this.dominantAxis(gesture.x, gesture.y);
        if (!gesture.axis && !this.canScroll(axis, axis === 'x' ? gesture.x : gesture.y)) {
            this.wheelGesture = null;
            return;
        }
        event.preventDefault();
        this.wheelGesture = gesture;
        if (!gesture.axis && Math.max(Math.abs(gesture.x), Math.abs(gesture.y)) < WHEEL_THRESHOLD) {
            return;
        }
        const delta = axis === 'x' ? gesture.x : gesture.y;
        gesture.axis = axis;
        const remainder = this.applyScrollDelta(axis, delta).remainder;
        gesture.x = axis === 'x' ? remainder : 0;
        gesture.y = axis === 'y' ? remainder : 0;
    }

    private onTouchStart(event: TouchEvent): void {
        this.stopMomentum();
        this.wheelGesture = null;
        this.clearTouchGesture();
        if (event.touches.length !== 1 || event.defaultPrevented || this.isBlocked()) {
            return;
        }
        const win = _getWindow(this.beans);
        if (
            this.hasNestedScroller(event, win) ||
            event.composedPath().some((element) => isElement(element) && element.matches(TOUCH_SCROLL_EXCLUDE_SELECTOR))
        ) {
            return;
        }
        const { identifier, clientX, clientY } = event.touches[0];
        const time = win.performance.now();
        this.touchGesture = {
            id: identifier,
            axis: null,
            ownsScroll: false,
            startX: clientX,
            startY: clientY,
            x: clientX,
            y: clientY,
            time,
            velocity: 0,
            velocitySamples: [{ position: 0, time }],
            remainder: 0,
        };
        // The original target keeps receiving touch events even if row virtualisation detaches it.
        const target = event.target!;
        const move = this.onTouchMove.bind(this);
        const end = this.onTouchEnd.bind(this);
        const cancel = this.clearTouchGesture.bind(this);
        target.addEventListener('touchmove', move as EventListener, { passive: false });
        target.addEventListener('touchend', end, { passive: true });
        target.addEventListener('touchcancel', cancel, { passive: true });
        this.removeTouchListeners = () => {
            target.removeEventListener('touchmove', move as EventListener);
            target.removeEventListener('touchend', end);
            target.removeEventListener('touchcancel', cancel);
        };
    }

    private onTouchMove(event: TouchEvent): void {
        const gesture = this.touchGesture;
        if (!gesture) {
            return;
        }
        if (event.touches.length !== 1 || event.defaultPrevented || !event.cancelable || this.isBlocked()) {
            this.clearTouchGesture();
            return;
        }
        const point = event.touches[0];
        if (point.identifier !== gesture.id) {
            return;
        }
        const x = gesture.startX - point.clientX;
        const y = gesture.startY - point.clientY;
        const axis = gesture.axis ?? this.dominantAxis(x, y);
        if (!gesture.ownsScroll) {
            if (x === 0 && y === 0) {
                return;
            }
            if (!this.canScroll(axis, axis === 'x' ? x : y)) {
                this.clearTouchGesture();
                return;
            }
            // Native scrolling cannot reliably resume after a move has been cancelled.
            gesture.ownsScroll = true;
        }
        event.preventDefault();
        if (point.clientX === gesture.x && point.clientY === gesture.y) {
            return;
        }
        if (!gesture.axis && Math.max(Math.abs(x), Math.abs(y)) < TOUCH_THRESHOLD) {
            return;
        }
        const delta = axis === 'x' ? gesture.x - point.clientX : gesture.y - point.clientY;
        const win = _getWindow(this.beans);
        const time = win.performance.now();
        const { remainder, canContinue } = this.applyScrollDelta(axis, delta, gesture.remainder);
        gesture.remainder = remainder;
        const position = axis === 'x' ? x : y;
        if (canContinue) {
            this.updateTouchVelocity(gesture, position, delta, time);
        } else {
            gesture.velocity = 0;
            gesture.velocitySamples = [{ position, time }];
        }
        gesture.axis = axis;
        gesture.x = point.clientX;
        gesture.y = point.clientY;
        gesture.time = time;
    }

    private updateTouchVelocity(gesture: TouchGesture, position: number, delta: number, time: number): void {
        const samples = gesture.velocitySamples;
        const cutoff = time - RELEASE_WINDOW;
        if (delta * gesture.velocity < 0 || gesture.time < cutoff) {
            // Start a fresh movement interval after a reversal or an idle gap.
            samples.length = 0;
            gesture.velocity = 0;
            samples.push({ position: position - delta, time: Math.max(gesture.time, cutoff) });
        }
        if (samples.at(-1)?.time === time) {
            samples.pop();
        }
        samples.push({ position, time });
        while (samples.length > 2 && samples[1].time <= cutoff) {
            samples.shift();
        }
        const sample = samples[0];
        if (sample.time < cutoff) {
            const next = samples[1];
            sample.position += ((next.position - sample.position) * (cutoff - sample.time)) / (next.time - sample.time);
            sample.time = cutoff;
        }
        const elapsed = time - sample.time;
        if (elapsed > 0) {
            // Estimate finger speed independently of rounded DOM scroll positions.
            gesture.velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, (position - sample.position) / elapsed));
        }
    }

    private onTouchEnd(): void {
        const gesture = this.touchGesture;
        this.clearTouchGesture();
        if (!gesture?.axis) {
            return;
        }
        const win = _getWindow(this.beans);
        if (win.performance.now() - gesture.time < RELEASE_WINDOW) {
            this.startMomentum(gesture.axis, gesture.velocity, win);
        }
    }

    private clearTouchGesture(): void {
        this.touchGesture = null;
        this.removeTouchListeners?.();
        this.removeTouchListeners = null;
    }

    private dominantAxis(x: number, y: number): Axis {
        return Math.abs(x) > Math.abs(y) ? 'x' : 'y';
    }

    private canScroll(axis: Axis, delta: number): boolean {
        const viewport = this.viewport;
        const horizontal = axis === 'x';
        const position = horizontal ? Math.abs(viewport.scrollLeft) : viewport.scrollTop;
        const limit = horizontal
            ? viewport.scrollWidth - viewport.clientWidth
            : viewport.scrollHeight - viewport.clientHeight;
        const direction = horizontal && this.gos.get('enableRtl') ? -delta : delta;
        return direction < 0 ? position > 0 : direction > 0 && position < limit;
    }

    private applyScrollDelta(axis: Axis, delta: number, remainder = 0): { remainder: number; canContinue: boolean } {
        const requested = delta + remainder;
        const unapplied = requested - this.scrollBy(axis, requested);
        const canContinue = this.canScroll(axis, delta);
        // Retain subpixel rounding, but discard movement clamped at a boundary.
        return { remainder: canContinue && Math.abs(unapplied) < 1 ? unapplied : 0, canContinue };
    }

    private scrollBy(axis: Axis, delta: number): number {
        if (axis === 'x') {
            const sign = this.gos.get('enableRtl') ? -1 : 1;
            return this.scrollFeature.scrollHorizontally(delta * sign) * sign;
        }
        const viewport = this.viewport;
        const previous = viewport.scrollTop;
        this.scrollFeature.setVerticalScrollPosition(previous + delta);
        return viewport.scrollTop - previous;
    }

    private startMomentum(axis: Axis, velocity: number, win: Window): void {
        if (Math.abs(velocity) < MIN_VELOCITY) {
            return;
        }
        let previous = win.performance.now();
        let remainder = 0;
        const step = (time: number) => {
            this.momentumFrame = null;
            if (!this.isAlive() || !this.viewport.isConnected || !this.viewport.clientHeight || this.isBlocked()) {
                return;
            }
            const elapsed = time - previous;
            previous = time;
            const decay = Math.exp(-elapsed / MOMENTUM_DECAY);
            const delta = velocity * MOMENTUM_DECAY * (1 - decay) + remainder;
            velocity *= decay;
            const applied = this.scrollBy(axis, delta);
            // WebKit can round an individual frame to zero before the momentum has finished.
            remainder = delta - applied;
            if (Math.abs(velocity) >= MIN_VELOCITY && this.canScroll(axis, velocity)) {
                this.momentumFrame = { window: win, id: win.requestAnimationFrame(step) };
            }
        };
        this.momentumFrame = { window: win, id: win.requestAnimationFrame(step) };
    }

    private stopMomentum(): void {
        const frame = this.momentumFrame;
        if (frame != null) {
            frame.window.cancelAnimationFrame(frame.id);
            this.momentumFrame = null;
        }
    }
}
