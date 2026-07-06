import { AgPromise, _setAriaBusy } from 'ag-stack';

import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { GridOptions } from '../../entities/gridOptions';
import type { GridOptionsService } from '../../gridOptionsService';
import { _addGridCommonParams, _isClientSideRowModel } from '../../gridOptionsUtils';
import type { CellPosition } from '../../interfaces/iCellPosition';
import type { ComponentType, UserCompDetails } from '../../interfaces/iUserCompDetails';
import { _attemptToRestoreCellFocus } from '../../utils/gridFocus';
import { _formatNumberCommas } from '../../utils/number';
import { _warn } from '../../validation/logging';
import type { ComponentSelector } from '../../widgets/component';
import type { IOverlayComp, OverlayComponentUserParams, OverlayType } from './overlayComponent';
import { OverlayWrapperComponent, OverlayWrapperSelector } from './overlayWrapperComponent';

const LOADING_ANNOUNCEMENT_DELAY = 250;
const LOADING_COMPLETION_HIDE_DELAY = 50;

const overlayCompTypeOptionalMethods = ['refresh'];
const overlayCompType = (name: string): ComponentType => ({ name, optionalMethods: overlayCompTypeOptionalMethods });

type OverlayCompType =
    | 'agLoadingOverlay'
    | 'agNoRowsOverlay'
    | 'agNoMatchingRowsOverlay'
    | 'agExportingOverlay'
    | 'agFileInputOverlay'
    | 'agErrorOverlay'
    | 'activeOverlay';

type OverlayDef = Readonly<{
    id: OverlayCompType;
    overlayType?: OverlayType;
    comp: ComponentType;
    wrapperCls: string;
    exclusive?: boolean;
    compKey?: keyof GridOptions;
    paramsKey?: keyof GridOptions;
    isSuppressed?: (gos: GridOptionsService) => boolean;
    overriddenComp?: UserCompDetails<any>;
    /** Provided overlay that must not be replaced by a user-supplied `overlayComponent`. */
    noUserOverride?: boolean;
}>;

const LoadingOverlayDef: OverlayDef = {
    id: 'agLoadingOverlay',
    overlayType: 'loading',
    comp: overlayCompType('loadingOverlayComponent'),
    wrapperCls: 'ag-overlay-loading-wrapper',
    exclusive: true,
    compKey: 'loadingOverlayComponent',
    paramsKey: 'loadingOverlayComponentParams',
    isSuppressed: (gos: GridOptionsService) => {
        const isLoading = gos.get('loading');
        return isLoading === false || (gos.get('suppressLoadingOverlay') === true && isLoading !== true);
    },
} as const;

const NoRowsOverlayDef: OverlayDef = {
    id: 'agNoRowsOverlay',
    overlayType: 'noRows',
    comp: overlayCompType('noRowsOverlayComponent'),
    wrapperCls: 'ag-overlay-no-rows-wrapper',
    compKey: 'noRowsOverlayComponent',
    paramsKey: 'noRowsOverlayComponentParams',
    isSuppressed: (gos: GridOptionsService) => gos.get('suppressNoRowsOverlay'),
};

const NoMatchingRowsOverlayDef: OverlayDef = {
    id: 'agNoMatchingRowsOverlay',
    overlayType: 'noMatchingRows',
    comp: overlayCompType('noMatchingRowsOverlayComponent'),
    wrapperCls: 'ag-overlay-no-matching-rows-wrapper',
};

const ExportingOverlayDef: OverlayDef = {
    id: 'agExportingOverlay',
    overlayType: 'exporting',
    comp: overlayCompType('exportingOverlayComponent'),
    wrapperCls: 'ag-overlay-exporting-wrapper',
    exclusive: true,
};

const FileInputOverlayDef: OverlayDef = {
    id: 'agFileInputOverlay',
    overlayType: 'fileInput',
    comp: overlayCompType('fileInputOverlayComponent'),
    wrapperCls: 'ag-overlay-file-input-wrapper',
    exclusive: true,
};

