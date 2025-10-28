import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { GridOptions } from '../../entities/gridOptions';
import { _addGridCommonParams, _isClientSideRowModel, _isServerSideRowModel } from '../../gridOptionsUtils';
import type { ComponentType } from '../../interfaces/iUserCompDetails';
import { _warn } from '../../validation/logging';
import type { ComponentSelector } from '../../widgets/component';
import { OverlayWrapperComponent, OverlayWrapperSelector } from './overlayWrapperComponent';

const overlayCompTypeOptionalMethods = ['refresh'];
const newOverlayCompType = (name: string): ComponentType => ({ name, optionalMethods: overlayCompTypeOptionalMethods });

interface OverlayDef {
    id: 'agLoadingOverlay' | 'agNoRowsOverlay' | 'activeOverlay';
    comp: ComponentType;
    wrapperCls: string;
    exclusive?: boolean;
    compKey?: keyof GridOptions;
    paramsKey?: keyof GridOptions;
    suppressKey?: keyof GridOptions;
}

const LoadingOverlayDef: OverlayDef = {
    id: 'agLoadingOverlay',
    comp: newOverlayCompType('loadingOverlayComponent'),
    wrapperCls: 'ag-overlay-loading-wrapper',
    exclusive: true,
    compKey: 'loadingOverlayComponent',
    paramsKey: 'loadingOverlayComponentParams',
    suppressKey: 'suppressLoadingOverlay',
};

const NoRowsOverlayDef: OverlayDef = {
    id: 'agNoRowsOverlay',
    comp: newOverlayCompType('noRowsOverlayComponent'),
    wrapperCls: 'ag-overlay-no-rows-wrapper',
    compKey: 'noRowsOverlayComponent',
    paramsKey: 'noRowsOverlayComponentParams',
    suppressKey: 'suppressNoRowsOverlay',
};

const CustomOverlayDef: OverlayDef = {
    id: 'activeOverlay',
    comp: newOverlayCompType('activeOverlay'),
    wrapperCls: 'ag-overlay-custom-wrapper',
};

export class OverlayService extends BeanStub implements NamedBean {
    beanName = 'overlays' as const;

    public eWrapper: OverlayWrapperComponent | undefined = undefined;

    private exclusive: boolean = false;
    private oldExclusive: boolean = false;
    private currentDef: OverlayDef | null = null;
    private showInitialOverlay: boolean = true;
    private wrapperPadding: number = 0;

    public isExclusive(): boolean {
        return this.exclusive;
    }

