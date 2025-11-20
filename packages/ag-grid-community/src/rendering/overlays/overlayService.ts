import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { GridOptions } from '../../entities/gridOptions';
import type { GridOptionsService } from '../../gridOptionsService';
import { _addGridCommonParams, _isClientSideRowModel, _isServerSideRowModel } from '../../gridOptionsUtils';
import type { ComponentType, UserCompDetails } from '../../interfaces/iUserCompDetails';
import { _warn } from '../../validation/logging';
import type { ComponentSelector } from '../../widgets/component';
import type { AgGridOverlayType } from './overlayComponent';
import { OverlayWrapperComponent, OverlayWrapperSelector } from './overlayWrapperComponent';

const overlayCompTypeOptionalMethods = ['refresh'];
const overlayCompType = (name: string): ComponentType => ({ name, optionalMethods: overlayCompTypeOptionalMethods });

type OverlayDef = Readonly<{
    id: AgGridOverlayType | 'activeOverlay' | 'overlayComponent';
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
    comp: overlayCompType('loadingOverlayComponent'),
    wrapperCls: 'ag-overlay-loading-wrapper',
    exclusive: true,
    compKey: 'loadingOverlayComponent',
    paramsKey: 'loadingOverlayComponentParams',
    isSuppressed: (gos: GridOptionsService) => {
        const isLoading = gos.get('loading');
        return isLoading === false || (gos.get('suppressLoadingOverlay') === true && isLoading !== true);
    },
};

const NoRowsOverlayDef: OverlayDef = {
    id: 'agNoRowsOverlay',
    comp: overlayCompType('noRowsOverlayComponent'),
    wrapperCls: 'ag-overlay-no-rows-wrapper',
    compKey: 'noRowsOverlayComponent',
    paramsKey: 'noRowsOverlayComponentParams',
    isSuppressed: (gos: GridOptionsService) => gos.get('suppressNoRowsOverlay'),
};

const CustomOverlayDef: Readonly<OverlayDef> = {
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
        this.doShowOverlay(NoRowsOverlayDef);
    }

    public hideOverlay(): void {
        const gos = this.gos;
        this.showInitialOverlay = false;
        if (gos.get('loading')) {
            _warn(99);
            return;
        }
        if (gos.get('activeOverlay')) {
            _warn(296);
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
            const activeOverlayParamsChanged = changedProps.has('activeOverlayParams');
            if (
                activeOverlayParamsChanged ||
                changedProps.has('overlayComponentParams') ||
                (paramsKey && changedProps.has(paramsKey))
            ) {
                const defaultOverlay = !activeOverlayParamsChanged ? currentDef.id : undefined;
                activeOverlay.refresh?.(
                    this.makeCompParams(currentDef.id === 'activeOverlay', paramsKey, defaultOverlay)
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

        let desiredDef = this.getOverlayDef();

        if (desiredDef !== null && desiredDef !== CustomOverlayDef) {
            // Check if we need to change overlay based on the overlayComponent prop
            const gos = this.gos;
            const overlayComponent = gos.get('overlayComponent') || gos.get('overlayComponentSelector');
            if (overlayComponent) {
                // userComponentFactory will warn if component missing
                const compDetails = this.beans.userCompFactory.getCompDetailsFromGridOptions(
                    { name: 'overlayComponent', optionalMethods: ['refresh'] },
                    undefined,
                    this.makeCompParams(false, desiredDef.paramsKey, desiredDef.id)
                );
                if (compDetails) {
                    desiredDef = { ...desiredDef, overriddenComp: compDetails };
                }
            }
        }

        const currentDef = this.currentDef;
        const shouldReload = desiredDef === CustomOverlayDef && activeOverlayChanged;

        if (desiredDef !== currentDef) {
            if (!desiredDef) {
                this.showInitialOverlay = false;
                if (currentDef === NoRowsOverlayDef && this.serverSide && !this.isDisabled(NoRowsOverlayDef)) {
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
        } else if (this.showInitialOverlay && !this.isDisabled(LoadingOverlayDef)) {
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
        if (activeOverlayDef) {
            return activeOverlayDef;
        }

        if (this.clientSide && !this.isDisabled(NoRowsOverlayDef) && this.beans.rowModel.isEmpty()) {
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

        const compDetails =
            componentDef.overriddenComp ??
            beans.userCompFactory.getCompDetailsFromGridOptions(
                componentDef.comp,
                componentDef === CustomOverlayDef ? undefined : componentDef.id,
                this.makeCompParams(componentDef.id === 'activeOverlay', legacyParamsKey, componentDef.id),
                false,
                true
            );

        const promise = compDetails?.newAgStackInstance() ?? null;
        this.eWrapper?.showOverlay(promise, componentDef.wrapperCls, exclusive);
        this.eWrapper?.refreshWrapperPadding();
        this.setExclusive(exclusive);
    }

    private makeCompParams(
        includeActiveOverlayParams: boolean,
        legacyParamsKey?: keyof GridOptions,
        defaultOverlay?: string
    ): any {
        const { gos } = this.beans;

        const params = includeActiveOverlayParams
            ? gos.get('activeOverlayParams')
            : {
                  ...((legacyParamsKey && gos.get(legacyParamsKey)) || null),
                  ...gos.get('overlayComponentParams'),
                  defaultOverlay,
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

    private isDisabled(def: OverlayDef) {
        const gos = this.gos;

        const suppressOverlays = gos.get('suppressOverlays') || [];
        const viaSuppressOverlays = suppressOverlays.includes(def.id as string);

        if (viaSuppressOverlays) {
            return true;
        }

        return def.isSuppressed?.(gos) === true;
    }
}