const CustomOverlayDef: Readonly<OverlayDef> = {
    id: 'activeOverlay',
    comp: overlayCompType('activeOverlay'),
    wrapperCls: 'ag-overlay-modal-wrapper',
    exclusive: true,
};

// Dev-only overlay surfacing captured validation diagnostics. The component (agErrorOverlay) is
// supplied by the ValidationModule, so this def resolves only when that module is registered. It is
// driven by ErrorOverlayService via setDevErrorOverlay, never by the user-facing activeOverlay option.
const ErrorOverlayDef: OverlayDef = {
    id: 'agErrorOverlay',
    overlayType: 'error',
    comp: overlayCompType('agErrorOverlay'),
    wrapperCls: 'ag-overlay-error-wrapper',
    exclusive: false,
    noUserOverride: true,
};

const getActiveOverlayDef = (activeOverlay: any): OverlayDef | null => {
    if (!activeOverlay) {
        return null;
    }
    return (
        (
            {
                agLoadingOverlay: LoadingOverlayDef,
                agNoRowsOverlay: NoRowsOverlayDef,
                agNoMatchingRowsOverlay: NoMatchingRowsOverlayDef,
                agExportingOverlay: ExportingOverlayDef,
                agFileInputOverlay: FileInputOverlayDef,
            } as Record<string, OverlayDef>
        )[activeOverlay] ?? CustomOverlayDef
    );
};
const getOverlayDefForType = (overlayType: OverlayType | null): OverlayDef | null => {
    if (!overlayType) {
        return null;
    }
    return (
        {
            loading: LoadingOverlayDef,
            noRows: NoRowsOverlayDef,
            noMatchingRows: NoMatchingRowsOverlayDef,
            exporting: ExportingOverlayDef,
            fileInput: FileInputOverlayDef,
        } as Record<OverlayType, OverlayDef>
    )[overlayType];
};

export class OverlayService extends BeanStub implements NamedBean {
    beanName = 'overlays' as const;

    public eWrapper: OverlayWrapperComponent | undefined = undefined;

    public exclusive: boolean = false;
    private oldExclusive: boolean = false;
    private currentDef: OverlayDef | null = null;
    private showInitialOverlay: boolean = true;
    private userForcedNoRows: boolean = false;
    private exportsInProgress: number = 0;
    private focusedCell: CellPosition | null;
    private devErrorOverlayActive: boolean = false;
    private loadingAnnouncementTimeout: ReturnType<typeof setTimeout> | null = null;
    private loadingCompletionTimeout: ReturnType<typeof setTimeout> | null = null;
    private loadingAnnouncementSpoken: boolean = false;
    private loadingCompletionTargetDef: OverlayDef | null | undefined = undefined;

    private newColumnsLoadedCleanup: (() => void) | null = null;
    public postConstruct(): void {
        const gos = this.gos;
        this.showInitialOverlay = _isClientSideRowModel(gos);

        const updateOverlayVisibility = () => {
            if (this.userForcedNoRows) {
                // Stop handling grid events so we do not clear the manually triggered no rows overlay
                return;
            }
            this.updateOverlay(false);
        };

        const [newColumnsLoadedCleanup, rowCountReadyCleanup, _, __] = this.addManagedEventListeners({
            newColumnsLoaded: updateOverlayVisibility,
            rowCountReady: () => {
                // Support hiding the initial overlay when data is set via transactions.
                this.disableInitialOverlay();
                updateOverlayVisibility();
                rowCountReadyCleanup();
            },
            rowDataUpdated: updateOverlayVisibility,
            modelUpdated: updateOverlayVisibility,
        });
        this.newColumnsLoadedCleanup = newColumnsLoadedCleanup;

        this.addManagedPropertyListeners(
            [
                'loading',
                'activeOverlay',
                'activeOverlayParams',
                'overlayComponentParams',
                'loadingOverlayComponentParams',
                'noRowsOverlayComponentParams',
                'autoGenerateColumnDefs',
                'processFileInput',
            ],
            (params) => this.onPropChange(new Set(params.changeSet?.properties))
        );
    }

