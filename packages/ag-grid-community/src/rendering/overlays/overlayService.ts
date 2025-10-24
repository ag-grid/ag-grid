import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { GridOptions } from '../../entities/gridOptions';
import { _addGridCommonParams, _isClientSideRowModel, _isServerSideRowModel } from '../../gridOptionsUtils';
import type { ComponentType, UserCompDetails } from '../../interfaces/iUserCompDetails';
import { _warn } from '../../validation/logging';
import type { ComponentSelector } from '../../widgets/component';
import { OverlayWrapperComponent, OverlayWrapperSelector } from './overlayWrapperComponent';

type OverlayServiceState = '' | 'agLoadingOverlay' | 'agNoRowsOverlay' | 'custom';

const optionalMethods = ['refresh'];
const ActiveOverlayComponent: ComponentType = { name: 'activeOverlay', optionalMethods };
const LoadingOverlayComponent: ComponentType = { name: 'loadingOverlayComponent', optionalMethods };
const NoRowsOverlayComponent: ComponentType = { name: 'noRowsOverlayComponent', optionalMethods };

export class OverlayService extends BeanStub implements NamedBean {
    beanName = 'overlays' as const;

    private isClientSide: boolean;
    private isServerSide: boolean;
    private state: OverlayServiceState = '';
    private showInitialOverlay: boolean = true;
    private exclusive: boolean = false;
    private wrapperPadding: number = 0;
    private activeOverlayChanged = false;

    public eWrapper: OverlayWrapperComponent | undefined;

    public postConstruct(): void {
        this.isClientSide = _isClientSideRowModel(this.gos);
        this.isServerSide = !this.isClientSide && _isServerSideRowModel(this.gos);
        const updateOverlayVisibility = () => this.updateOverlayVisibility();

        this.addManagedEventListeners({
            newColumnsLoaded: updateOverlayVisibility,
            rowDataUpdated: updateOverlayVisibility,
            gridSizeChanged: this.refreshWrapperPadding.bind(this),
            rowCountReady: () => {
                // Support hiding the initial overlay when data is set via transactions.
                this.showInitialOverlay = false;
                this.updateOverlayVisibility();
            },
        });

        this.addManagedPropertyListeners(['loading', 'activeOverlay'], (params) => {
            this.activeOverlayChanged ||= !!params.changeSet?.properties.includes('activeOverlay');
            updateOverlayVisibility();
        });
    }

    public setOverlayWrapperComp(overlayWrapperComp: OverlayWrapperComponent | undefined): void {
        this.eWrapper = overlayWrapperComp;
        this.updateOverlayVisibility();
    }

    /** Returns true if the overlay is visible. */
    public isVisible(): boolean {
        return !!this.state && !!this.eWrapper;
    }

    /** Returns true if the overlay is visible and is exclusive (popup over the grid) */
    public isExclusive(): boolean {
        return this.state === 'agLoadingOverlay' && !!this.eWrapper;
    }

    public showLoadingOverlay(): void {
        this.showInitialOverlay = false;

        const gos = this.gos;
        const loading = gos.get('loading');
        if (!this.eWrapper || (!loading && (loading !== undefined || gos.get('suppressLoadingOverlay')))) {
            return;
        }
        this.doShowActiveOverlay('agLoadingOverlay');
    }

    public showNoRowsOverlay(): void {
        this.showInitialOverlay = false;

        const gos = this.gos;
        if (!this.eWrapper || gos.get('loading') || gos.get('suppressNoRowsOverlay')) {
            return;
        }

        this.doShowActiveOverlay('agNoRowsOverlay');
    }

    public hideOverlay(): void {
        this.showInitialOverlay = false;

        if (this.gos.get('loading')) {
            _warn(99);
            return;
        }

        this.doHideOverlay();
    }

    public getOverlayWrapperSelector(): ComponentSelector {
        return OverlayWrapperSelector;
    }

    public getOverlayWrapperCompClass(): typeof OverlayWrapperComponent {
        return OverlayWrapperComponent;
    }

    private updateOverlayVisibility(): void {
        if (!this.eWrapper) {
            this.state = '';
            return;
        }

        const {
            state,
            isClientSide,
            isServerSide,
            beans: { gos, colModel, rowModel },
        } = this;
        let loading = this.gos.get('loading');

        if (loading !== undefined) {
            // If loading is defined, we don't show the initial overlay.
            this.showInitialOverlay = false;
        }

        if (this.showInitialOverlay && loading === undefined && !gos.get('suppressLoadingOverlay')) {
            loading = !gos.get('columnDefs') || !colModel.ready || (!gos.get('rowData') && isClientSide);
        }

        if (loading) {
            if (state !== 'agLoadingOverlay') {
                this.doShowActiveOverlay('agLoadingOverlay');
            }
        } else {
            this.showInitialOverlay = false;
            if (isClientSide && rowModel.isEmpty() && !gos.get('suppressNoRowsOverlay')) {
                if (state !== 'agNoRowsOverlay') {
                    this.doShowActiveOverlay('agNoRowsOverlay');
                }
                return;
            }

            // If we are not showing a built-in overlay (loading / no-rows), check if the
            // application has requested an active overlay via gridOptions.activeOverlay.
            // Existing overlay APIs (loading/noRows and their component/template options)
            // take priority over `activeOverlay`, so we only show the active overlay when
            // no built-in overlay is applicable.
            const activeOverlay = gos.get('activeOverlay');
            if (activeOverlay) {
                if (this.activeOverlayChanged) {
                    this.activeOverlayChanged = false;
                    this.doHideOverlay();
                }
                if (state !== 'custom') {
                    this.doShowActiveOverlay(activeOverlay);
                }
                return;
            }

            if (state === 'agLoadingOverlay' || (!isServerSide && state)) {
                this.doHideOverlay();
            }
        }
    }

