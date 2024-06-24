import type { ColumnModel } from '../../columns/columnModel';
import type { UserCompDetails, UserComponentFactory } from '../../components/framework/userComponentFactory';
import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { GridOptions } from '../../entities/gridOptions';
import type { WithoutGridCommon } from '../../interfaces/iCommon';
import type { IRowModel } from '../../interfaces/iRowModel';
import type { ILoadingOverlayParams } from './loadingOverlayComponent';
import type { INoRowsOverlayParams } from './noRowsOverlayComponent';
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
    private initialOverlay: boolean = true;
    private currentState: OverlayServiceState = OverlayServiceState.Hidden;

    public wireBeans(beans: BeanCollection): void {
        this.userComponentFactory = beans.userComponentFactory;
        this.rowModel = beans.rowModel;
        this.columnModel = beans.columnModel;
    }

    private overlayWrapperComp: OverlayWrapperComponent;
    private manuallyDisplayed: boolean = false;

    public postConstruct(): void {
        const updateOverlayVisibility = () => this.updateOverlayVisibility();

        this.addManagedEventListeners({
            newColumnsLoaded: () => this.onNewColumnsLoaded(),
            rowDataUpdated: updateOverlayVisibility,
        });
        this.addManagedPropertyListener('loading', updateOverlayVisibility);
    }

    public registerOverlayWrapperComp(overlayWrapperComp: OverlayWrapperComponent): void {
        this.overlayWrapperComp = overlayWrapperComp;
        this.updateOverlayVisibility();
    }

    public showLoadingOverlay(): void {
        const loading = this.gos.get('loading');
        if (!loading && (loading !== undefined || this.gos.get('suppressLoadingOverlay'))) {
            return;
        }

        this.currentState = OverlayServiceState.Loading;

        const params: WithoutGridCommon<ILoadingOverlayParams> = {};

        const compDetails = this.userComponentFactory.getLoadingOverlayCompDetails(params);
        this.showOverlay(compDetails, 'ag-overlay-loading-wrapper', 'loadingOverlayComponentParams');
    }

    public showNoRowsOverlay(): void {
        if (this.gos.get('suppressNoRowsOverlay')) {
            return;
        }

        this.initialOverlay = false;

        if (this.gos.get('loading')) {
            return; // loading property is true, we cannot show the no-rows overlay
        }

        this.currentState = OverlayServiceState.NoRows;

        const params: WithoutGridCommon<INoRowsOverlayParams> = {};
        const compDetails = this.userComponentFactory.getNoRowsOverlayCompDetails(params);
        this.showOverlay(compDetails, 'ag-overlay-no-rows-wrapper', 'noRowsOverlayComponentParams');
    }

    private showOverlay(compDetails: UserCompDetails, wrapperCssClass: string, gridOption: keyof GridOptions): void {
        const promise = compDetails.newAgStackInstance();
        const listenerDestroyFunc = this.addManagedPropertyListener(gridOption, ({ currentValue }) => {
            promise.then((comp) => {
                if (comp!.refresh) {
                    comp.refresh(
                        this.gos.addGridCommonParams({
                            ...(currentValue ?? {}),
                        })
                    );
                }
            });
        });

        this.manuallyDisplayed = this.columnModel.isReady() && !this.rowModel.isEmpty();
        this.overlayWrapperComp.showOverlay(promise, wrapperCssClass, listenerDestroyFunc);
    }

    public hideOverlay(): void {
        this.initialOverlay = false;

        if (this.gos.get('loading')) {
            return; // loading property is true, we cannot hide the overlay
        }
        this.manuallyDisplayed = false;

        this.currentState = OverlayServiceState.Hidden;

        this.overlayWrapperComp.hideOverlay();
    }

    private updateOverlayVisibility(): void {
        let loading = this.gos.get('loading');

        if (this.initialOverlay) {
            if (loading === undefined && !this.gos.get('suppressLoadingOverlay')) {
                loading =
                    !this.gos.get('columnDefs') || (this.gos.isRowModelType('clientSide') && !this.gos.get('rowData'));
            }
        }

        if (loading) {
            if (this.currentState !== OverlayServiceState.Loading) {
                this.showLoadingOverlay();
            }
        } else if (this.rowModel.isEmpty() && !this.gos.get('suppressNoRowsOverlay')) {
            if (this.currentState !== OverlayServiceState.NoRows) {
                this.showNoRowsOverlay();
            }
        } else if (this.currentState !== OverlayServiceState.Hidden) {
            this.hideOverlay();
        }
    }

    private onNewColumnsLoaded(): void {
        // hide overlay if columns and rows exist, this can happen if columns are loaded after data.
        // this problem exists before of the race condition between the services (column controller in this case)
        // and the view (grid panel). if the model beans were all initialised first, and then the view beans second,
        // this race condition would not happen.
        if (this.columnModel.isReady() && !this.rowModel.isEmpty() && !this.manuallyDisplayed) {
            this.updateOverlayVisibility();
        }
    }
}
