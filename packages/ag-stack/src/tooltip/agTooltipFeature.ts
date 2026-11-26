import { AgAbstractBean } from '../core/agAbstractBean';
import type { AgBeanCollection } from '../interfaces/agBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { ICommonSource } from '../interfaces/iEvent';
import type { IPropertiesService } from '../interfaces/iProperties';
import type { ITooltipFeature, TooltipCtrl, TooltipDetails } from '../interfaces/iTooltip';
import type { BaseTooltipParams, BaseTooltipStateManager } from './baseTooltipStateManager';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class AgTooltipFeature<
    TBeanCollection extends AgBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties> & ICommonSource<TCommon>,
    TTooltipParams extends BaseTooltipParams<TLocation>,
    TTooltipCtrlParams extends TooltipDetails<TLocation>,
    TLocation extends string,
>
    extends AgAbstractBean<TBeanCollection, TProperties, TGlobalEvents, TPropertiesService>
    implements ITooltipFeature
{
    private tooltip: any;

    private tooltipManager:
        | BaseTooltipStateManager<
              TBeanCollection,
              TProperties,
              TGlobalEvents,
              TCommon,
              TPropertiesService,
              TTooltipParams,
              TTooltipCtrlParams,
              TLocation
          >
        | undefined;
    private browserTooltips: boolean;
    private browserTooltipActive = false;
    private eventSource?: HTMLElement;
    private removeSourceListeners?: () => void;

    constructor(
        private readonly ctrl: TooltipCtrl<TLocation, TTooltipCtrlParams>,
        beans?: TBeanCollection
    ) {
        super();

        if (beans) {
            this.preWireBeans(beans);
        }
    }

    public postConstruct() {
        this.refreshTooltip();
    }

    private setupSourceListeners(): void {
        if (!this.ctrl.control && !this.ctrl.getTextElement) {
            return;
        }
        const source = this.ctrl.getGui();
        if (this.eventSource === source && !!this.removeSourceListeners === this.browserTooltips) {
            return;
        }
        if (!this.eventSource && this.ctrl.control) {
            this.addManagedPropertyListeners(['suppressBuiltInTooltips', 'enableBrowserTooltips'], () =>
                this.refreshTooltip()
            );
        }
        this.removeSourceListeners?.();
        this.removeSourceListeners = undefined;
        this.eventSource = source;
        this.browserTooltipActive = false;
        if (!this.browserTooltips) {
            return;
        }
        let observer: MutationObserver | undefined;
        const removeListeners = this.addManagedListeners(source, {
            mouseenter: () => {
                if (this.browserTooltips) {
                    this.browserTooltipActive = true;
                    this.refreshTooltip();
                    if (this.ctrl.getTextElement) {
                        // Frameworks can commit text after refreshTooltip; observe only the hovered native source.
                        observer ??= new MutationObserver(() => this.refreshBrowserTooltip());
                        observer.observe(source, { childList: true, characterData: true, subtree: true });
                    }
                }
            },
            mouseleave: () => {
                this.browserTooltipActive = false;
                observer?.disconnect();
            },
        });
        this.removeSourceListeners = () => {
            observer?.disconnect();
            for (const remove of removeListeners) {
                remove();
            }
        };
    }

    private refreshBrowserTooltip(): void {
        const tooltip = this.getLatestTooltip();
        if (tooltip.requiresTruncation && !this.browserTooltipActive) {
            this.setBrowserTooltip('', true);
            return;
        }
        const hidden =
            (this.ctrl.control || this.ctrl.getTextElement) && this.ctrl.shouldDisplayTooltip?.(tooltip) === false;
        // An empty title also prevents a nested source from inheriting an ancestor's tooltip.
        this.setBrowserTooltip(hidden ? '' : tooltip.value, !!this.ctrl.getTextElement);
    }

    /**
     *
     * @param tooltip The tooltip value
     * @param allowEmptyString Set it to true to allow the title to be set to `''`. This is necessary
     * when the browser adds a default tooltip the element and the tooltip service will be displayed
     * next to a browser tooltip causing confusion.
     */
    private setBrowserTooltip(tooltip: string | null, allowEmptyString?: boolean): void {
        const name = 'title';
        const eGui = this.ctrl.getGui();

        if (!eGui) {
            return;
        }

        if (tooltip != null && (tooltip != '' || allowEmptyString)) {
            eGui.setAttribute(name, tooltip);
        } else {
            eGui.removeAttribute(name);
        }
    }

    private readonly getLatestTooltip = (): TTooltipCtrlParams => {
        const tooltip = { value: this.tooltip, ...this.ctrl.getTooltip?.() } as TTooltipCtrlParams;
        if (this.ctrl.control) {
            tooltip.params = { ...tooltip.params, control: this.ctrl.control };
        }
        return tooltip;
    };

    private createTooltipFeatureIfNeeded(): void {
        if (this.tooltipManager == null) {
            const tooltipManager = this.beans.registry.createDynamicBean<
                BaseTooltipStateManager<
                    TBeanCollection,
                    TProperties,
                    TGlobalEvents,
                    TCommon,
                    TPropertiesService,
                    TTooltipParams,
                    TTooltipCtrlParams,
                    TLocation
                >
            >('tooltipStateManager', true, this.ctrl, this.getLatestTooltip);
            if (tooltipManager) {
                this.tooltipManager = this.createBean(tooltipManager, this.beans.context);
            }
        }
    }

    public attemptToShowTooltip(): void {
        this.tooltipManager?.prepareToShowTooltip();
    }

    public attemptToHideTooltip(): void {
        this.tooltipManager?.hideTooltip();
    }

    public showTooltipOnFocus(): void {
        this.tooltipManager?.showTooltipOnFocus();
    }

    protected setTooltipFocused(focused: boolean): void {
        this.tooltipManager?.setFocused(focused);
    }

    public setTooltipAndRefresh(tooltip: any): void {
        this.tooltip = tooltip;
        this.refreshTooltip();
    }

    protected areBuiltInTooltipsSuppressed(): boolean {
        return !!this.gos.get('suppressBuiltInTooltips');
    }

    public refreshTooltip(clearWithEmptyString?: boolean): void {
        this.browserTooltips = this.beans.gos.get('enableBrowserTooltips')!;
        if (!this.eventSource || this.browserTooltips || this.removeSourceListeners) {
            this.setupSourceListeners();
        }

        if (this.ctrl.control && this.areBuiltInTooltipsSuppressed()) {
            this.setBrowserTooltip(null);
            this.tooltipManager = this.destroyBean(this.tooltipManager, this.beans.context);
            return;
        }

        // a tooltip on screen renders the value, component and params it was shown with; this refresh
        // means any of them may have moved on, and none can be updated in place, so take it down
        const tooltipManager = this.tooltipManager;
        tooltipManager?.refreshTooltip();

        if (this.browserTooltips) {
            this.refreshBrowserTooltip();
            this.tooltipManager = this.destroyBean(this.tooltipManager, this.beans.context);
        } else {
            this.setBrowserTooltip(clearWithEmptyString ? '' : null, clearWithEmptyString);
            this.createTooltipFeatureIfNeeded();
        }
    }

    public override destroy() {
        this.removeSourceListeners?.();
        this.setBrowserTooltip(null);
        this.tooltipManager = this.destroyBean(this.tooltipManager, this.beans.context);
        super.destroy();
    }
}
