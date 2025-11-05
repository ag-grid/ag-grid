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

const getOverlayDef = (activeOverlay: any): OverlayDef | null => {
    if (!activeOverlay) {
        return null;
    }
    if (activeOverlay === 'agLoadingOverlay') {
        return LoadingOverlayDef;
    }
    if (activeOverlay === 'agNoRowsOverlay') {
        return NoRowsOverlayDef;
    }
    return CustomOverlayDef;
};

export class OverlayService extends BeanStub implements NamedBean {
    beanName = 'overlays' as const;

    public eWrapper: OverlayWrapperComponent | undefined = undefined;

    public exclusive: boolean = false;
    private oldExclusive: boolean = false;
    private currentDef: OverlayDef | null = null;
    private showInitialOverlay: boolean = true;
    private clientSide: boolean = false;
    private serverSide: boolean = false;

    public postConstruct(): void {
        const gos = this.gos;
        this.clientSide = _isClientSideRowModel(gos);
        this.serverSide = _isServerSideRowModel(gos);

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
        const eWrapper = this.eWrapper;
        if (!eWrapper) {
            this.currentDef = null;
            return false;
        }

        const desiredDef = this.getOverlayDef();

        const currentDef = this.currentDef;
        const shouldReload = desiredDef === CustomOverlayDef && activeOverlayChanged;

        if (desiredDef !== currentDef) {
            if (!desiredDef) {
                this.showInitialOverlay = false;
                if (currentDef === NoRowsOverlayDef && this.serverSide && !this.isSuppressed(NoRowsOverlayDef)) {
                    return false;
                }
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
            this.showInitialOverlay = false;
        }

        return false;
    }

    private getOverlayDef(): OverlayDef | null {
        const gos = this.gos;
        const loading = gos.get('loading');

        const loadingDefined = loading !== undefined;

        if (loadingDefined) {
            this.showInitialOverlay = false;
            if (loading && !this.isDisabled(LoadingOverlayDef)) {
                return LoadingOverlayDef;
            }
        } else if (this.showInitialOverlay && !this.isSuppressed(LoadingOverlayDef)) {
            const needsInitialLoadingOverlay =
                !gos.get('columnDefs') || !this.beans.colModel.ready || (this.clientSide && !gos.get('rowData'));

            if (needsInitialLoadingOverlay) {
                return LoadingOverlayDef;
            }
            this.showInitialOverlay = false;
        } else {
            this.showInitialOverlay = false;
        }

        const activeOverlayDef = getOverlayDef(this.gos.get('activeOverlay'));
        if (activeOverlayDef && !this.isDisabled(activeOverlayDef)) {
            return activeOverlayDef;
        }

        if (this.clientSide && !this.isSuppressed(NoRowsOverlayDef) && this.beans.rowModel.isEmpty()) {
            return NoRowsOverlayDef;
        }

        return null;
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
            componentDef === CustomOverlayDef ? undefined : componentDef.id,
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
