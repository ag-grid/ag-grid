
import {Autowired, Bean, PostConstruct} from "../context/context";
import {GridPanel} from "../gridPanel/gridPanel";
import {LinkedList} from "./linkedList";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

@Bean('animationFrameService')
export class AnimationFrameService {

    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private p1Tasks = new LinkedList<()=>void>();
    private p2Tasks = new LinkedList<()=>void>();
    private ticking = false;

    private useAnimationFrame: boolean;

    @PostConstruct
    private init(): void {
        this.useAnimationFrame = !this.gridOptionsWrapper.isSuppressAnimationFrame();
    }

    // this method is for our ag-Grid sanity only - if animation frames are turned off,
    // then no place in the code should be looking to add any work to be done in animation
    // frames. this stops bugs - where some code is asking for a frame to be executed
    // when it should not.
    private verifyAnimationFrameOn(methodName: string): void {
        if (this.useAnimationFrame===false) {
            console.warn(`ag-Grid: AnimationFrameService.${methodName} called but animation frames are off`);
        }
    }

    public addP1Task(task: ()=>void): void {
        this.verifyAnimationFrameOn('addP1Task');
        this.p1Tasks.add(task);
        this.schedule();
    }

    public addP2Task(task: ()=>void): void {
        this.verifyAnimationFrameOn('addP2Task');
        this.p2Tasks.add(task);
        this.schedule();
    }

    private executeFrame(millis: number): void {
        this.verifyAnimationFrameOn('executeFrame');

        let frameStart = new Date().getTime();

        let duration = (new Date().getTime()) - frameStart;

        let gridPanelNeedsAFrame = true;

        // 16ms is 60 fps
        let noMaxMillis = millis <= 0;
        while (noMaxMillis || duration < millis) {
            if (gridPanelNeedsAFrame) {
                gridPanelNeedsAFrame = this.gridPanel.executeFrame();
            } else if (!this.p1Tasks.isEmpty()) {
                let task = this.p1Tasks.remove();
                task();
            } else if (!this.p2Tasks.isEmpty()) {
                let task = this.p2Tasks.remove();
                task();
            } else {
                break;
            }
            duration = (new Date().getTime()) - frameStart;
        }

        if (gridPanelNeedsAFrame || !this.p1Tasks.isEmpty() || !this.p2Tasks.isEmpty()) {
            this.requestFrame();
        } else {
            this.ticking = false;
        }
    }

    public flushAllFrames(): void {
        if (!this.useAnimationFrame) { return; }
        this.executeFrame(-1);
    }

    public schedule(): void {
        if (!this.useAnimationFrame) { return; }
        if (!this.ticking) {
            this.ticking = true;
            this.requestFrame();
        }
    }

    private requestFrame(): void {
        // check for the existence of requestAnimationFrame, and if
        // it's missing, then we polyfill it with setTimeout()
        let callback = this.executeFrame.bind(this, 60);
        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(callback);
        } else if (window.webkitRequestAnimationFrame) {
            window.webkitRequestAnimationFrame(callback);
        } else {
            setTimeout(callback, 0);
        }
    }
}
