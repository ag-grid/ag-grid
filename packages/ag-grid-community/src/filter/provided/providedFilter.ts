import type { AgColumn } from '../../entities/agColumn';
import type { ContainerType, IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
import type { FilterDisplayParams, IDoesFilterPassParams, IFilterComp } from '../../interfaces/iFilter';
import type { PopupEventParams } from '../../interfaces/iPopup';
import { PositionableFeature } from '../../rendering/features/positionableFeature';
import { _setDisabled } from '../../utils/dom';
import { _debounce } from '../../utils/function';
import { AgPromise } from '../../utils/promise';
import type { ComponentSelector } from '../../widgets/component';
import { Component, RefPlaceholder } from '../../widgets/component';
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

    protected applyActive = false;
    private hidePopup: ((params: PopupEventParams) => void) | null | undefined = null;
    // a debounce of the onBtApply method
    private onBtApplyDebounce: () => void;
    private debouncePending = false;

    private positionableFeature: PositionableFeature | undefined;

    /** @deprecated TODO */
    private readonly eFilterBody: HTMLElement = RefPlaceholder;

    constructor(private readonly filterNameKey: keyof typeof FILTER_LOCALE_TEXT) {
        super();
    }

    protected abstract updateUiVisibility(): void;

    protected abstract createBodyTemplate(): string;
    protected abstract getAgComponents(): ComponentSelector[];
    protected abstract getCssIdentifier(): string;
    protected abstract setModelIntoUi(model: M | null, isInitialLoad?: boolean): AgPromise<void>;
    protected abstract areModelsEqual(a: M, b: M): boolean;

    /** Used to get the filter type for filter models. */
    public abstract readonly filterType: 'text' | 'number' | 'date' | 'set' | 'multi';

    public postConstruct(): void {
        this.resetTemplate(); // do this first to create the DOM
        this.createManagedBean(
            new ManagedFocusFeature(this.getFocusableElement(), {
                handleKeyDown: this.handleKeyDown.bind(this),
            })
        );

        this.positionableFeature = new PositionableFeature(this.getPositionableElement(), {
            forcePopupParentAsOffsetParent: true,
        });

        this.createBean(this.positionableFeature);
    }

    // override
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected handleKeyDown(e: KeyboardEvent): void {}

    public abstract getModelFromUi(): M | null;

    public init(legacyParams: ProvidedFilterParams): void {
        const params = legacyParams as unknown as P;
        this.setParams(params);

        this.initModel(params.model).then(() => {
            this.setupOnBtApplyDebounce();
        });
    }

    public refresh(legacyNewParams: ProvidedFilterParams): boolean {
        const newParams = legacyNewParams as unknown as P;
        const oldParams = this.params;

        this.params = newParams;

        const source = newParams.source;

        if (source === 'ui') {
            // don't need to do anything
            return true;
        }

        const updateModel = () =>
            this.resetUiToActiveModel(
                newParams.model,
                () => {
                    this.updateUiVisibility();
                    this.setupOnBtApplyDebounce();
                },
                source === 'evaluator'
            );

        if (source !== 'colDef') {
            // just the model has changed
            updateModel();
            return true;
        }

        this.updateParams(newParams, oldParams).then(updateModel);

        return true;
    }

    /** Called on init only. Override in subclasses */
    protected setParams(params: P): void {
        this.params = params;
        this.commonUpdateParams(params);
    }

    /** Called on refresh only. Override in subclasses */
    protected updateParams(newParams: P, oldParams: P): AgPromise<void> {
        this.commonUpdateParams(newParams, oldParams);
        return AgPromise.resolve();
    }

    private commonUpdateParams(newParams: P, _oldParams?: P): void {
        this.applyActive = isUseApplyButton(newParams);
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        const { getEvaluator, model } = this.params;
        return getEvaluator().doesFilterPass({ ...params, model });
    }

    public getFilterTitle(): string {
        return this.translate(this.filterNameKey);
    }

    public isFilterActive(): boolean {
        return this.params.model != null;
    }

    protected resetTemplate(paramsMap?: any) {
        const templateString = /* html */ `
                <div class="ag-filter-body-wrapper ag-${this.getCssIdentifier()}-body-wrapper" data-ref="eFilterBody">
                    ${this.createBodyTemplate()}
                </div>`;

        this.setTemplate(templateString, this.getAgComponents(), paramsMap);
    }

    protected isReadOnly(): boolean {
        return !!this.params.readOnly;
    }

    // subclasses can override this to provide alternative debounce defaults
    protected defaultDebounceMs: number = 0;

    private setupOnBtApplyDebounce(): void {
        const debounceMs = getDebounceMs(this.params, this.defaultDebounceMs);
        const debounceFunc = _debounce(this, this.checkApplyDebounce.bind(this), debounceMs);
        this.onBtApplyDebounce = () => {
            this.debouncePending = true;
            debounceFunc();
        };
    }

    private checkApplyDebounce(): void {
        if (this.debouncePending) {
            // May already have been applied, so don't apply again (e.g. closing filter before debounce timeout)
            this.debouncePending = false;
            this.onBtApply();
        }
    }

    public getModel(): M | null {
        return this.params.model;
    }

    public setModel(model: M | null): AgPromise<void> {
        const { beans, params } = this;
        return beans.colFilter!.setModelForColumnLegacy(params.column as AgColumn, model);
    }

    private initModel(model: M | null): AgPromise<void> {
        const promise = this.setModelIntoUi(model ?? null, true);

        return promise.then(() => {
            this.updateUiVisibility();

            // we set the model from the GUI, rather than the provided model,
            // so the model is consistent, e.g. handling of null/undefined will be the same,
            // or if model is case-insensitive, then casing is removed.
            this.doApplyModel('api');
        });
    }

    private onBtCancel(e: Event): void {
        this.resetUiToActiveModel(this.getModel(), () => {
            this.handleCancelEnd(e);
        });
    }

    protected handleCancelEnd(e: Event): void {
        if (this.params.closeOnApply) {
            this.close(e);
        }
    }

    protected resetUiToActiveModel(
        currentModel: M | null,
        afterUiUpdatedFunc?: () => void,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        fromEvaluator?: boolean
    ): void {
        const afterAppliedFunc = () => {
            this.onUiChanged(false, 'prevent');

            afterUiUpdatedFunc?.();
        };

        this.setModelIntoUi(currentModel ?? null).then(afterAppliedFunc);
    }

    private onBtClear(): void {
        this.setModelIntoUi(null).then(() => this.onUiChanged());
    }

    private onBtReset(): void {
        this.onBtClear();
        this.onBtApply();
    }

    /**
     * Applies changes made in the UI to the filter, and returns true if the model has changed.
     */
    public applyModel(source: 'api' | 'ui' | 'rowDataUpdated' = 'api'): boolean {
        return this.doApplyModel(source).changed;
    }

    protected doApplyModel(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        source: 'api' | 'ui' | 'rowDataUpdated' = 'api'
    ): { changed: boolean; model: M | null } {
        const newModel = this.getModelFromUi();

        if (!this.canApply(newModel!)) {
            return { changed: false, model: null };
        }

        const previousModel = this.params.model;

        // models can be same if user pasted same content into text field, or maybe just changed the case
        // and it's a case insensitive filter
        return { changed: !this.areModelsEqual(previousModel!, newModel!), model: newModel };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected canApply(model: M): boolean {
        return true;
    }

    protected onBtApply(afterFloatingFilter = false, afterDataChange = false, e?: Event): void {
        // Prevent form submission
        if (e) {
            e.preventDefault();
        }
        const { changed, model } = this.doApplyModel(afterDataChange ? 'rowDataUpdated' : 'ui');

        if (changed) {
            // the floating filter uses 'afterFloatingFilter' info, so it doesn't refresh after filter changed if change
            // came from floating filter
            this.params.onModelChange(model, { afterFloatingFilter, afterDataChange });
        }

        const { closeOnApply } = this.params;

        // only close if an apply button is visible, otherwise we'd be closing every time a change was made!
        if (closeOnApply && this.applyActive && !afterFloatingFilter && !afterDataChange) {
            this.close(e);
        }
    }

    public onNewRowsLoaded(): void {}

    public close(e?: Event): void {
        if (!this.hidePopup) {
            return;
        }

        const keyboardEvent = e as KeyboardEvent;
        const key = keyboardEvent && keyboardEvent.key;
        let params: PopupEventParams;

        if (key === 'Enter' || key === 'Space') {
            params = { keyboardEvent };
        }

        this.hidePopup(params!);
        this.hidePopup = null;
    }

    /**
     * By default, if the change came from a floating filter it will be applied immediately, otherwise if there is no
     * apply button it will be applied after a debounce, otherwise it will not be applied at all. This behaviour can
     * be adjusted by using the apply parameter.
     */
    protected onUiChanged(fromFloatingFilter = false, apply?: 'immediately' | 'debounce' | 'prevent'): void {
        this.updateUiVisibility();
        this.params.onStateChange({
            model: this.getModelFromUi(),
        });
        this.params.onUiChange(this.getUiChangeEventParams());

        if (this.applyActive && !this.isReadOnly()) {
            const isValid = this.canApply(this.getModelFromUi()!);
            const applyFilterButton = this.queryForHtmlElement(`[data-ref="applyFilterButton"]`);
            if (applyFilterButton) {
                _setDisabled(applyFilterButton, !isValid);
            }
        }

        if ((fromFloatingFilter && !apply) || apply === 'immediately') {
            this.onBtApply(fromFloatingFilter);
        } else if ((!this.applyActive && !apply) || apply === 'debounce') {
            this.onBtApplyDebounce();
        }
    }

    protected getUiChangeEventParams(): any {
        return undefined;
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        if (params) {
            this.hidePopup = params.hidePopup;
        }

        this.refreshFilterResizer(params?.container);
    }

    private refreshFilterResizer(containerType?: ContainerType): void {
        // tool panel is scrollable, so don't need to size
        const { positionableFeature, gos } = this;
        if (!positionableFeature || containerType === 'toolPanel') {
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
        this.hidePopup = null;

        if (this.positionableFeature) {
            this.positionableFeature = this.destroyBean(this.positionableFeature);
        }

        super.destroy();
    }

    protected translate(key: keyof typeof FILTER_LOCALE_TEXT): string {
        return this.getLocaleTextFunc()(key, FILTER_LOCALE_TEXT[key]);
    }

    // override to control positionable feature
    protected getPositionableElement(): HTMLElement {
        return this.getGui();
    }
}
