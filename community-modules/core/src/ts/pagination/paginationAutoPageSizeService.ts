import { BeanStub } from "../context/beanStub";
import { Events } from "../events";
import { Bean } from "../context/context";
import { GridBodyComp } from "../gridBodyComp/gridBodyComp";

@Bean('paginationAutoPageSizeService')
export class PaginationAutoPageSizeService extends BeanStub {

    private gridBodyComp: GridBodyComp;

    public registerGridComp(gridBodyComp: GridBodyComp): void {
        this.gridBodyComp = gridBodyComp;

        this.addManagedListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, this.onBodyHeightChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.checkPageSize();
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
        const bodyHeight = this.gridBodyComp.getBodyHeight();

        if (bodyHeight > 0) {
            const newPageSize = Math.floor(bodyHeight / rowHeight);
            this.gridOptionsWrapper.setProperty('paginationPageSize', newPageSize);
        }
    }
}