    public override destroy(): void {
        this.clearLoadingLifecycle();
        this.doHideOverlay();
        this.setGridBusy(false);
        super.destroy();
        this.eWrapper = undefined;
    }

    public setWrapperComp(overlayWrapperComp: OverlayWrapperComponent, destroyed: boolean): void {
        if (!this.isAlive()) {
            return;
        }
        if (!destroyed) {
            this.eWrapper = overlayWrapperComp;
        } else if (this.eWrapper === overlayWrapperComp) {
            this.eWrapper = undefined;
        }
        this.updateOverlay(false);
    }

    /** Returns true if the overlay is visible. */
    public isVisible(): boolean {
        return !!this.currentDef;
    }

    /**
     * Shows or hides the dev-only validation error overlay. Driven by the ValidationModule's
     * ErrorOverlayService; takes priority over the data-driven overlays while active. Re-evaluates
     * immediately so the overlay appears as soon as the wrapper exists (or once it later mounts).
     */
    public setDevErrorOverlay(active: boolean): void {
        if (this.devErrorOverlayActive === active) {
            return;
        }
        this.devErrorOverlayActive = active;
        this.updateOverlay(false);
    }

    public showLoadingOverlay(): void {
        this.showInitialOverlay = false;
        const gos = this.gos;
        if (!this.eWrapper || gos.get('activeOverlay')) {
            return;
        }
        if (this.isDisabled(LoadingOverlayDef)) {
            return;
        }
        const loading = gos.get('loading');
        if (!loading && loading !== undefined) {
            return;
        }
        this.doShowOverlay(LoadingOverlayDef);
    }

    public showNoRowsOverlay(): void {
        this.showInitialOverlay = false;
        const gos = this.gos;
        if (!this.eWrapper || gos.get('activeOverlay') || gos.get('loading') || this.isDisabled(NoRowsOverlayDef)) {
            return;
        }
        this.userForcedNoRows = true;
        this.doShowOverlay(NoRowsOverlayDef);
    }
    public async showExportOverlay(heavyOperation: () => void) {
        const { gos, beans } = this;
        if (
            !this.eWrapper ||
            gos.get('activeOverlay') ||
            gos.get('loading') ||
            this.isDisabled(ExportingOverlayDef) ||
            (this.userForcedNoRows && this.currentDef === NoRowsOverlayDef)
        ) {
            heavyOperation();
            return;
        }

        // wait until the wrapper has mounted the overlay component
        const desiredDef = this.getDesiredDefWithOverride(ExportingOverlayDef);
        if (!desiredDef) {
            heavyOperation();
            return;
        }

        // Make sure if multiple export calls are run we don't clear until the last one.
        this.exportsInProgress++;
        // Aim to restore cell focus after it is lost due to the overlay
        this.focusedCell = beans.focusSvc.getFocusedCell();

        await this.doShowOverlay(desiredDef);

        // ensure the overlay has a chance to be painted
        await new Promise<void>((resolve) => setTimeout(() => resolve()));

        const shownAt = Date.now();
        // start the heavy operation (allow sync or promise)
        try {
            heavyOperation();
        } finally {
            // We apply a minimum show time of 300ms to avoid fast exports having a flicker of the overlay
            const elapsed = Date.now() - shownAt;
            const remaining = Math.max(0, 300 - elapsed);

            const clearExportOverlay = () => {
                this.exportsInProgress--;
                if (this.exportsInProgress === 0) {
                    this.updateOverlay(false);
                    _attemptToRestoreCellFocus(beans, this.focusedCell);
                    this.focusedCell = null;
                }
            };

            if (remaining > 0) {
                setTimeout(() => clearExportOverlay(), remaining);
            } else {
                clearExportOverlay();
            }
        }
    }

