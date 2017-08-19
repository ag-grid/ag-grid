
import {Autowired, Bean} from "../context/context";
import {GridPanel} from "../gridPanel/gridPanel";
import {LinkedList} from "./linkedList";

@Bean('taskQueue')
export class TaskQueue {

    @Autowired('gridPanel') private gridPanel: GridPanel;

    // list of functions
    // private tasks: (()=>void)[] = [];

    private tasks = new LinkedList<()=>void>();
    private ticking = false;

    public addTask(task: ()=>void): void {
        this.tasks.add(task);
        this.schedule();
    }

    public executeFrame(): void {

        let frameStart = new Date().getTime();

        let duration = (new Date().getTime()) - frameStart;

        let gridPanelNeedsAFrame = true;

        while (duration < 60) {
            if (gridPanelNeedsAFrame) {
                gridPanelNeedsAFrame = this.gridPanel.executeFrame();
            } else if (!this.tasks.isEmpty()) {
                let task = this.tasks.remove();
                task();
            } else {
                break;
            }
            duration = (new Date().getTime()) - frameStart;
        }
        // while (duration < 60) {
        //     if (gridPanelNeedsAFrame) {
        //         gridPanelNeedsAFrame = this.gridPanel.executeFrame();
        //     } else if (this.tasks.length>0) {
        //         let task = this.tasks[this.tasks.length - 1];
        //         this.tasks.length = this.tasks.length - 1;
        //         task();
        //     } else {
        //         break;
        //     }
        //     duration = (new Date().getTime()) - frameStart;
        // }

        if (gridPanelNeedsAFrame || !this.tasks.isEmpty()) {
            this.requestFrame();
        } else {
            this.ticking = false;
        }
        // if (gridPanelNeedsAFrame || this.tasks.length>0) {
        //     this.requestFrame();
        // } else {
        //     this.ticking = false;
        // }
    }

    public schedule(): void {
        if (!this.ticking) {
            this.ticking = true;
            this.requestFrame();
        }
    }

    private requestFrame(): void {
        requestAnimationFrame(this.executeFrame.bind(this));
        // setTimeout(this.executeFrame.bind(this), 0);
    }
}
