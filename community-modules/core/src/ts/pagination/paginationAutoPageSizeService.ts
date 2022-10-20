import { BeanStub } from "../context/beanStub";
import { Events } from "../events";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { CtrlsService } from "../ctrlsService";
import { RowContainerCtrl } from "../gridBodyComp/rowContainer/rowContainerCtrl";

@Bean('paginationAutoPageSizeService')
export class PaginationAutoPageSizeService extends BeanStub {

    @Autowired('ctrlsService') private ctrlsService: CtrlsService;

    private centerRowContainerCon: RowContainerCtrl;

    @PostConstruct
    private postConstruct(): void {
        this.ctrlsService.whenReady(p => {
            this.centerRowContainerCon = p.centerRowContainerCtrl;

            this.addManagedListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, this.onBodyHeightChanged.bind(this));
            this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
            this.checkPageSize();
        });
    }

    private notActive(): boolean {
        return !this.gridOptionsService.is('paginationAutoPageSize');
    }

    private onScrollVisibilityChanged(): void {
        this.checkPageSize();
    }

    private onBodyHeightChanged(): void {
        this.checkPageSize();
    }

    private checkPageSize(): void {
        if (this.notActive()) {
            return;
        }

        const rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        const bodyHeight = this.centerRowContainerCon.getViewportSizeFeature().getBodyHeight();

        if (bodyHeight > 0) {
            const newPageSize = Math.floor(bodyHeight / rowHeight);
            this.gridOptionsWrapper.setProperty('paginationPageSize', newPageSize);
        }
    }
}
