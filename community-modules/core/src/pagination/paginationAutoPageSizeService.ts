import { BeanStub } from "../context/beanStub";
import { Bean, PostConstruct } from "../context/context";
import { Events } from "../events";
import { RowContainerCtrl } from "../gridBodyComp/rowContainer/rowContainerCtrl";
import { debounce } from "../utils/function";

@Bean('paginationAutoPageSizeService')
export class PaginationAutoPageSizeService extends BeanStub {

    private centerRowContainerCon: RowContainerCtrl;

    // Once the body is rendered, we debounce changes to the page size,
    // but we do not want to debounce the first time the body is rendered.
    private isBodyRendered: boolean;

    @PostConstruct
    private postConstruct(): void {
        this.beans.ctrlsService.whenReady(p => {
            this.centerRowContainerCon = p.centerRowContainerCtrl;

            this.addManagedEventListener(Events.EVENT_BODY_HEIGHT_CHANGED, this.checkPageSize.bind(this));
            this.addManagedEventListener(Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.checkPageSize.bind(this));
            this.addManagedPropertyListener('paginationAutoPageSize', this.onPaginationAutoSizeChanged.bind(this));

            this.checkPageSize();
        });
    }

    private notActive(): boolean {
        return !this.beans.gos.get('paginationAutoPageSize') || this.centerRowContainerCon == null;
    }

    private onPaginationAutoSizeChanged(): void {
        if (this.notActive()) {
            this.beans.paginationProxy.unsetAutoCalculatedPageSize();
        } else {
            this.checkPageSize();
        }
    }

    private checkPageSize(): void {
        if (this.notActive()) { return; }

        const bodyHeight = this.centerRowContainerCon.getViewportSizeFeature()!.getBodyHeight();

        if (bodyHeight > 0) {
            const update = () => {
                const rowHeight = this.beans.gos.getRowHeightAsNumber();
                const newPageSize = Math.floor(bodyHeight / rowHeight);
                this.beans.paginationProxy.setPageSize(newPageSize, 'autoCalculated');
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