    public postConstruct(): void {
        const updateOverlayVisibility = () => this.updateOverlay(false);

        this.addManagedEventListeners({
            newColumnsLoaded: updateOverlayVisibility,
            rowDataUpdated: updateOverlayVisibility,
            gridSizeChanged: this.refreshWrapperPadding.bind(this),
            rowCountReady: () => {
                // Support hiding the initial overlay when data is set via transactions.
                this.showInitialOverlay = false;
                updateOverlayVisibility();
            },
        });

        this.addManagedPropertyListeners(
            [
                'loading',
                'activeOverlay',
                'activeOverlayParams',
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

    public setOverlayWrapperComp(overlayWrapperComp: OverlayWrapperComponent | undefined): void {
        this.eWrapper = overlayWrapperComp;
        if (overlayWrapperComp) {
            this.updateOverlay(false);
        }
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
        if (this.isSuppressed(LoadingOverlayDef, false)) {
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
        if (
            !this.eWrapper ||
            gos.get('activeOverlay') ||
            gos.get('loading') ||
            this.isSuppressed(NoRowsOverlayDef, false)
        ) {
            return;
        }
        this.doShowOverlay(NoRowsOverlayDef);
    }

    public hideOverlay(): void {
        this.showInitialOverlay = false;
        if (this.gos.get('loading')) {
            _warn(99);
            return;
        }
        if (this.gos.get('activeOverlay')) {
            _warn(293);
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

    private onPropChange(changedProps: ReadonlySet<string>): void {
        const activeOverlayChanged = changedProps.has('activeOverlay');
        if (activeOverlayChanged || changedProps.has('loading')) {
            if (this.updateOverlay(activeOverlayChanged)) {
                return; // overlay changed, no need to check further
            }
        }

        const currentDef = this.currentDef;
        const activeOverlay = this.eWrapper?.activeOverlay;
        if (!activeOverlay || !currentDef) {
            return;
        }
        const gos = this.gos;
        const legacyParamsKey = this.currentDef?.paramsKey;
        if (changedProps.has('activeOverlayParams') || (legacyParamsKey && changedProps.has(legacyParamsKey))) {
            let params = legacyParamsKey && gos.get(legacyParamsKey);
            if (params === undefined) {
                params = gos.get('activeOverlayParams');
            }
            this.eWrapper?.activeOverlay?.refresh?.(_addGridCommonParams(gos, { ...params }));
        }
    }

    private updateOverlay(activeOverlayChanged: boolean): boolean {
        const { gos, beans, eWrapper, currentDef } = this;
        if (!eWrapper) {
            this.currentDef = null;
            return false;
        }

        let loading = gos.get('loading');

        const clientSide = _isClientSideRowModel(gos);
        if (loading !== undefined) {
            this.showInitialOverlay = false; // If loading is defined, we don't show the initial overlay.
        } else if (this.showInitialOverlay && !this.isSuppressed(LoadingOverlayDef, false)) {
            loading = !gos.get('columnDefs') || !beans.colModel.ready || (!gos.get('rowData') && clientSide);
        }

        if (loading) {
            if (this.isSuppressed(LoadingOverlayDef, true)) {
                return currentDef === LoadingOverlayDef && this.doHideOverlay();
            }
            if (currentDef === LoadingOverlayDef) {
                return false;
            }
            this.doShowOverlay(LoadingOverlayDef);
            return true;
        }

        this.showInitialOverlay = false;

        const activeOverlay = gos.get('activeOverlay');
        if (activeOverlay) {
            let newDef = CustomOverlayDef;
            if (activeOverlay === 'agLoadingOverlay') {
                newDef = LoadingOverlayDef;
            } else if (activeOverlay === 'agNoRowsOverlay') {
                newDef = NoRowsOverlayDef;
            }
            const suppressed = this.isSuppressed(newDef, true);
            if (suppressed) {
                return this.doHideOverlay();
            }
            if (!activeOverlayChanged && currentDef === newDef) {
                return false;
            }
            if (activeOverlayChanged) {
                eWrapper.hideOverlay();
            }
            this.doShowOverlay(newDef);
            return true;
        }

        if (clientSide && beans.rowModel.isEmpty() && !this.isSuppressed(NoRowsOverlayDef, false)) {
            if (currentDef === NoRowsOverlayDef) {
                return false;
            }
            this.doShowOverlay(NoRowsOverlayDef);
            return true;
        }

        if (
            currentDef === LoadingOverlayDef ||
            currentDef === CustomOverlayDef ||
            (currentDef && (clientSide || !_isServerSideRowModel(gos)))
        ) {
            return this.doHideOverlay();
        }
        return false;
    }

    /**
     * Show an overlay requested by name or by built-in types.
     * This single function replaces the previous three helpers and handles
     * param selection and wrapper class choice for loading / no-rows and custom overlays.
     */
    private doShowOverlay(componentDef: OverlayDef): void {
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

        let params = legacyParamsKey ? gos.get(legacyParamsKey) : undefined;
        if (params === undefined) {
            params = gos.get('activeOverlayParams');
        }
        const compDetails = beans.userCompFactory.getCompDetailsFromGridOptions(
            componentDef.comp,
            componentDef !== CustomOverlayDef ? componentDef.id : undefined,
            _addGridCommonParams(gos, { ...params })
        );

        const promise = compDetails?.newAgStackInstance() ?? null;
        this.eWrapper?.showOverlay(promise, componentDef.wrapperCls, exclusive);
        this.refreshWrapperPadding();
        this.updateBlocking(exclusive);
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
            this.updateBlocking(false);
        }
        return changed;
    }

    private updateBlocking(blocking: boolean): void {
        if (this.oldExclusive !== blocking) {
            this.oldExclusive = blocking;
            this.eventSvc.dispatchEvent({ type: 'overlayExclusiveChanged' });
        }
    }

    private refreshWrapperPadding(): void {
        const eWrapper = this.eWrapper;
        if (!eWrapper) {
            return;
        }

        let newPadding: number = 0;

        if (this.currentDef && !this.oldExclusive) {
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

    private isSuppressed(def: OverlayDef, forced: boolean) {
        if (!forced) {
            const suppressKey = def.suppressKey;
            if (suppressKey && this.gos.get(suppressKey)) {
                return true;
            }
        }
        const components = this.gos.get('components');
        if (!components) {
            return false;
        }
        const comp = components[def.id];
        return def.compKey ? comp === false : comp !== undefined && !comp;
    }
}
