import type { AgColumn } from '../../entities/agColumn';
import type { ContainerType, IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
import type {
    FilterDisplayParams,
    FilterDisplayState,
    IDoesFilterPassParams,
    IFilterComp,
} from '../../interfaces/iFilter';
import { PositionableFeature } from '../../rendering/features/positionableFeature';
import type { ElementParams } from '../../utils/dom';
import { _debounce } from '../../utils/function';
import type { AgPromise } from '../../utils/promise';
import type { ComponentSelector } from '../../widgets/component';
import { Component } from '../../widgets/component';
import { ManagedFocusFeature } from '../../widgets/managedFocusFeature';
import { FILTER_LOCALE_TEXT } from '../filterLocaleText';
import { getDebounceMs, isUseApplyButton } from '../floating/provided/providedFilterUtils';
import type {
    IProvidedFilter,
    IProvidedFilterParams,
    ProvidedFilterModel,
    ProvidedFilterParams,
} from './iProvidedFilter';

/** temporary type until `ProvidedFilterParams` is updated as breaking change */
type ProvidedFilterDisplayParams<M extends ProvidedFilterModel> = IProvidedFilterParams &
    FilterDisplayParams<any, any, M>;

/**
 * Contains common logic to all provided filters (apply button, clear button, etc).
 * All the filters that come with AG Grid extend this class. User filters do not
 * extend this class.
 *
 * @param M type of filter-model managed by the concrete sub-class that extends this type
 * @param V type of value managed by the concrete sub-class that extends this type
 */
export abstract class ProvidedFilter<
        M extends ProvidedFilterModel,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        V,
        P extends ProvidedFilterDisplayParams<M> = ProvidedFilterDisplayParams<M>,
    >
    extends Component
    implements IProvidedFilter, IFilterComp
{
    protected params: P;

    private applyActive = false;
    // a debounce of the apply method
    private applyDebounced: () => void;
    private debouncePending = false;
    protected state: FilterDisplayState<M>;

    private positionableFeature: PositionableFeature | undefined;

    constructor(
        private readonly filterNameKey: keyof typeof FILTER_LOCALE_TEXT,
        private readonly cssIdentifier: string
    ) {
        super();
    }

    protected abstract updateUiVisibility(): void;

    protected abstract createBodyTemplate(): ElementParams | null;
    protected abstract getAgComponents(): ComponentSelector[];
    protected abstract setModelIntoUi(model: M | null, isInitialLoad?: boolean): AgPromise<void>;
    protected abstract areNonNullModelsEqual(a: M, b: M): boolean;

    /** Used to get the filter type for filter models. */
    public abstract readonly filterType: 'text' | 'number' | 'date' | 'set' | 'multi';

    public postConstruct(): void {
        const element: ElementParams = {
            tag: 'div',
            cls: `ag-filter-body-wrapper ag-${this.cssIdentifier}-body-wrapper`,
            children: [this.createBodyTemplate()],
        };
        this.setTemplate(element, this.getAgComponents());
        this.createManagedBean(
            new ManagedFocusFeature(this.getFocusableElement(), {
                handleKeyDown: this.handleKeyDown.bind(this),
            })
        );

        this.positionableFeature = this.createBean(
            new PositionableFeature(this.getPositionableElement(), {
                forcePopupParentAsOffsetParent: true,
            })
        );
    }

    protected handleKeyDown(_e: KeyboardEvent): void {}

    public abstract getModelFromUi(): M | null;

    public init(legacyParams: ProvidedFilterParams): void {
        const params = legacyParams as unknown as P;
        this.setParams(params);

        this.setModelIntoUi(params.state.model, true).then(() => this.updateUiVisibility());
    }

    public refresh(legacyNewParams: ProvidedFilterParams): boolean {
        const newParams = legacyNewParams as unknown as P;
        const oldParams = this.params;

        this.params = newParams;

        const source = newParams.source;

        if (source === 'colDef') {
            this.updateParams(newParams, oldParams);
        }

        const newState = newParams.state;
        const oldState = this.state;
        this.state = newState;

        if (newState.model !== oldState.model || newState.state !== oldState.state) {
            this.setModelIntoUi(newState.model);
        }

        return true;
    }

    /** Called on init only. Override in subclasses */
    protected setParams(params: P): void {
        this.params = params;
        this.state = params.state;
        this.commonUpdateParams(params);
    }

    /** Called on refresh only. Override in subclasses */
    protected updateParams(newParams: P, oldParams: P): void {
        this.commonUpdateParams(newParams, oldParams);
    }

    private commonUpdateParams(newParams: P, _oldParams?: P): void {
        this.applyActive = isUseApplyButton(newParams);
        this.setupApplyDebounced();
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        const { getHandler, model, column } = this.params;
        return getHandler().doesFilterPass({
            ...params,
            model: model!,
            handlerParams: this.beans.colFilter!.getHandlerParams(column)!,
        });
    }

    public getFilterTitle(): string {
        return this.translate(this.filterNameKey);
    }

    public isFilterActive(): boolean {
        return this.params.model != null;
    }

    // subclasses can override this to provide alternative debounce defaults
    protected defaultDebounceMs: number = 0;

    private setupApplyDebounced(): void {
        const debounceMs = getDebounceMs(this.params, this.defaultDebounceMs);
        const debounceFunc = _debounce(this, this.checkApplyDebounce.bind(this), debounceMs);
        this.applyDebounced = () => {
            this.debouncePending = true;
            debounceFunc();
        };
    }

    private checkApplyDebounce(): void {
        if (this.debouncePending) {
            // May already have been applied, so don't apply again (e.g. closing filter before debounce timeout)
            this.debouncePending = false;
            this.doApplyModel();
        }
    }

    public getModel(): M | null {
        return this.params.model;
    }

    public setModel(model: M | null): AgPromise<void> {
        const { beans, params } = this;
        return beans.colFilter!.setModelForColumnLegacy(params.column as AgColumn, model);
    }

    /**
     * Applies changes made in the UI to the filter, and returns true if the model has changed.
     */
    public applyModel(_source: 'api' | 'ui' | 'rowDataUpdated' = 'api'): boolean {
        return this.doApplyModel();
    }

    protected canApply(_model: M | null): boolean {
        return true;
    }

    private doApplyModel(additionalEventAttributes?: any): boolean {
        const { params, state } = this;
        const changed = !this.areModelsEqual(params.model, state.model);
        if (changed) {
            params.onAction('apply', additionalEventAttributes);
        }
        return changed;
    }

    public onNewRowsLoaded(): void {}

    /**
     * By default, if the change came from a floating filter it will be applied immediately, otherwise if there is no
     * apply button it will be applied after a debounce, otherwise it will not be applied at all. This behaviour can
     * be adjusted by using the apply parameter.
     */
    protected onUiChanged(apply?: 'immediately' | 'debounce' | 'prevent', afterFloatingFilter = false): void {
        this.updateUiVisibility();
        const model = this.getModelFromUi();
        const state = {
            model,
            state: this.getState(),
            valid: this.canApply(model),
        };
        this.state = state;
        const params = this.params;
        params.onStateChange(state);
        params.onUiChange(this.getUiChangeEventParams());

        apply ??= this.applyActive ? undefined : 'debounce';
        if (apply === 'immediately') {
            this.doApplyModel({ afterFloatingFilter, afterDataChange: false });
        } else if (apply === 'debounce') {
            this.applyDebounced();
        }
    }

    protected getState(): any {
        return undefined;
    }

    protected getUiChangeEventParams(): any {
        return undefined;
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        this.refreshFilterResizer(params?.container);
    }

    private refreshFilterResizer(containerType?: ContainerType): void {
        // tool panel is scrollable, so don't need to size
        const { positionableFeature, gos } = this;
        if (!positionableFeature) {
            return;
        }

        const isResizable = containerType === 'floatingFilter' || containerType === 'columnFilter';

        if (isResizable) {
            positionableFeature.restoreLastSize();
            positionableFeature.setResizable(
                gos.get('enableRtl')
                    ? { bottom: true, bottomLeft: true, left: true }
                    : { bottom: true, bottomRight: true, right: true }
            );
        } else {
            positionableFeature.removeSizeFromEl();
            positionableFeature.setResizable(false);
        }
        positionableFeature.constrainSizeToAvailableHeight(true);
    }

    public afterGuiDetached(): void {
        this.checkApplyDebounce();

        this.positionableFeature?.constrainSizeToAvailableHeight(false);
    }

    public override destroy(): void {
        this.positionableFeature = this.destroyBean(this.positionableFeature);

        super.destroy();
    }

    protected translate(key: keyof typeof FILTER_LOCALE_TEXT): string {
        return this.getLocaleTextFunc()(key, FILTER_LOCALE_TEXT[key]);
    }

    // override to control positionable feature
    protected getPositionableElement(): HTMLElement {
        return this.getGui();
    }

    private areModelsEqual(a: M | null, b: M | null): boolean {
        // same or both missing
        if (a === b || (a == null && b == null)) {
            return true;
        }

        // one is missing, other present
        if (a == null || b == null) {
            return false;
        }

        return this.areNonNullModelsEqual(a, b);
    }
}
