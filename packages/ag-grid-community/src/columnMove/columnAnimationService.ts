import { _getWindow } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { GridBodyCtrl } from '../gridBodyComp/gridBodyCtrl';

const CSS_CLASS_COLUMN_MOVING = 'ag-column-moving';
const CSS_CLASS_COLUMN_WIDTH_ANIMATION = 'ag-animate-autosize';
/** The 0.2s width transition plus a few frames, as a transition starts at the first style recalc after the writes. */
const COLUMN_WIDTH_ANIMATION_MS = 250;

export class ColumnAnimationService extends BeanStub implements NamedBean {
    beanName = 'colAnimation' as const;

    private readonly executeNextFuncs: ((...args: any[]) => any)[] = [];
    private readonly executeLaterFuncs: ((...args: any[]) => any)[] = [];

    private active = false;
    /** The timers ending the window in flight, 0 when none: a window joining it ends with them. */
    private nextTimer = 0;
    private laterTimer = 0;
    /** Cleared a VM-turn earlier than {@link active} (once `executeNextFuncs` has flushed) so a late
     *  {@link executeNextVMTurn} runs immediately instead of queuing behind an already-flushed batch. */
    private activeNext = false;
    /** Set by {@link setSuppressAnimation} while a state restore applies: nothing slides, no width animates. */
    private suppressAnimation = false;
    /** Whether the queued funcs running now had the styles computed: once serves every cell they move. */
    private stylesComputed = false;

    /** `visibleCols.layoutChangeVersion` as the window opened. */
    private openLayoutChangeVersion = 0;

    /** The timer ending the width transition in flight, 0 when none. */
    private widthAnimationTimeout = 0;
    /** `visibleCols.layoutChangeVersion` as the width window opened. */
    private widthAnimationLayoutVersion = 0;
    /** Whether the open column update holds the width animation window. */
    private widthAnimationOpen = false;
    /** Whether the grid body holds the width animation class. */
    private widthAnimationCss = false;
    /** The displayed order as the width window opened, when a reorder must drop its transition. */
    private orderBeforeWidthAnimation: AgColumn[] | null = null;

    public postConstruct(): void {
        this.addManagedPropertyListener('suppressColumnMoveAnimation', (event) => {
            if (!event.currentValue) {
                return;
            }
            this.endNow(); // a change made next applies at once
        });
        this.addManagedPropertyListener('animateColumnResizing', (event) => {
            if (event.currentValue) {
                return;
            }
            this.cancelWidthAnimation(); // a width set next applies at once
        });
    }

    public override destroy(): void {
        window.clearTimeout(this.nextTimer);
        window.clearTimeout(this.laterTimer);
        window.clearTimeout(this.widthAnimationTimeout);
        super.destroy();
    }

    public isActive(): boolean {
        return this.active && !this.suppressAnimation;
    }

    public setSuppressAnimation(suppress: boolean): void {
        this.suppressAnimation = suppress;
    }

    /** Call inside a column update: the columns its layouts move slide, in one window its outermost end closes. */
    public start(): void {
        const gos = this.gos;
        if (this.suppressAnimation || gos.get('suppressColumnMoveAnimation')) {
            this.endNow(); // a window still open from an earlier change would slide this one
            return;
        }
        const gridBodyCtrl = this.getGridBodyCtrl();
        if (this.active || !gridBodyCtrl) {
            return;
        }

        gridBodyCtrl.setColumnAnimationCss(CSS_CLASS_COLUMN_MOVING, true);

        this.active = true;
        this.activeNext = true;
        this.openLayoutChangeVersion = this.beans.visibleCols.layoutChangeVersion;
    }

    /** Closes the windows the ended column update opened, the width one first, flushing the queued next/later funcs. */
    public finish(): void {
        this.finishWidthAnimation();
        // a window an earlier update left sliding has moved its columns, so it ends on its own timers
        if (!this.active) {
            return;
        }
        if (this.beans.visibleCols.layoutChangeVersion === this.openLayoutChangeVersion) {
            this.endNow(); // nothing moved, so the window ends as if it never opened (no timer is set)
            return;
        }
        this.flush();
    }

    /** Call inside a column update: the widths and positions its layouts change animate until its outermost end. */
    public startWidthAnimation(): void {
        const gos = this.gos;
        if (this.widthAnimationOpen || !gos.get('animateColumnResizing') || gos.get('enableRtl')) {
            return;
        }
        if (this.suppressAnimation) {
            this.cancelWidthAnimation(); // a state restore's widths apply at once, an earlier change's window too
            return;
        }
        const visibleCols = this.beans.visibleCols;
        this.widthAnimationOpen = true;
        // the transition slides cells too, so a reorder drops the window when column moves do not animate
        this.orderBeforeWidthAnimation = gos.get('suppressColumnMoveAnimation') ? visibleCols.allCols : null;
        this.widthAnimationLayoutVersion = visibleCols.layoutChangeVersion;
        this.setWidthAnimationCss(true);
    }

