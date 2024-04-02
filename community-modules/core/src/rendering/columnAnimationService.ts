import { Autowired, Bean, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { GridBodyCtrl } from "../gridBodyComp/gridBodyCtrl";
import { CtrlsService } from "../ctrlsService";

@Bean('columnAnimationService')
export class ColumnAnimationService extends BeanStub {

    @Autowired('ctrlsService') private ctrlsService: CtrlsService;

    private gridBodyCtrl: GridBodyCtrl;

    private executeNextFuncs: Function[] = [];
    private executeLaterFuncs: Function[] = [];

    private active = false;
    private suppressAnimation = false;

    private animationThreadCount = 0;

    @PostConstruct
    private postConstruct(): void {
        this.ctrlsService.whenReady(p => this.gridBodyCtrl = p.gridBodyCtrl);
    }

    public isActive(): boolean {
        return this.active && !this.suppressAnimation;
    }

    public setSuppressAnimation(suppress: boolean): void {
        this.suppressAnimation = suppress;
    }

    public start(): void {
        if (this.active) { return; }

        if (this.gos.get('suppressColumnMoveAnimation')) { return; }

        // if doing RTL, we don't animate open / close as due to how the pixels are inverted,
        // the animation moves all the row the the right rather than to the left (ie it's the static
        // columns that actually get their coordinates updated)
        if (this.gos.get('enableRtl')) { return; }

        this.ensureAnimationCssClassPresent();

        this.active = true;
    }

    public finish(): void {
        if (!this.active) { return; }
        this.flush(() => { this.active = false });
    }

    public executeNextVMTurn(func: Function): void {
        if (this.active) {
            this.executeNextFuncs.push(func);
        } else {
            func();
        }
    }

    public executeLaterVMTurn(func: Function): void {
        if (this.active) {
            this.executeLaterFuncs.push(func);
        } else {
            func();
        }
    }

    private ensureAnimationCssClassPresent(): void {
        // up the count, so we can tell if someone else has updated the count
        // by the time the 'wait' func executes
        this.animationThreadCount++;
        const animationThreadCountCopy = this.animationThreadCount;
        this.gridBodyCtrl.setColumnMovingCss(true);

        this.executeLaterFuncs.push(() => {
            // only remove the class if this thread was the last one to update it
            if (this.animationThreadCount === animationThreadCountCopy) {
                this.gridBodyCtrl.setColumnMovingCss(false);
            }
        });
    }

    private flush(callback: () => void): void {
        if (this.executeNextFuncs.length === 0 && this.executeLaterFuncs.length === 0) { 
            callback();
            return; 
        }

        const runFuncs = (queue: Function[]) => {
            while (queue.length) {
                const func = queue.pop();
                if (func) { func(); }
            }
        }

        this.getFrameworkOverrides().wrapIncoming(() => {
            window.setTimeout(() => runFuncs(this.executeNextFuncs), 0);
            window.setTimeout(() => {
                runFuncs(this.executeLaterFuncs);
                callback();
            }, 200);
        });
    }
}
