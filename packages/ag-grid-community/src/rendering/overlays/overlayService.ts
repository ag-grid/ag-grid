import { AgPromise } from '../../agStack/utils/promise';
import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { GridOptions } from '../../entities/gridOptions';
import type { GridOptionsService } from '../../gridOptionsService';
import { _addGridCommonParams, _isClientSideRowModel } from '../../gridOptionsUtils';
import type { ComponentType, UserCompDetails } from '../../interfaces/iUserCompDetails';
import { _warn } from '../../validation/logging';
import type { ComponentSelector } from '../../widgets/component';
import type { IOverlayComp, OverlayType } from './overlayComponent';
import { OverlayWrapperComponent, OverlayWrapperSelector } from './overlayWrapperComponent';

const overlayCompTypeOptionalMethods = ['refresh'];
const overlayCompType = (name: string): ComponentType => ({ name, optionalMethods: overlayCompTypeOptionalMethods });

type OverlayCompType =
    | 'agLoadingOverlay'
    | 'agNoRowsOverlay'
    | 'agNoMatchingRowsOverlay'
    | 'agExportingOverlay'
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

const CustomOverlayDef: Readonly<OverlayDef> = {
    id: 'activeOverlay',
    comp: overlayCompType('activeOverlay'),
    wrapperCls: 'ag-overlay-modal-wrapper',
    exclusive: true,
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
            ],
            (params) => this.onPropChange(new Set(params.changeSet?.properties))
        );
    }

    public override destroy(): void {
        this.doHideOverlay();
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
        const gos = this.gos;
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

        await this.doShowOverlay(desiredDef);

        // ensure the overlay has a chance to be painted
        await new Promise<void>((resolve) => setTimeout(() => resolve()));

        const shownAt = Date.now();
        // start the heavy operation (allow sync or promise)
        heavyOperation();

        // We apply a minimum show time of 300ms to avoid fast exports having a flicker of the overlay
        const elapsed = Date.now() - shownAt;
        const remaining = Math.max(0, 300 - elapsed);
        if (remaining > 0) {
            setTimeout(() => this.updateOverlay(false), remaining);
        } else {
            this.updateOverlay(false);
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

    private onPropChange(changedProps: ReadonlySet<string>): void {
        const activeOverlayChanged = changedProps.has('activeOverlay');
        if (activeOverlayChanged || changedProps.has('loading')) {
            if (this.updateOverlay(activeOverlayChanged)) {
                return; // overlay changed, no need to check further
            }
        }

        const currentDef = this.currentDef;
        const activeOverlay = this.eWrapper?.activeOverlay;
        if (activeOverlay && currentDef) {
            const paramsKey = currentDef.paramsKey;
            const activeOverlayParamsChanged = changedProps.has('activeOverlayParams');
            if (
                activeOverlayParamsChanged ||
                changedProps.has('overlayComponentParams') ||
                (paramsKey && changedProps.has(paramsKey))
            ) {
                const overlayCompType = activeOverlayParamsChanged ? undefined : currentDef.overlayType;
                activeOverlay.refresh?.(
                    this.makeCompParams(currentDef.id === 'activeOverlay', paramsKey, overlayCompType)
                );
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

        if (desiredDef !== null && desiredDef !== CustomOverlayDef) {
            // Check if we need to change overlay based on the overlayComponent prop
            const overlayComponent = gos.get('overlayComponent') || gos.get('overlayComponentSelector');
            if (overlayComponent) {
                // userComponentFactory will warn if component missing
                const compDetails = this.beans.userCompFactory.getCompDetailsFromGridOptions(
                    { name: 'overlayComponent', optionalMethods: ['refresh'] },
                    undefined,
                    this.makeCompParams(false, desiredDef.paramsKey, desiredDef.overlayType)
                );
                if (compDetails) {
                    desiredDef = { ...desiredDef, overriddenComp: compDetails };
                }
            }
        }
        return desiredDef;
    }

    private getOverlayDef(): OverlayDef | null {
        const { gos, beans } = this;
        const { colModel, rowModel } = beans;

        const loading = gos.get('loading');

        const loadingDefined = loading !== undefined;

        if (loadingDefined) {
            this.disableInitialOverlay();
            if (loading) {
                return LoadingOverlayDef;
            }
        } else if (this.showInitialOverlay) {
            if (
                !this.isDisabled(LoadingOverlayDef) &&
                (!gos.get('columnDefs') || !colModel.ready || !gos.get('rowData'))
            ) {
                // if no columns or no row data, we show the initial loading overlay
                return LoadingOverlayDef;
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

        this.currentDef = componentDef;

        const exclusive = !!componentDef.exclusive;
        this.exclusive = exclusive;

        // Prefer overlay-specific params if provided (e.g. loadingOverlayComponentParams
        // or noRowsOverlayComponentParams). Fall back to legacy component option presence
        // (e.g. loadingOverlayComponent) or finally to activeOverlayParams.
        let legacyParamsKey: keyof GridOptions | undefined;
        if (
            (componentDef.paramsKey && gos.get(componentDef.paramsKey)) ||
            (componentDef.compKey && gos.get(componentDef.compKey))
        ) {
            legacyParamsKey = componentDef.paramsKey;
        }

        const compDetails =
            componentDef.overriddenComp ??
            beans.userCompFactory.getCompDetailsFromGridOptions(
                componentDef.comp,
                componentDef === CustomOverlayDef ? undefined : componentDef.id,
                this.makeCompParams(componentDef.id === 'activeOverlay', legacyParamsKey, componentDef.overlayType),
                false
            );

        const promise = compDetails?.newAgStackInstance() ?? null;
        const mountedPromise: AgPromise<IOverlayComp | undefined> = this.eWrapper
            ? this.eWrapper.showOverlay(promise, componentDef.wrapperCls, exclusive)
            : AgPromise.resolve();
        this.eWrapper?.refreshWrapperPadding();
        this.setExclusive(exclusive);

        return mountedPromise;
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
        if (this.currentDef) {
            this.currentDef = null;
            changed = true;
        }
        this.exclusive = false;
        const eWrapper = this.eWrapper;
        if (eWrapper) {
            eWrapper.hideOverlay();
            eWrapper.refreshWrapperPadding();
            this.setExclusive(false);
        }
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
