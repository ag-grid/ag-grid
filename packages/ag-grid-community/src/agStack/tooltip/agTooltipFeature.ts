import { AgBeanStub } from '../core/agBeanStub';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IPropertiesService } from '../interfaces/iProperties';
import type { ITooltipFeature, TooltipCtrl } from '../interfaces/iTooltip';
import type { BaseTooltipParams, BaseTooltipStateManager } from './baseTooltipStateManager';

export class AgTooltipFeature<
        TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
        TProperties extends BaseProperties,
        TGlobalEvents extends BaseEvents,
        TCommon,
        TPropertiesService extends IPropertiesService<TProperties, TCommon>,
        TTooltipParams extends BaseTooltipParams<TLocation>,
        TTooltipCtrlParams,
        TLocation extends string,
    >
    extends AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>
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

    constructor(
        private readonly ctrl: TooltipCtrl<TLocation, TTooltipCtrlParams>,
        beans?: TBeanCollection
    ) {
        super();

        if (beans) {
            this.beans = beans;
        }
    }

    public postConstruct() {
        this.refreshTooltip();
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

    private updateTooltipText(): void {
        const { getTooltipValue } = this.ctrl;
        if (getTooltipValue) {
            this.tooltip = getTooltipValue();
        }
    }

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
            >('tooltipStateManager', true, this.ctrl, () => this.tooltip);
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

    public setTooltipAndRefresh(tooltip: any): void {
        this.tooltip = tooltip;
        this.refreshTooltip();
    }

    public refreshTooltip(clearWithEmptyString?: boolean): void {
        this.browserTooltips = this.beans.gos.get('enableBrowserTooltips')!;
        this.updateTooltipText();

        if (this.browserTooltips) {
            this.setBrowserTooltip(this.tooltip);
            this.tooltipManager = this.destroyBean(this.tooltipManager, this.beans.context);
        } else {
            this.setBrowserTooltip(clearWithEmptyString ? '' : null, clearWithEmptyString);
            this.createTooltipFeatureIfNeeded();
        }
    }

    public override destroy() {
        this.tooltipManager = this.destroyBean(this.tooltipManager, this.beans.context);
        super.destroy();
    }
}