    /** Closes the width window the ended column update opened; one that reordered its columns ends at once. */
    private finishWidthAnimation(): void {
        if (!this.widthAnimationOpen) {
            return;
        }
        this.widthAnimationOpen = false;
        const orderBefore = this.orderBeforeWidthAnimation;
        this.orderBeforeWidthAnimation = null;
        const visibleCols = this.beans.visibleCols;
        // the same array is the same order: the layout keeps it while the displayed columns match
        if (orderBefore !== null && orderBefore !== visibleCols.allCols && hasReordered(orderBefore)) {
            // before any style recalc sees the class, so nothing laid out since animates
            this.cancelWidthAnimation();
            return;
        }
        if (!this.widthAnimationCss) {
            return; // cancelled since (a resize by hand): no transition to end
        }
        if (visibleCols.layoutChangeVersion === this.widthAnimationLayoutVersion) {
            // nothing moved or resized: a running transition keeps its own end, else none needs the class
            if (this.widthAnimationTimeout === 0) {
                this.cancelWidthAnimation();
            }
            return;
        }
        window.clearTimeout(this.widthAnimationTimeout);
        // The class must outlive the width writes: a transition only starts if a style recalc sees it.
        this.widthAnimationTimeout = window.setTimeout(() => {
            this.widthAnimationTimeout = 0;
            this.setWidthAnimationCss(false);
        }, COLUMN_WIDTH_ANIMATION_MS);
    }

    /** Ends any open or lingering width window so widths written next apply immediately. */
    public cancelWidthAnimation(): void {
        if (!this.widthAnimationCss) {
            return; // off, so no timer runs: the timer is set only while the class is on
        }
        window.clearTimeout(this.widthAnimationTimeout);
        this.widthAnimationTimeout = 0;
        this.setWidthAnimationCss(false);
    }

    private setWidthAnimationCss(on: boolean): void {
        this.widthAnimationCss = on;
        this.getGridBodyCtrl()?.setColumnAnimationCss(CSS_CLASS_COLUMN_WIDTH_ANIMATION, on);
    }

    /** Read each time: a framework re-creating the grid body registers a new one. */
    private getGridBodyCtrl(): GridBodyCtrl | undefined {
        const ctrlsSvc = this.beans.ctrlsSvc;
        return ctrlsSvc.isAlive() ? ctrlsSvc.get('gridBodyCtrl') : undefined;
    }

    public executeNextVMTurn(func: (...args: any[]) => any): void {
        if (this.activeNext) {
            this.executeNextFuncs.push(func);
        } else {
            this.stylesComputed = false;
            func();
        }
    }

    /** Computes the styles written before {@link executeNextVMTurn}'s funcs ran: a cell they move slides from them. */
    public computeStyles(eGui: HTMLElement): void {
        this.stylesComputed ||= _getWindow(this.beans).getComputedStyle(eGui).left !== undefined;
    }

    private runNextFuncs(): void {
        this.stylesComputed = false;
        runFuncs(this.executeNextFuncs);
    }

    public executeLaterVMTurn(func: (...args: any[]) => any): void {
        if (this.active) {
            this.executeLaterFuncs.push(func);
        } else {
            func();
        }
    }

    /** Ends the open window at once, running what it queued. */
    private endNow(): void {
        if (!this.active) {
            return;
        }
        window.clearTimeout(this.nextTimer);
        window.clearTimeout(this.laterTimer);
        this.nextTimer = 0;
        this.laterTimer = 0;
        this.activeNext = false;
        this.active = false;
        this.runNextFuncs();
        runFuncs(this.executeLaterFuncs);
        this.getGridBodyCtrl()?.setColumnAnimationCss(CSS_CLASS_COLUMN_MOVING, false);
    }

    private flush(): void {
        if (this.laterTimer !== 0) {
            return; // joined a window already ending: what this one queued ends with it
        }
        const executeLaterFuncs = this.executeLaterFuncs;
        this.beans.frameworkOverrides.wrapIncoming(() => {
            this.nextTimer = window.setTimeout(() => {
                this.nextTimer = 0;
                this.activeNext = false;
                this.runNextFuncs();
            }, 0);
            this.laterTimer = window.setTimeout(() => {
                this.laterTimer = 0;
                // Clear `active` before the later funcs run — some of them check it.
                this.active = false;
                runFuncs(executeLaterFuncs);
                this.getGridBodyCtrl()?.setColumnAnimationCss(CSS_CLASS_COLUMN_MOVING, false);
            }, 200);
        });
    }
}

/** Whether the columns of `before` still displayed changed their relative order. */
function hasReordered(before: AgColumn[]): boolean {
    // `allColsIndex` is a column's place in the displayed order now, -1 once it left it
    let last = -1;
    for (let i = 0, len = before.length; i < len; ++i) {
        const index = before[i].allColsIndex;
        if (index < 0) {
            continue;
        }
        if (index < last) {
            return true;
        }
        last = index;
    }
    return false;
}

/** Drain a queue, running each func (LIFO); captures nothing, so it's shared rather than re-allocated per flush. */
const runFuncs = (queue: ((...args: any[]) => any)[]): void => {
    while (queue.length) {
        const func = queue.pop();
        if (func) {
            func();
        }
    }
};
