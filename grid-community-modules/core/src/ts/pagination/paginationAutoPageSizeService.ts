import { BeanStub } from "../context/beanStub";
import { Events } from "../events";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { CtrlsService } from "../ctrlsService";
import { RowContainerCtrl } from "../gridBodyComp/rowContainer/rowContainerCtrl";
import { debounce } from "../utils/function";

@Bean('paginationAutoPageSizeService')
export class PaginationAutoPageSizeService extends BeanStub {

    @Autowired('ctrlsService') private ctrlsService: CtrlsService;

    private centerRowContainerCon: RowContainerCtrl;

    @PostConstruct
    private postConstruct(): void {
        this.ctrlsService.whenReady(p => {
            this.centerRowContainerCon = p.centerRowContainerCtrl;

            // we debounce this, as it can get called many times in a row and sometimes falsely 
            // (eg when the grid is resized horizontally, and columns are flexing causing scrollbar to toggle)
            const debounced = debounce(() => this.checkPageSize(), 50);
            this.addManagedListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, debounced);
            this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, debounced);
            this.checkPageSize();
        });
    }

    private notActive(): boolean {
        return !this.gridOptionsService.is('paginationAutoPageSize') || this.centerRowContainerCon == null;
    }

    public checkPageSize(): void {
        if (this.notActive()) {
            return;
        }

        const rowHeight = this.gridOptionsService.getRowHeightAsNumber();
        const bodyHeight = this.centerRowContainerCon.getViewportSizeFeature()!.getBodyHeight();

        if (bodyHeight > 0) {
            const newPageSize = Math.floor(bodyHeight / rowHeight);
            this.gridOptionsService.set('paginationPageSize', newPageSize);
        }
    }
}