    public hideOverlay(): void {
        const gos = this.gos;
        this.showInitialOverlay = false;
        const userHadForced = this.userForcedNoRows;
        this.userForcedNoRows = false;
        if (gos.get('loading')) {
            _warn(99);
            return;
        }
        if (gos.get('activeOverlay')) {
            _warn(296);
            return;
        }
        if (this.currentDef === NoMatchingRowsOverlayDef) {
            _warn(297);
            return;
        }
        this.doHideOverlay();
        if (userHadForced) {
            // if user had forced no-rows overlay, we need to reevaluate what overlay should be shown now if any
            if (this.getOverlayDef() !== NoRowsOverlayDef) {
                this.updateOverlay(false);
            }
        }
    }

    public getOverlayWrapperSelector(): ComponentSelector {
        return OverlayWrapperSelector;
    }

    public getOverlayWrapperCompClass(): typeof OverlayWrapperComponent {
        return OverlayWrapperComponent;
    }

    public refreshGridBusy(): void {
        this.setGridBusy(this.currentDef === LoadingOverlayDef || this.currentDef === ExportingOverlayDef);
    }

    private onPropChange(changedProps: ReadonlySet<string>): void {
        const activeOverlayChanged = changedProps.has('activeOverlay');
        if (activeOverlayChanged || changedProps.has('loading')) {
            if (this.updateOverlay(activeOverlayChanged)) {
                return; // overlay changed, no need to check further
            }
        }

        const currentDef = this.currentDef;
        const currOverlayComp = this.eWrapper?.activeOverlay;
        if (currOverlayComp && currentDef) {
            const activeOverlayParamsChanged = changedProps.has('activeOverlayParams');
            if (currentDef === CustomOverlayDef) {
                // If its an activeOverlay update if the changes are in the activeOverlayParams
                if (activeOverlayParamsChanged) {
                    currOverlayComp.refresh?.(this.makeCompParams(true));
                }
            } else {
                // Check for overlay component param or legacy provided param changes
                const paramsKey = currentDef.paramsKey;
                if (changedProps.has('overlayComponentParams') || (paramsKey && changedProps.has(paramsKey))) {
                    const legacyParamsKey = this.getLegacyParamsKey(currentDef);
                    const params = this.makeCompParams(false, legacyParamsKey, currentDef.overlayType);
                    currOverlayComp.refresh?.(params);
                }
            }
        }
    }

    private updateOverlay(activeOverlayChanged: boolean): boolean {
        const eWrapper = this.eWrapper;
        if (!eWrapper) {
            this.currentDef = null;
            return false;
        }

        // Active overlay should take priority over loading=true
        const desiredDef = this.getDesiredDefWithOverride();

        const currentDef = this.currentDef;
        const shouldReload = desiredDef === CustomOverlayDef && activeOverlayChanged;

        if (currentDef === LoadingOverlayDef && this.loadingCompletionTargetDef !== undefined) {
            if (desiredDef === this.loadingCompletionTargetDef) {
                return true;
            }
            this.clearLoadingCompletion();
        }

        if (desiredDef !== currentDef) {
            if (!desiredDef) {
                this.disableInitialOverlay();
                return this.doHideOverlay();
            }
            this.doShowOverlay(desiredDef);
            return true;
        }

        if (shouldReload && desiredDef) {
            eWrapper.hideOverlay();
            this.doShowOverlay(desiredDef);
            return true;
        }

        if (!desiredDef) {
            this.disableInitialOverlay();
        }

        return false;
    }

    private getDesiredDefWithOverride(defaultDef?: OverlayDef) {
        const { gos } = this;
        let desiredDef = getActiveOverlayDef(gos.get('activeOverlay'));
        if (!desiredDef) {
            desiredDef = defaultDef ?? this.getOverlayDef();
            if (desiredDef && this.isDisabled(desiredDef)) {
                desiredDef = null;
            }
        }
        return desiredDef;
    }

