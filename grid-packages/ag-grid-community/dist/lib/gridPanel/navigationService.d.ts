import { GridPanel } from "./gridPanel";
import { BeanStub } from "../context/beanStub";
export declare class NavigationService extends BeanStub {
    private mouseEventService;
    private paginationProxy;
    private focusController;
    private animationFrameService;
    private rangeController;
    private columnController;
    private gridPanel;
    private timeLastPageEventProcessed;
    registerGridComp(gridPanel: GridPanel): void;
    handlePageScrollingKey(event: KeyboardEvent): boolean;
    private isTimeSinceLastPageEventToRecent;
    private setTimeLastPageEventProcessed;
    private navigateTo;
    private onPageDown;
    private onPageUp;
    private getIndexToFocus;
    private onCtrlUpOrDown;
    private onCtrlLeftOrRight;
    private onHomeOrEndKey;
}
