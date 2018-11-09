
import {Autowired, Bean, PostConstruct} from "../context/context";
import {GridPanel} from "../gridPanel/gridPanel";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {AnimationQueueEmptyEvent} from "../events";
import {Events} from "../eventKeys";
import {EventService} from "../eventService";

interface TaskItem {
    task: ()=>void;
    index: number;
}

@Bean('animationFrameService')
export class AnimationFrameService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;

    private gridPanel: GridPanel;

    // p1 tasks are to do with row creation. for them we want to execute according to row order, so we use
    // TaskItem so we know what index the item is for.
    private p1Tasks: TaskItem[] = [];
    // p2 tasks are to do with row removal. they are done after row creation as the user will need to see new
    // rows first (as blank is scrolled into view), when we remove the old rows (no longer in view) is not as
    // important.
    private p2Tasks: (()=>void)[] = [];
    private ticking = false;

    private useAnimationFrame: boolean;

    private scrollGoingDown = true;
    private lastScrollTop = 0;

    public setScrollTop(scrollTop: number): void {
        this.scrollGoingDown = scrollTop > this.lastScrollTop;
        this.lastScrollTop = scrollTop;
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
    }

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

    public addP1Task(task: ()=>void, index: number): void {
        this.verifyAnimationFrameOn('addP1Task');
        let taskItem: TaskItem = {task: task, index: index};
        this.p1Tasks.push(taskItem);
        this.schedule();
    }

    public addP2Task(task: ()=>void): void {
        this.verifyAnimationFrameOn('addP2Task');
        this.p2Tasks.push(task);
        this.schedule();
    }

    private executeFrame(millis: number): void {
        this.verifyAnimationFrameOn('executeFrame');

        if (this.scrollGoingDown) {
            this.p1Tasks.sort( (a: TaskItem, b: TaskItem) => b.index - a.index);
        } else {
            this.p1Tasks.sort( (a: TaskItem, b: TaskItem) => a.index - b.index);
        }

        let frameStart = new Date().getTime();

        let duration = (new Date().getTime()) - frameStart;

        // 16ms is 60 fps
        let noMaxMillis = millis <= 0;
        while (noMaxMillis || duration < millis) {
            if (this.p1Tasks.length>0) {
                let taskItem = this.p1Tasks.pop();
                taskItem.task();
            } else if (this.p2Tasks.length>0) {
                let task = this.p2Tasks.pop();
                task();
            } else {
                break;
            }
            duration = (new Date().getTime()) - frameStart;
        }

        if (this.p1Tasks.length>0 || this.p2Tasks.length>0) {
            this.requestFrame();
        } else {
            this.stopTicking();
        }
    }

    private stopTicking(): void {
        this.ticking = false;
        let event: AnimationQueueEmptyEvent = {
            type: Events.EVENT_ANIMATION_QUEUE_EMPTY,
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            api: this.gridOptionsWrapper.getApi()
        };
        this.eventService.dispatchEvent(event);
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

    public isQueueEmpty(): boolean {
        return this.ticking;
    }


}
