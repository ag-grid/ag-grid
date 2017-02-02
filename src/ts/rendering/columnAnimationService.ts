import {Bean, Autowired} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {GridPanel} from "../gridPanel/gridPanel";
import {Utils as _} from "../utils";

@Bean('columnAnimationService')
export class ColumnAnimationService {

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridPanel') gridPanel: GridPanel;

    private executeNextFuncs: Function[] = [];
    private executeLaterFuncs: Function[] = [];

    private active = false;

    private animationThreadCount = 0;

    public isActive(): boolean {
        return this.active;
    }

    public start(): void {
        if (this.active) { return; }

        if (this.gridOptionsWrapper.isSuppressColumnMoveAnimation()) { return; }

        // if doing RTL, we don't animate open / close as due to how the pixels are inverted,
        // the animation moves all the row the the right rather than to the left (ie it's the static
        // columns that actually get their coordinates updated)
        if (this.gridOptionsWrapper.isEnableRtl()) { return; }

        this.ensureAnimationCssClassPresent();

        this.active = true;
    }

    public finish(): void {
        if (!this.active) { return; }
        this.flush();
        this.active = false;
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
        var animationThreadCountCopy = this.animationThreadCount;
        _.addCssClass(this.gridPanel.getRoot(), 'ag-column-moving');

        this.executeLaterFuncs.push(()=> {
            // only remove the class if this thread was the last one to update it
            if (this.animationThreadCount===animationThreadCountCopy) {
                _.removeCssClass(this.gridPanel.getRoot(), 'ag-column-moving');
            }
        });
    }

    public flush(): void {

        let nowFuncs = this.executeNextFuncs;
        this.executeNextFuncs = [];

        let waitFuncs = this.executeLaterFuncs;
        this.executeLaterFuncs = [];

        if (nowFuncs.length===0 && waitFuncs.length===0) { return; }

        setTimeout( ()=> nowFuncs.forEach( func => func() ), 0 );
        setTimeout( ()=> waitFuncs.forEach( func => func() ), 300 );
    }
}