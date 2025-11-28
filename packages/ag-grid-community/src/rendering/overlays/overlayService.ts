import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { GridOptions } from '../../entities/gridOptions';
import type { GridOptionsService } from '../../gridOptionsService';
import { _addGridCommonParams, _isClientSideRowModel } from '../../gridOptionsUtils';
import type { ComponentType, UserCompDetails } from '../../interfaces/iUserCompDetails';
import { _warn } from '../../validation/logging';
import type { ComponentSelector } from '../../widgets/component';
import type { OverlayType } from './overlayComponent';
import { OverlayWrapperComponent, OverlayWrapperSelector } from './overlayWrapperComponent';

const overlayCompTypeOptionalMethods = ['refresh'];
const overlayCompType = (name: string): ComponentType => ({ name, optionalMethods: overlayCompTypeOptionalMethods });

type OverlayCompType = 'agLoadingOverlay' | 'agNoRowsOverlay' | 'agNoMatchingRowsOverlay' | 'activeOverlay';

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

    public postConstruct(): void {
        const gos = this.gos;
        this.showInitialOverlay = _isClientSideRowModel(gos);

        const updateOverlayVisibility = () => {
            if (this.userForcedNoRows) {
                return;
            }
            this.updateOverlay(false);
        };

        this.addManagedEventListeners({
            newColumnsLoaded: updateOverlayVisibility,
            rowDataUpdated: updateOverlayVisibility,
            rowCountReady: () => {
                // Support hiding the initial overlay when data is set via transactions.
                this.showInitialOverlay = false;
                updateOverlayVisibility();
            },
            modelUpdated: updateOverlayVisibility,
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
        this.userForcedNoRows = true;
        this.doShowOverlay(NoRowsOverlayDef);
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
        this.doHideOverlay();
        if (userHadForced) {
            // if user had forced no-rows overlay, we need to reevaluate what overlay should be shown now if any
            this.updateOverlay(false);
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
                const overlayCompType = !activeOverlayParamsChanged ? currentDef.overlayType : undefined;
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
        const gos = this.gos;

        // Active overlay should take priority over loading=true
        let desiredDef = getActiveOverlayDef(gos.get('activeOverlay'));
        if (!desiredDef) {
            desiredDef = this.getOverlayDef();
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

        const currentDef = this.currentDef;
        const shouldReload = desiredDef === CustomOverlayDef && activeOverlayChanged;

        if (desiredDef !== currentDef) {
            if (!desiredDef) {
                this.showInitialOverlay = false;
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
        const { gos, beans } = this;
        const { colModel, rowModel } = beans;

        const loading = gos.get('loading');

        const loadingDefined = loading !== undefined;

        if (loadingDefined) {
            this.showInitialOverlay = false;
            if (loading) {
                return LoadingOverlayDef;
            }
        } else if (this.showInitialOverlay) {
            if (!gos.get('columnDefs') || !colModel.ready || !gos.get('rowData')) {
                // if no columns or no row data, we show the initial loading overlay
                return LoadingOverlayDef;
            }
            this.showInitialOverlay = false;
        } else {
            this.showInitialOverlay = false;
        }

        // activeOverlay already checked above
        const overlayType = rowModel.getOverlayType();
        return getOverlayDefForType(overlayType);
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
                this.makeCompParams(componentDef.id === 'activeOverlay', legacyParamsKey, componentDef.overlayType),
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

        if (def.overlayType) {
            const viaSuppressOverlays = (gos.get('suppressOverlays') ?? []).includes(def.overlayType);
            if (viaSuppressOverlays) {
                return true;
            }
        }

        return def.isSuppressed?.(gos) === true;
    }
}
