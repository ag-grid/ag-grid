import { BeanStub } from '../context/beanStub';
import { Autowired, Bean } from '../context/context';
import { CtrlsService } from '../ctrlsService';
import { Events } from '../events';
import { RowContainerCtrl } from '../gridBodyComp/rowContainer/rowContainerCtrl';
import { _debounce } from '../utils/function';
import { PaginationProxy } from './paginationProxy';

@Bean('paginationAutoPageSizeService')
export class PaginationAutoPageSizeService extends BeanStub {
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;

    private centerRowsCtrl: RowContainerCtrl;

    // Once the body is rendered, we debounce changes to the page size,
    // but we do not want to debounce the first time the body is rendered.
    private isBodyRendered: boolean;

    protected override postConstruct(): void {
        super.postConstruct();
        this.ctrlsService.whenReady((p) => {
            this.centerRowsCtrl = p.center;

            this.addManagedListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, this.checkPageSize.bind(this));
            this.addManagedListener(
                this.eventService,
                Events.EVENT_SCROLL_VISIBILITY_CHANGED,
                this.checkPageSize.bind(this)
            );
            this.addManagedPropertyListener('paginationAutoPageSize', this.onPaginationAutoSizeChanged.bind(this));

            this.checkPageSize();
        });
    }

    private notActive(): boolean {
        return !this.gos.get('paginationAutoPageSize') || this.centerRowsCtrl == null;
    }

    private onPaginationAutoSizeChanged(): void {
        if (this.notActive()) {
            this.paginationProxy.unsetAutoCalculatedPageSize();
        } else {
            this.checkPageSize();
        }
    }

    private checkPageSize(): void {
        if (this.notActive()) {
            return;
        }

        const bodyHeight = this.centerRowsCtrl.getViewportSizeFeature()!.getBodyHeight();

        if (bodyHeight > 0) {
            const update = () => {
                const rowHeight = Math.max(this.gos.getRowHeightAsNumber(), 1); // prevent divide by zero error if row height is 0
                const newPageSize = Math.floor(bodyHeight / rowHeight);
                this.paginationProxy.setPageSize(newPageSize, 'autoCalculated');
            };

            if (!this.isBodyRendered) {
                update();
                this.isBodyRendered = true;
            } else {
                _debounce(() => update(), 50)();
            }
        } else {
            this.isBodyRendered = false;
        }
    }
}