    private getOverlayDef(): OverlayDef | null {
        const { gos, beans } = this;
        const { rowModel } = beans;

        // Dev validation errors take priority over the data-driven overlays (loading / no-rows).
        if (this.devErrorOverlayActive && this.eWrapper) {
            return ErrorOverlayDef;
        }

        const loading = gos.get('loading');

        const loadingDefined = loading !== undefined;

        if (loadingDefined) {
            this.disableInitialOverlay();
            if (loading) {
                return LoadingOverlayDef;
            }
        } else if (this.showInitialOverlay) {
            const noColumnDefs = !gos.get('columnDefs') && !gos.get('autoGenerateColumnDefs');
            const noRowData = !gos.get('rowData');
            if (noColumnDefs || noRowData) {
                if (noRowData && gos.get('processFileInput') && !this.isDisabled(FileInputOverlayDef)) {
                    return FileInputOverlayDef;
                }
                if (!this.isDisabled(LoadingOverlayDef)) {
                    return LoadingOverlayDef;
                }
            }
            this.disableInitialOverlay();
        } else {
            this.disableInitialOverlay();
        }

        // activeOverlay already checked above
        const overlayType = rowModel.getOverlayType();
        return getOverlayDefForType(overlayType);
    }

    private disableInitialOverlay(): void {
        this.showInitialOverlay = false;
        // Stop listening for new columns loaded as initial overlay is now hidden
        this.newColumnsLoadedCleanup?.();
        this.newColumnsLoadedCleanup = null;
    }

    /**
     * Show an overlay requested by name or by built-in types.
     * This single function replaces the previous three helpers and handles
     * param selection and wrapper class choice for loading / no-rows and custom overlays.
     */
    private doShowOverlay(componentDef: OverlayDef): AgPromise<IOverlayComp | undefined> {
        const { gos, beans } = this;
        const { userCompFactory } = beans;
        const previousDef = this.currentDef;

        if (
            previousDef === LoadingOverlayDef &&
            componentDef !== LoadingOverlayDef &&
            this.completeLoadingAnnouncement()
        ) {
            this.loadingCompletionTargetDef = componentDef;
            this.setGridBusy(componentDef === ExportingOverlayDef);
            this.queueLoadingCompletionHide(() => {
                if (this.currentDef === LoadingOverlayDef && this.loadingCompletionTargetDef === componentDef) {
                    this.loadingCompletionTargetDef = undefined;
                    this.doShowOverlay(componentDef);
                }
            });
            return AgPromise.resolve();
        }

        this.clearLoadingCompletion();

        this.currentDef = componentDef;
        const isProvidedOverlay = componentDef !== CustomOverlayDef;
        const exclusive = !!componentDef.exclusive;
        this.exclusive = exclusive;

        // Prefer overlay-specific params if provided (e.g. loadingOverlayComponentParams
        // or noRowsOverlayComponentParams). Fall back to legacy component option presence
        // (e.g. loadingOverlayComponent) or finally to activeOverlayParams.
        const legacyParamsKey = this.getLegacyParamsKey(componentDef);

        let compDetails = undefined;
        if (isProvidedOverlay && !componentDef.noUserOverride) {
            // For provided overlays check if the user is providing overrides for them
            if (gos.get('overlayComponent') || gos.get('overlayComponentSelector')) {
                compDetails = userCompFactory.getCompDetailsFromGridOptions(
                    { name: 'overlayComponent', optionalMethods: ['refresh'] },
                    undefined,
                    this.makeCompParams(false, componentDef.paramsKey, componentDef.overlayType)
                );
            }
        }

        compDetails ??= userCompFactory.getCompDetailsFromGridOptions(
            componentDef.comp,
            isProvidedOverlay ? componentDef.id : undefined,
            this.makeCompParams(!isProvidedOverlay, legacyParamsKey, componentDef.overlayType),
            false
        );

        const promise = compDetails?.newAgStackInstance() ?? null;
        const mountedPromise: AgPromise<IOverlayComp | undefined> = this.eWrapper
            ? this.eWrapper.showOverlay(promise, componentDef.wrapperCls, exclusive)
            : AgPromise.resolve();
        this.eWrapper?.refreshWrapperPadding();
        this.setExclusive(exclusive);
        this.updateOverlayStatus(
            previousDef,
            componentDef,
            compDetails?.params ?? this.getOverlayUserParams(legacyParamsKey),
            mountedPromise
        );

        return mountedPromise;
    }

