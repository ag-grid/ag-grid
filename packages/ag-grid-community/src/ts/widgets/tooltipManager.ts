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

interface RegisteredComponents {
    tooltipComp?: Component;
    destroyFunc?: () => void;
    config?: TooltipConfig;
}
@Bean('tooltipManager')
export class TooltipManager {

    // really this should be using eGridDiv, not sure why it's not working.
    // maybe popups in the future should be parent to the body??
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('componentRecipes') private componentRecipes: ComponentRecipes;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    private showTimer: number = 0;
    private hideTimer: number = 0;
    private activeComponent: TooltipTarget | undefined;

    // map if compId to [tooltip component, close function]
    private registeredComponents: { [key: string]: RegisteredComponents } = {};

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

        if (tooltipComp.destroy) {
            tooltipComp.destroy();
        }

        delete this.registeredComponents[id];
    }

    private processMouseOver(e: MouseEvent, targetCmp: TooltipTarget): void {
        if (this.hideTimer) {
            window.clearInterval(this.hideTimer);
            this.hideTooltip();
            this.showTooltip(e, targetCmp);
        } else {
            this.showTimer = window.setTimeout(this.showTooltip.bind(this), 2000, e, targetCmp);
        }
    }

    private processMouseOut(): void {
        if (this.showTimer) {
            window.clearTimeout(this.showTimer);
            this.showTimer = 0;
            return;
        }
        if (this.hideTimer) {
            window.clearInterval(this.hideTimer);
            this.hideTimer = 0;
        }
        if (this.activeComponent) {
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

        const colDef = targetCmp.getComponentHolder();
        const cell = (targetCmp as CellComp);
        let rowIndex;
        let column;

        if (cell.getGridCell) {
            rowIndex = cell.getGridCell().rowIndex;
        }
        if (cell.getColumn) {
            column = cell.getColumn();
        }

        const params: ITooltipParams = {
            colDef,
            rowIndex,
            column,
            api: this.gridApi,
            columnApi: this.columnApi,
            value: targetCmp.getTooltipText()
        };

        this.componentRecipes.newTooltipComponent(params).then(tooltipComp => {
            const tooltip = registeredComp.tooltipComp = tooltipComp;
            const eGui = tooltip.getGui();

            const closeFnc = this.popupService.addPopup(false, eGui, false)
            registeredComp.destroyFunc = () => {
                closeFnc();
                if(tooltip.destroy) {
                    tooltip.destroy();
                }
            }

            this.popupService.positionPopupUnderMouseEvent({
                type: 'tooltip',
                mouseEvent: e,
                ePopup: eGui
            });
        });
    }

    private hideTooltip(): void {
        const cmp = this.activeComponent;

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
