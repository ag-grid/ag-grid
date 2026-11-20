import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { LongTapEvent } from '../widgets/touchListener';
import { TouchListener } from '../widgets/touchListener';

const COMPATIBILITY_MOUSE_EVENT_WINDOW_MS = 800;

interface TooltipTouchTarget {
    element: HTMLElement;
    canShow: () => boolean;
    show: (touchStart: Touch) => void;
    active: boolean;
}

export class TooltipTouchCoordinator extends BeanStub implements NamedBean {
    beanName = 'tooltipTouchSvc' as const;

    private readonly targets = new Map<HTMLElement, TooltipTouchTarget[]>();
    private touchCandidates: TooltipTouchTarget[] = [];
    private selectedTarget: TooltipTouchTarget | undefined;
    private lastTouchEventTime = 0;
    private lastTouchPath: EventTarget[] | undefined;

    public postConstruct(): void {
        const doc = this.beans.eRootDiv.ownerDocument;
        const touchListener = new TouchListener(doc, {
            capture: true,
            // Tooltips must not steal the long press from context menu / column menu listeners.
            yieldsLongTap: true,
            shouldTrackTouch: (event) => this.startTracking(event),
            getLongTapTarget: () => this.resolveLongTapTarget(),
        });
        touchListener.addEventListener('longTap', ({ touchStart }: LongTapEvent) => {
            const target = this.selectedTarget;
            this.selectedTarget = undefined;
            if (target?.active) {
                target.show(touchStart);
            }
        });

        const recordTouch = (event: TouchEvent) => {
            if (!this.gos.get('suppressTouch') && this.getCandidates(event).length) {
                this.recordTouchAt(event);
            }
        };
        const options = { capture: true, passive: true };
        doc.addEventListener('touchend', recordTouch, options);
        doc.addEventListener('touchcancel', recordTouch, options);
        this.addDestroyFunc(() => {
            touchListener.destroy();
            doc.removeEventListener('touchend', recordTouch, true);
            doc.removeEventListener('touchcancel', recordTouch, true);
        });
    }

    public registerSource(element: HTMLElement, canShow: () => boolean, show: (touchStart: Touch) => void): () => void {
        const target: TooltipTouchTarget = { element, canShow, show, active: true };
        const existing = this.targets.get(element);
        if (existing) {
            existing.push(target);
        } else {
            this.targets.set(element, [target]);
        }

        return () => this.unregisterSource(target);
    }

    /**
     * Whether a mouse event on the given element is the compatibility event synthesised for a recent
     * touch. Scoped to the touched element so a real mouse hover elsewhere on a hybrid device still shows.
     */
    public isCompatibilityMouseEvent(sourceElement: HTMLElement): boolean {
        const path = this.lastTouchPath;
        if (!path || Date.now() - this.lastTouchEventTime >= COMPATIBILITY_MOUSE_EVENT_WINDOW_MS) {
            return false;
        }
        const target = path[0];
        return path.includes(sourceElement) || (target instanceof Node && target.contains(sourceElement));
    }

    private recordTouchAt(event: Event): void {
        this.lastTouchEventTime = Date.now();
        this.lastTouchPath = event.composedPath();
    }

    private startTracking(event: TouchEvent): boolean {
        this.selectedTarget = undefined;
        if (this.gos.get('suppressTouch')) {
            return false;
        }
        // composedPath is only available during dispatch, not when the long-press timer runs.
        this.touchCandidates = this.getCandidates(event);
        const hasTarget = this.touchCandidates.length > 0;
        if (hasTarget) {
            this.recordTouchAt(event);
        }
        return hasTarget;
    }

    private resolveLongTapTarget(): Element | undefined {
        for (const target of this.touchCandidates) {
            if (target.active && target.canShow()) {
                this.selectedTarget = target;
                return target.element;
            }
        }
        this.selectedTarget = undefined;
        return undefined;
    }

    private getCandidates(event: Event): TooltipTouchTarget[] {
        const path = event.composedPath();
        // Use the original element, not the shadow host exposed to the document listener.
        if (!this.beans.environment.isElementInThisInstance(path[0] as HTMLElement)) {
            return [];
        }
        const candidates: TooltipTouchTarget[] = [];
        for (const item of path) {
            const targets = this.targets.get(item as HTMLElement);
            if (!targets) {
                continue;
            }
            for (let i = targets.length - 1; i >= 0; i--) {
                if (targets[i].active) {
                    candidates.push(targets[i]);
                }
            }
        }
        return candidates;
    }

    private unregisterSource(target: TooltipTouchTarget): void {
        target.active = false;
        const targets = this.targets.get(target.element);
        if (!targets) {
            return;
        }
        const index = targets.indexOf(target);
        if (index >= 0) {
            targets.splice(index, 1);
        }
        if (targets.length === 0) {
            this.targets.delete(target.element);
        }
    }

    public override destroy(): void {
        this.targets.clear();
        this.touchCandidates = [];
        this.selectedTarget = undefined;
        this.lastTouchPath = undefined;
        super.destroy();
    }
}