    private getLegacyParamsKey(componentDef: OverlayDef): keyof GridOptions | undefined {
        const { gos } = this;

        if (
            (componentDef.paramsKey && gos.get(componentDef.paramsKey)) ||
            (componentDef.compKey && gos.get(componentDef.compKey))
        ) {
            return componentDef.paramsKey;
        }

        return undefined;
    }

    private updateOverlayStatus(
        previousDef: OverlayDef | null,
        nextDef: OverlayDef | null,
        overlayParams?: OverlayComponentUserParams,
        mountedPromise?: AgPromise<IOverlayComp | undefined>
    ): void {
        this.setGridBusy(nextDef === LoadingOverlayDef || nextDef === ExportingOverlayDef);

        if (nextDef === previousDef) {
            return; // re-shows and param refreshes must not re-announce or reset the debounce
        }

        if (nextDef === LoadingOverlayDef) {
            mountedPromise?.then(() => {
                if (this.currentDef === LoadingOverlayDef) {
                    this.queueLoadingAnnouncement(this.getLoadingStatusText(overlayParams));
                }
            });
        } else if (previousDef === LoadingOverlayDef) {
            this.clearLoadingAnnouncement();
        }
    }

    private queueLoadingAnnouncement(message: string): void {
        this.clearLoadingAnnouncement();
        if (!message) {
            return;
        }

        this.loadingAnnouncementTimeout = setTimeout(() => {
            this.loadingAnnouncementTimeout = null;
            this.loadingAnnouncementSpoken = this.setActiveOverlayStatus(message);
        }, LOADING_ANNOUNCEMENT_DELAY);
    }

    private completeLoadingAnnouncement(): boolean {
        this.clearLoadingAnnouncement();

        const loadingAnnouncementSpoken = this.loadingAnnouncementSpoken;
        this.loadingAnnouncementSpoken = false;

        return loadingAnnouncementSpoken && this.setActiveOverlayStatus(this.getLoadingCompleteStatus());
    }

    private setActiveOverlayStatus(status: string): boolean {
        const activeOverlay = this.eWrapper?.activeOverlay as
            | (IOverlayComp & {
                  announceOverlayStatus?: (status: string) => boolean;
              })
            | null;

        return activeOverlay?.announceOverlayStatus?.(status) === true;
    }

    private clearLoadingLifecycle(): void {
        this.clearLoadingAnnouncement();
        this.clearLoadingCompletion();
        this.loadingAnnouncementSpoken = false;
    }

    private clearLoadingAnnouncement(): void {
        if (this.loadingAnnouncementTimeout !== null) {
            clearTimeout(this.loadingAnnouncementTimeout);
            this.loadingAnnouncementTimeout = null;
        }
    }

    private queueLoadingCompletionHide(callback: () => void): void {
        if (this.loadingCompletionTimeout !== null) {
            clearTimeout(this.loadingCompletionTimeout);
            this.loadingCompletionTimeout = null;
        }
        this.loadingCompletionTimeout = setTimeout(() => {
            this.loadingCompletionTimeout = null;
            callback();
        }, LOADING_COMPLETION_HIDE_DELAY);
    }

    private clearLoadingCompletion(): void {
        this.loadingCompletionTargetDef = undefined;
        if (this.loadingCompletionTimeout !== null) {
            clearTimeout(this.loadingCompletionTimeout);
            this.loadingCompletionTimeout = null;
        }
    }

    private getLoadingStatusText(overlayParams?: OverlayComponentUserParams): string {
        // Legacy custom templates fully control the overlay content and the grid cannot
        // derive matching text from them, so announce nothing rather than the wrong text.
        if (this.gos.get('overlayLoadingTemplate')?.trim()) {
            return '';
        }
        const params = overlayParams ?? this.getOverlayUserParams();
        return params.loading?.overlayText ?? this.getLocaleTextFunc()('loadingOoo', 'Loading...');
    }

