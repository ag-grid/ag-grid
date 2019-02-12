import { Autowired, Bean } from "../context/context";
import { Component } from "./component";
import { PopupService } from "./popupService";
import { ComponentRecipes } from "../components/framework/componentRecipes";
import { ColumnApi } from "../columnController/columnApi";
import { GridApi } from "../gridApi";
import { CellComp } from "../rendering/cellComp";
import { HeaderWrapperComp } from "../headerRendering/header/headerWrapperComp";
import { HeaderGroupWrapperComp } from "../headerRendering/headerGroup/headerGroupWrapperComp";
import { ITooltipParams } from "../rendering/tooltipComponent";
import { _ } from "../utils";

type TooltipTarget = CellComp | HeaderWrapperComp | HeaderGroupWrapperComp;

interface TooltipConfig {
    autoHide?: boolean | undefined;
    fadeOnHide?: boolean | undefined;
}

interface RegisteredComponent {
    tooltipComp?: Component;
    destroyFunc?: () => void;
    config?: TooltipConfig;
}

@Bean('tooltipManager')
export class TooltipManager {

    @Autowired('popupService') private popupService: PopupService;
    @Autowired('componentRecipes') private componentRecipes: ComponentRecipes;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    private showTimer: number = 0;
    private hideTimer: number = 0;
    private activeComponent: TooltipTarget | undefined;

    // map of compId to [tooltip component, close function, tooltipConfig]
    // TODO: implement tooltip configs
    private registeredComponents: { [key: string]: RegisteredComponent } = {};

    public registerTooltip(targetCmp: TooltipTarget, el: HTMLElement, config?: TooltipConfig): void {
        targetCmp.addDestroyableEventListener(el, 'mouseover', (e) => this.processMouseOver(e, targetCmp));
        targetCmp.addDestroyableEventListener(el, 'mouseout', this.processMouseOut.bind(this));

        this.registeredComponents[targetCmp.getCompId()] = { tooltipComp: undefined, destroyFunc: undefined, config };
    }

    public unregisterTooltip(cmp: TooltipTarget): void {
        const id = cmp.getCompId();
        const registeredComp = this.registeredComponents[id];
        const tooltipComp = registeredComp.tooltipComp;

        if (!tooltipComp) { return; }

        if (registeredComp.destroyFunc) {
            registeredComp.destroyFunc();
        }

        delete this.registeredComponents[id];
    }

    public getActiveTooltip(): Component | undefined {
        const cmp = this.activeComponent;

        if (!cmp) { return; }

        const id = cmp.getCompId();
        const registeredComp = this.registeredComponents[id];

        return registeredComp.tooltipComp;
    }

    private processMouseOver(e: MouseEvent, targetCmp: TooltipTarget): void {
        // if a hideTimer is present it means we are currently showing a tooltip
        // so hide the currentTooltip and display the new tooltip without delay
        if (this.hideTimer) {
            window.clearTimeout(this.hideTimer);
            this.hideTooltip();
            this.showTooltip(e, targetCmp);
        } else {
            this.showTimer = window.setTimeout(this.showTooltip.bind(this), 2000, e, targetCmp);
        }
    }

    private processMouseOut(): void {
        // if showTimer is present means we left the target
        // before the tooltip was displayed
        if (this.showTimer) {
            window.clearTimeout(this.showTimer);
            this.showTimer = 0;
            return;
        }
        // on mouseOut we should also cancel the default 10 seconds hideTimer
        if (this.hideTimer) {
            window.clearTimeout(this.hideTimer);
            this.hideTimer = 0;
        }
        if (this.activeComponent) {
            const activeTooltip = this.getActiveTooltip();

            if (activeTooltip) {
                _.addCssClass(activeTooltip.getGui(), 'ag-tooltip-hiding');
            }

            this.hideTimer = window.setTimeout(this.hideTooltip.bind(this), 1000);
        }
    }

    private showTooltip(e: MouseEvent, targetCmp: TooltipTarget): void {
        const id = targetCmp.getCompId();
        const registeredComp = this.registeredComponents[id];

        this.activeComponent = targetCmp;
        this.showTimer = 0;
        this.hideTimer = window.setTimeout(this.hideTooltip.bind(this), 10000);

        if (registeredComp.tooltipComp) { return; }

        const cell = (targetCmp as CellComp);

        const params: ITooltipParams = {
            colDef: targetCmp.getComponentHolder(),
            rowIndex: cell.getGridCell && cell.getGridCell().rowIndex,
            column: cell.getColumn && cell.getColumn(),
            api: this.gridApi,
            columnApi: this.columnApi,
            value: targetCmp.getTooltipText()
        };

        this.createTooltipComponent(params, registeredComp, e);
    }

    private createTooltipComponent(params: ITooltipParams, cmp: RegisteredComponent, e: MouseEvent): void {
        this.componentRecipes.newTooltipComponent(params).then(tooltipComp => {
            const tooltip = cmp.tooltipComp = tooltipComp;
            const eGui = tooltip.getGui();

            const closeFnc = this.popupService.addPopup(false, eGui, false);
            cmp.destroyFunc = () => {
                closeFnc();
                if (tooltip.destroy) {
                    tooltip.destroy();
                }
            };

            this.popupService.positionPopupUnderMouseEvent({
                type: 'tooltip',
                mouseEvent: e,
                ePopup: eGui
            });
        });
    }

    private hideTooltip(): void {
        const cmp = this.activeComponent;

        // this is needed in case hideTooltip gets manually called
        // and we need to cancel the default 10 seconds timer.
        if (this.hideTimer) {
            window.clearTimeout(this.hideTimer);
        }

        this.hideTimer = 0;
        if (!cmp) { return; }

        const id = cmp.getCompId();
        const registeredComp = this.registeredComponents[id];
        this.activeComponent = undefined;

        if (!registeredComp || !registeredComp.destroyFunc) { return; }

        registeredComp.destroyFunc();
        delete registeredComp.tooltipComp;
    }
}
