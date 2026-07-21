import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { GridBodyCtrl } from '../gridBodyComp/gridBodyCtrl';

export class ColumnAnimationService extends BeanStub implements NamedBean {
    beanName = 'colAnimation' as const;

    private gridBodyCtrl: GridBodyCtrl | undefined;

    private readonly executeNextFuncs: ((...args: any[]) => any)[] = [];
    private readonly executeLaterFuncs: ((...args: any[]) => any)[] = [];

    private active = false;
    /** Cleared a VM-turn earlier than {@link active} (once `executeNextFuncs` has flushed) so a late
     *  {@link executeNextVMTurn} runs immediately instead of queuing behind an already-flushed batch. */
    private activeNext = false;
    private suppressAnimation = false;

    private animationThreadCount = 0;
    /** Nesting depth: only the outermost {@link start}/{@link finish} pair drives the animation, so a wrapped
     *  refresh (e.g. a role-col flush re-entering via pivot-sort) can't end it early. */
    private startDepth = 0;

    public postConstruct(): void {
        this.beans.ctrlsSvc.whenReady(this, (p) => (this.gridBodyCtrl = p.gridBodyCtrl));
    }

    public isActive(): boolean {
        return this.active && !this.suppressAnimation;
    }

    public setSuppressAnimation(suppress: boolean): void {
        this.suppressAnimation = suppress;
    }

    /** Open an animation window; nestable — only the outermost open actually starts the animation. */
    public start(): void {
        this.startDepth++;
        if (this.active) {
            return;
        }

        const { gos, gridBodyCtrl } = this;
        if (!gridBodyCtrl || gos.get('suppressColumnMoveAnimation')) {
            return;
        }

        this.ensureAnimationCssClassPresent(gridBodyCtrl);

        this.active = true;
        this.activeNext = true;
    }

    /** Close an animation window; the outermost close flushes the queued next/later funcs. */
    public finish(): void {
        // Only the outermost close (depth back to 0) flushes; nested closes and unbalanced calls no-op.
        const depth = Math.max(0, this.startDepth - 1);
        this.startDepth = depth;
        if (depth > 0 || !this.active) {
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

    private flush(): void {
        const { executeNextFuncs, executeLaterFuncs } = this;
        if (executeNextFuncs.length === 0 && executeLaterFuncs.length === 0) {
            this.activeNext = false;
            this.active = false;
            return;
        }

        this.beans.frameworkOverrides.wrapIncoming(() => {
            window.setTimeout(() => {
                this.activeNext = false;
                runFuncs(executeNextFuncs);
            }, 0);
            window.setTimeout(() => {
                // Clear `active` before the later funcs run — some of them check it.
                this.active = false;
                runFuncs(executeLaterFuncs);
            }, 200);
        });
    }
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
