import { BeanStub } from "../context/beanStub";
import { ControllersService } from "../controllersService";
export declare class NavigationService extends BeanStub {
    private mouseEventService;
    private paginationProxy;
    private focusController;
    private animationFrameService;
    private rangeController;
    private columnController;
    controllersService: ControllersService;
    private gridBodyCon;
    private timeLastPageEventProcessed;
    private postConstruct;
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