    private doShowActiveOverlay(activeOverlay: GridOptions['activeOverlay']): void {
        this.state = 'custom';

        if (typeof activeOverlay === 'string') {
            const loadingOpt = this.gos.get('loadingOverlayComponent');
            const noRowsOpt = this.gos.get('noRowsOverlayComponent');

            if (activeOverlay === loadingOpt || activeOverlay === 'agLoadingOverlay') {
                this.doShowLoadingOverlay();
                return;
            }

            if (activeOverlay === noRowsOpt || activeOverlay === 'agNoRowsOverlay') {
                this.doShowNoRowsOverlay();
                return;
            }
        }

        const compDetails = this.beans.userCompFactory.getCompDetailsFromGridOptions(
            ActiveOverlayComponent,
            undefined,
            _addGridCommonParams(this.gos, {})
        );

        this.showOverlay(compDetails, 'ag-overlay-custom-wrapper', 'activeOverlayParams');
        this.updateExclusive();
    }

    private doShowLoadingOverlay(): void {
        this.state = 'agLoadingOverlay';
        const baseParams = _addGridCommonParams(this.gos, {});
        const specificParams = this.gos.get('loadingOverlayComponentParams');
        const activeParams = this.gos.get('activeOverlayParams');
        let paramsToPass: any = baseParams;
        let loadingParamsKey: keyof GridOptions;

        if (specificParams) {
            paramsToPass = { ...baseParams, ...specificParams };
            loadingParamsKey = 'loadingOverlayComponentParams';
        } else if (activeParams) {
            paramsToPass = { ...baseParams, ...activeParams };
            loadingParamsKey = 'activeOverlayParams';
        } else {
            loadingParamsKey = 'loadingOverlayComponentParams';
        }

        this.showOverlay(
            this.beans.userCompFactory.getCompDetailsFromGridOptions(
                LoadingOverlayComponent,
                'agLoadingOverlay',
                paramsToPass
            ),
            'ag-overlay-loading-wrapper',
            loadingParamsKey
        );
        this.updateExclusive();
    }

    private doShowNoRowsOverlay(): void {
        this.state = 'agNoRowsOverlay';
        const baseParams = _addGridCommonParams(this.gos, {});
        const specificParams = this.gos.get('noRowsOverlayComponentParams');
        const activeParams = this.gos.get('activeOverlayParams');
        let paramsToPass: any = baseParams;
        let noRowsParamsKey: keyof GridOptions;

        if (specificParams) {
            paramsToPass = { ...baseParams, ...specificParams };
            noRowsParamsKey = 'noRowsOverlayComponentParams';
        } else if (activeParams) {
            paramsToPass = { ...baseParams, ...activeParams };
            noRowsParamsKey = 'activeOverlayParams';
        } else {
            noRowsParamsKey = 'noRowsOverlayComponentParams';
        }

        this.showOverlay(
            this.beans.userCompFactory.getCompDetailsFromGridOptions(
                NoRowsOverlayComponent,
                'agNoRowsOverlay',
                paramsToPass
            ),
            'ag-overlay-no-rows-wrapper',
            noRowsParamsKey
        );
        this.updateExclusive();
    }

    private doHideOverlay(): void {
        if (!this.eWrapper) {
            return;
        }

        this.state = '';
        this.eWrapper.hideOverlay();
        this.updateExclusive();
    }

    private showOverlay(
        compDetails: UserCompDetails | undefined,
        wrapperCssClass: string,
        gridOption: keyof GridOptions
    ): void {
        const promise = compDetails?.newAgStackInstance() ?? null;
        this.eWrapper?.showOverlay(promise, wrapperCssClass, this.isExclusive(), gridOption);
        this.refreshWrapperPadding();
    }

    private updateExclusive(): void {
        const wasExclusive = this.exclusive;
        this.exclusive = this.isExclusive();
        if (this.exclusive !== wasExclusive) {
            this.eventSvc.dispatchEvent({
                type: 'overlayExclusiveChanged',
            });
        }
    }

    private refreshWrapperPadding(): void {
        const eWrapper = this.eWrapper;
        if (!eWrapper) {
            return;
        }

        let newPadding: number = 0;

        if (this.state && !this.isExclusive()) {
            const headerCtrl = this.beans.ctrlsSvc.get('gridHeaderCtrl');
            const headerHeight = headerCtrl?.headerHeight || 0;

            newPadding = headerHeight;
        }

        if (this.wrapperPadding === newPadding) {
            return;
        }

        this.wrapperPadding = newPadding;
        eWrapper.updateOverlayWrapperPaddingTop(newPadding);
    }
}