    private setGridBusy(busy: boolean): void {
        const gridBodyCtrl = this.beans.ctrlsSvc.get('gridBodyCtrl');
        const eGridViewport = gridBodyCtrl?.eGridViewport;
        if (!eGridViewport) {
            return;
        }

        _setAriaBusy(eGridViewport, busy ? true : null);
    }

    private getOverlayUserParams(legacyParamsKey?: keyof GridOptions): OverlayComponentUserParams {
        return {
            ...this.gos.get('overlayComponentParams'),
            ...((legacyParamsKey && this.gos.get(legacyParamsKey)) || null),
        };
    }

    private getLoadingCompleteStatus(): string {
        const loadingComplete = this.getLocaleTextFunc()('loadingComplete', 'Data loaded.');
        const status = this.getLoadingCompleteSummary();
        return status ? `${loadingComplete} ${status}` : loadingComplete;
    }

    private getLoadingCompleteSummary(): string {
        const { gos, beans } = this;
        const { pagination, rowModel } = beans;
        if (gos.get('pagination') && pagination) {
            return pagination.getAriaPageSummary(this.formatRowCount.bind(this));
        }

        if (!rowModel.isLastRowIndexKnown()) {
            return '';
        }

        const rowCount = rowModel.getRowCount();
        const formattedRowCount = this.formatRowCount(rowCount);
        const localeTextFunc = this.getLocaleTextFunc();
        return rowCount === 1
            ? localeTextFunc('loadingCompleteRow', `${formattedRowCount} row.`, [formattedRowCount])
            : localeTextFunc('loadingCompleteRows', `${formattedRowCount} rows.`, [formattedRowCount]);
    }

    private formatRowCount(value: number): string {
        const userFunc = this.gos.getCallback('paginationNumberFormatter');
        return userFunc ? userFunc({ value }) : _formatNumberCommas(value, this.getLocaleTextFunc.bind(this));
    }

    private makeCompParams(
        includeActiveOverlayParams: boolean,
        legacyParamsKey?: keyof GridOptions,
        overlayType?: OverlayType
    ): any {
        const { gos } = this;

        const params = includeActiveOverlayParams
            ? gos.get('activeOverlayParams')
            : {
                  ...gos.get('overlayComponentParams'),
                  ...((legacyParamsKey && gos.get(legacyParamsKey)) || null),
                  overlayType,
              };

        return _addGridCommonParams(gos, params ?? {});
    }

    private doHideOverlay(): boolean {
        let changed = false;
        const previousDef = this.currentDef;
        if (!previousDef) {
            this.exclusive = false;
            this.updateOverlayStatus(previousDef, null);
            return changed;
        }

        if (previousDef === LoadingOverlayDef && this.completeLoadingAnnouncement()) {
            changed = true;
            this.loadingCompletionTargetDef = null;
            this.setGridBusy(false);
            this.queueLoadingCompletionHide(() => {
                if (this.currentDef === LoadingOverlayDef && this.loadingCompletionTargetDef === null) {
                    this.currentDef = null;
                    this.exclusive = false;
                    const eWrapper = this.eWrapper;
                    if (eWrapper) {
                        eWrapper.hideOverlay();
                        eWrapper.refreshWrapperPadding();
                        this.setExclusive(false);
                    }
                }
            });
            return changed;
        }

        this.currentDef = null;
        changed = true;
        this.exclusive = false;

        const eWrapper = this.eWrapper;
        if (eWrapper) {
            eWrapper.hideOverlay();
            eWrapper.refreshWrapperPadding();
            this.setExclusive(false);
        }
        this.updateOverlayStatus(previousDef, null);
        return changed;
    }

    private setExclusive(exclusive: boolean): void {
        if (this.oldExclusive !== exclusive) {
            this.oldExclusive = exclusive;
            this.eventSvc.dispatchEvent({ type: 'overlayExclusiveChanged' });
        }
    }

    private isDisabled(def: OverlayDef): boolean {
        const { gos } = this;

        return (
            (def.overlayType && gos.get('suppressOverlays')?.includes(def.overlayType)) ||
            def.isSuppressed?.(gos) === true
        );
    }
}
