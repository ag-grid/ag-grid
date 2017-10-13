
import {Autowired, Bean} from "../context/context";
import {GridPanel} from "../gridPanel/gridPanel";
import {LinkedList} from "./linkedList";

@Bean('animationFrameService')
export class AnimationFrameService {

    @Autowired('gridPanel') private gridPanel: GridPanel;

    private p1Tasks = new LinkedList<()=>void>();
    private p2Tasks = new LinkedList<()=>void>();
    private ticking = false;

    public addP1Task(task: ()=>void): void {
        this.p1Tasks.add(task);
        this.schedule();
    }

    public addP2Task(task: ()=>void): void {
        this.p2Tasks.add(task);
        this.schedule();
    }

    private executeFrame(millis: number): void {

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
        this.executeFrame(-1);
    }

    public schedule(): void {
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
