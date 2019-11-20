interface TaskItem {
    task: () => void;
    index: number;
}

interface TaskList {
    list: TaskItem[];
    sorted: boolean;
}

export class AnimationFrameService {
    private task: any = null;

    private ticking = false;
    private useAnimationFrame: boolean = true;

    private init(): void {
        this.useAnimationFrame = true; //!this.gridOptionsWrapper.isSuppressAnimationFrame();
    }

    public createTask(task: () => void) {
        if(this.task) {
            return;
        }
        this.task = task;
        this.schedule();
    }

    private executeFrame(): void {
        if (this.task) {
            this.task();
            this.task = null;
        }
    }

    public schedule(): void {
        if (!this.useAnimationFrame) {
            return;
        }
        this.requestFrame();
    }

    private requestFrame(): void {
        // check for the existence of requestAnimationFrame, and if
        // it's missing, then we polyfill it with setTimeout()
        const callback = this.executeFrame.bind(this);
        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(callback);
        } else if (window.webkitRequestAnimationFrame) {
            window.webkitRequestAnimationFrame(callback);
        } else {
            // window.setTimeout(callback, 0);
        }
    }
}
