import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { GridOptions } from '../../entities/gridOptions';
import { _isClientSideRowModel, _isServerSideRowModel } from '../../gridOptionsUtils';
import type { ComponentType } from '../../interfaces/iUserCompDetails';
import { _warn } from '../../validation/logging';
import type { ComponentSelector } from '../../widgets/component';
import { OverlayWrapperComponent, OverlayWrapperSelector } from './overlayWrapperComponent';

const overlayCompTypeOptionalMethods = ['refresh'];
const overlayCompType = (name: string): ComponentType => ({ name, optionalMethods: overlayCompTypeOptionalMethods });

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
    comp: overlayCompType('loadingOverlayComponent'),
    wrapperCls: 'ag-overlay-loading-wrapper',
    exclusive: true,
    compKey: 'loadingOverlayComponent',
    paramsKey: 'loadingOverlayComponentParams',
    suppressKey: 'suppressLoadingOverlay',
};

const NoRowsOverlayDef: OverlayDef = {
    id: 'agNoRowsOverlay',
    comp: overlayCompType('noRowsOverlayComponent'),
    wrapperCls: 'ag-overlay-no-rows-wrapper',
    compKey: 'noRowsOverlayComponent',
    paramsKey: 'noRowsOverlayComponentParams',
    suppressKey: 'suppressNoRowsOverlay',
};

const CustomOverlayDef: OverlayDef = {
    id: 'activeOverlay',
    comp: overlayCompType('activeOverlay'),
    wrapperCls: 'ag-overlay-modal-wrapper',
    exclusive: true,
};

export class OverlayService extends BeanStub implements NamedBean {
    beanName = 'overlays' as const;

    public eWrapper: OverlayWrapperComponent | undefined = undefined;

    public exclusive: boolean = false;
    private oldExclusive: boolean = false;
    private currentDef: OverlayDef | null = null;
    private showInitialOverlay: boolean = true;

    public postConstruct(): void {
        const updateOverlayVisibility = () => this.updateOverlay(false);

        this.addManagedEventListeners({
            newColumnsLoaded: updateOverlayVisibility,
            rowDataUpdated: updateOverlayVisibility,
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
        if (this.isSuppressed(LoadingOverlayDef)) {
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
        if (!this.eWrapper || gos.get('activeOverlay') || gos.get('loading') || this.isSuppressed(NoRowsOverlayDef)) {
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
        if (activeOverlay && currentDef) {
            const paramsKey = currentDef.paramsKey;
            if (changedProps.has('activeOverlayParams') || (paramsKey && changedProps.has(paramsKey))) {
                activeOverlay.refresh?.(this.makeCompParams(paramsKey));
            }
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
        } else if (this.showInitialOverlay && !this.isSuppressed(LoadingOverlayDef)) {
            loading = !gos.get('columnDefs') || !beans.colModel.ready || (!gos.get('rowData') && clientSide);
        }

        if (loading) {
            if (this.isDisabled(LoadingOverlayDef)) {
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
            const disabled = this.isDisabled(newDef);
            if (disabled) {
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

        if (clientSide && beans.rowModel.isEmpty() && !this.isSuppressed(NoRowsOverlayDef)) {
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

        const compDetails = beans.userCompFactory.getCompDetailsFromGridOptions(
            componentDef.comp,
            componentDef !== CustomOverlayDef ? componentDef.id : undefined,
            this.makeCompParams(legacyParamsKey),
            false,
            true
        );

        const promise = compDetails?.newAgStackInstance() ?? null;
        this.eWrapper?.showOverlay(promise, componentDef.wrapperCls, exclusive);
        this.eWrapper?.refreshWrapperPadding();
        this.setExclusive(exclusive);
    }

    private makeCompParams(legacyParamsKey?: keyof GridOptions) {
        const { gos, gridApi, gridOptions } = this.beans;
        return {
            ...gos.get('activeOverlayParams'),
            ...((legacyParamsKey && gos.get(legacyParamsKey)) || null),
            api: gridApi,
            context: gridOptions.context,
        };
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

    private isDisabled(def: OverlayDef) {
        const gos = this.gos;
        const compKey = def.compKey;
        const component = (compKey ? gos.get(compKey) : undefined) ?? gos.get('components')?.[def.id];
        return component === false || (compKey && component !== undefined && !component);
    }

    private isSuppressed(def: OverlayDef) {
        const gos = this.gos;
        if (gos.get('activeOverlay') === false) {
            return true; // activeOverlay set to false suppresses all overlays. Loading overlay can be still forced by setting loading=true
        }
        const suppressKey = def.suppressKey;
        return !!(suppressKey && gos.get(suppressKey)) || this.isDisabled(def);
    }
}
