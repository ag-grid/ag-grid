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

    // Once the body is rendered, we debounce changes to the page size,
    // but we do not want to debounce the first time the body is rendered.
    private isBodyRendered: boolean;

    @PostConstruct
    private postConstruct(): void {
        this.ctrlsService.whenReady(p => {
            this.centerRowContainerCon = p.centerRowContainerCtrl;

            this.addManagedListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, this.checkPageSize.bind(this));
            this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.checkPageSize.bind(this));

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

        const bodyHeight = this.centerRowContainerCon.getViewportSizeFeature()!.getBodyHeight();

        if (bodyHeight > 0) {
            const update = () => {
                const rowHeight = this.gridOptionsService.getRowHeightAsNumber();
                const newPageSize = Math.floor(bodyHeight / rowHeight);
                this.gridOptionsService.set('paginationPageSize', newPageSize);
            }

            if (!this.isBodyRendered) {
                update();
                this.isBodyRendered = true;
            } else {
                debounce(() => update(), 50)();
            }
        } else {
            this.isBodyRendered = false;
        }
    }
}
