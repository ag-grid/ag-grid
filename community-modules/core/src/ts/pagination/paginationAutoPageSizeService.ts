import { BeanStub } from "../context/beanStub";
import { Events } from "../events";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { ControllersService } from "../controllersService";
import { RowContainerCtrl } from "../gridBodyComp/rowContainer/rowContainerCtrl";

@Bean('paginationAutoPageSizeService')
export class PaginationAutoPageSizeService extends BeanStub {

    @Autowired('controllersService') private controllersService: ControllersService;

    private centerRowContainerCon: RowContainerCtrl;

    @PostConstruct
    private postConstruct(): void {
        this.controllersService.whenReady(p => {
            this.centerRowContainerCon = p.centerRowContainerCon;

            this.addManagedListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, this.onBodyHeightChanged.bind(this));
            this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
            this.checkPageSize();
        });
    }

    private notActive(): boolean {
        return !this.gridOptionsWrapper.isPaginationAutoPageSize();
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
