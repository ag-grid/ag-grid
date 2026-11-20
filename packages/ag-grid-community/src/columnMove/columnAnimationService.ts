import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { GridBodyCtrl } from '../gridBodyComp/gridBodyCtrl';

/** Matches the 0.2s `left`/`right` transitions in column-moving.css and the legacy themes. */
const COLUMN_MOVE_ANIMATION_MS = 200;

export class ColumnAnimationService extends BeanStub implements NamedBean {
    beanName = 'colAnimation' as const;

    private gridBodyCtrl: GridBodyCtrl | undefined;

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
    public suppressAnimation = false;

    private animationThreadCount = 0;
    /** `visibleCols.layoutChangeVersion` as the window opened. */
    private openLayoutChangeVersion = 0;

    public postConstruct(): void {
        this.beans.ctrlsSvc.whenReady(this, (p) => (this.gridBodyCtrl = p.gridBodyCtrl));
        this.addManagedPropertyListener('suppressColumnMoveAnimation', (event) => {
            if (!event.currentValue) {
                return;
            }
            this.endNow(); // a change made next applies at once
        });
    }

    public override destroy(): void {
        window.clearTimeout(this.nextTimer);
        window.clearTimeout(this.laterTimer);
        super.destroy();
    }

    public setSuppressAnimation(suppress: boolean): void {
        this.suppressAnimation = suppress;
    }

    public isActive(): boolean {
        return this.active && !this.suppressAnimation;
    }

    /** Opens an animation window; the column model opens one per column update ({@link finish} closes it). */
    public start(): void {
        if (this.suppressAnimation || this.gos.get('suppressColumnMoveAnimation')) {
            this.endNow(); // a window still open from an earlier change would slide this one
            return;
        }
        const gridBodyCtrl = this.gridBodyCtrl;
        if (this.active || !gridBodyCtrl) {
            return;
        }

        this.ensureAnimationCssClassPresent(gridBodyCtrl);

        this.active = true;
        this.activeNext = true;
        this.openLayoutChangeVersion = this.beans.visibleCols.layoutChangeVersion;
    }

    /** Closes the animation window, flushing the queued next/later funcs. */
    public finish(): void {
        if (!this.active) {
            return;
        }
        if (this.beans.visibleCols.layoutChangeVersion === this.openLayoutChangeVersion) {
            // nothing moved, so the window ends as if it never opened
            this.active = false;
            this.activeNext = false;
            runFuncs(this.executeNextFuncs);
            runFuncs(this.executeLaterFuncs);
            return;
        }
        this.flush();
    }

    public executeNextVMTurn(func: (...args: any[]) => any): void {
        if (this.activeNext) {
            this.executeNextFuncs.push(func);
        } else {
            func();
        }
    }

    public executeLaterVMTurn(func: (...args: any[]) => any): void {
        if (this.active) {
            this.executeLaterFuncs.push(func);
        } else {
            func();
        }
    }

    private ensureAnimationCssClassPresent(gridBodyCtrl: GridBodyCtrl): void {
        // up the count, so we can tell if someone else has updated the count
        // by the time the 'wait' func executes
        this.animationThreadCount++;
        const animationThreadCountCopy = this.animationThreadCount;
        gridBodyCtrl.setColumnMovingCss(true);

        this.executeLaterFuncs.push(() => {
            // only remove the class if this thread was the last one to update it
            if (this.animationThreadCount === animationThreadCountCopy) {
                gridBodyCtrl.setColumnMovingCss(false);
            }
        });
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
        runFuncs(this.executeNextFuncs);
        runFuncs(this.executeLaterFuncs);
    }

    private flush(): void {
        if (this.laterTimer !== 0) {
            return; // joined a window already ending: what this one queued ends with it
        }
        if (this.executeNextFuncs.length === 0 && this.executeLaterFuncs.length === 0) {
            this.activeNext = false;
            this.active = false;
            return;
        }
        this.beans.frameworkOverrides.wrapIncoming(this.startTimers);
    }

    private readonly startTimers = (): void => {
        this.nextTimer = window.setTimeout(this.onNextTimer, 0);
        this.laterTimer = window.setTimeout(this.onLaterTimer, COLUMN_MOVE_ANIMATION_MS);
    };

    private readonly onNextTimer = (): void => {
        this.nextTimer = 0;
        this.activeNext = false;
        runFuncs(this.executeNextFuncs);
    };

    private readonly onLaterTimer = (): void => {
        this.laterTimer = 0;
        // Clear `active` before the later funcs run — some of them check it.
        this.active = false;
        runFuncs(this.executeLaterFuncs);
    };
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
