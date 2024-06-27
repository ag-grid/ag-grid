import type { ColumnModel } from '../../columns/columnModel';
import type { UserCompDetails, UserComponentFactory } from '../../components/framework/userComponentFactory';
import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { GridOptions } from '../../entities/gridOptions';
import type { IRowModel } from '../../interfaces/iRowModel';
import type { OverlayWrapperComponent } from './overlayWrapperComponent';

const enum OverlayServiceState {
    Hidden = 0,
    Loading = 1,
    NoRows = 2,
}

export class OverlayService extends BeanStub implements NamedBean {
    beanName = 'overlayService' as const;

    private userComponentFactory: UserComponentFactory;
    private rowModel: IRowModel;
    private columnModel: ColumnModel;

    private state: OverlayServiceState = OverlayServiceState.Hidden;
    private showInitialOverlay: boolean = true;

    public wireBeans(beans: BeanCollection): void {
        this.userComponentFactory = beans.userComponentFactory;
        this.rowModel = beans.rowModel;
        this.columnModel = beans.columnModel;
    }

    private overlayWrapperComp: OverlayWrapperComponent;

    public postConstruct(): void {
        const updateOverlayVisibility = () => this.updateOverlayVisibility();

        this.addManagedEventListeners({
            newColumnsLoaded: updateOverlayVisibility,
            rowDataUpdated: updateOverlayVisibility,
        });

        this.addManagedPropertyListener('loading', updateOverlayVisibility);
    }

    public registerOverlayWrapperComp(overlayWrapperComp: OverlayWrapperComponent): void {
        this.overlayWrapperComp = overlayWrapperComp;
        this.updateOverlayVisibility();
    }

    public showLoadingOverlay(): void {
        this.showInitialOverlay = false;

        const loading = this.gos.get('loading');
        if (!loading && (loading !== undefined || this.gos.get('suppressLoadingOverlay'))) {
            return;
        }

        this.doShowLoadingOverlay();
    }

    public showNoRowsOverlay(): void {
        this.showInitialOverlay = false;

        if (this.gos.get('loading') || this.gos.get('suppressNoRowsOverlay')) {
            return;
        }

        this.doShowNoRowsOverlay();
    }

    public hideOverlay(): void {
        this.showInitialOverlay = false;

        if (this.gos.get('loading')) {
            return;
        }

        this.doHideOverlay();
    }

    private updateOverlayVisibility(): void {
        let loading = this.gos.get('loading');

        if (this.showInitialOverlay && loading === undefined && !this.gos.get('suppressLoadingOverlay')) {
            loading =
                !this.gos.get('columnDefs') ||
                !this.columnModel.isReady() ||
                (!this.gos.get('rowData') && this.gos.isRowModelType('clientSide'));
        }

        if (loading) {
            if (this.state !== OverlayServiceState.Loading) {
                this.doShowLoadingOverlay();
            }
        } else {
            this.showInitialOverlay = false;
            if (
                this.rowModel.isEmpty() &&
                !this.gos.get('suppressNoRowsOverlay') &&
                this.gos.isRowModelType('clientSide')
            ) {
                if (this.state !== OverlayServiceState.NoRows) {
                    this.doShowNoRowsOverlay();
                }
            } else if (this.state !== OverlayServiceState.Hidden) {
                this.doHideOverlay();
            }
        }
    }

    private doShowLoadingOverlay(): void {
        this.state = OverlayServiceState.Loading;
        this.showOverlay(
            this.userComponentFactory.getLoadingOverlayCompDetails({}),
            'ag-overlay-loading-wrapper',
            'loadingOverlayComponentParams'
        );
    }

    private doShowNoRowsOverlay(): void {
        this.state = OverlayServiceState.NoRows;
        this.showOverlay(
            this.userComponentFactory.getNoRowsOverlayCompDetails({}),
            'ag-overlay-no-rows-wrapper',
            'noRowsOverlayComponentParams'
        );
    }

    private doHideOverlay(): void {
        this.state = OverlayServiceState.Hidden;
        this.overlayWrapperComp.hideOverlay();
    }

    private showOverlay(compDetails: UserCompDetails, wrapperCssClass: string, gridOption: keyof GridOptions): void {
        const promise = compDetails.newAgStackInstance();
        this.overlayWrapperComp.showOverlay(promise, wrapperCssClass, gridOption);
    }
}
