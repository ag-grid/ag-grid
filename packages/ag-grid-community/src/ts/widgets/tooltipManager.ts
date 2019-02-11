import { Autowired, Bean } from "../context/context";
import { Component } from "./component";
import { PopupService } from "./popupService";
import { ComponentRecipes } from "../components/framework/componentRecipes";
import { ColumnApi } from "../columnController/columnApi";
import { GridApi } from "../gridApi";
import { CellComp } from "../rendering/cellComp";
import { HeaderWrapperComp } from "../headerRendering/header/headerWrapperComp";
import { HeaderGroupWrapperComp } from "../headerRendering/headerGroup/headerGroupWrapperComp";
import { ITooltipParams, TooltipConfig } from "../rendering/tooltipComponent";
import { _ } from "../utils";

type TooltipTarget = CellComp | HeaderWrapperComp | HeaderGroupWrapperComp;

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
    private lastX: number | undefined;
    private lastY: number | undefined;
    private readonly debouncedShow: ((...args: any[]) => void) | undefined;

    // map if compId to [tooltip component, close function]
    private registeredComponents: { [key: string]: RegisteredComponents } = {};

    constructor() {
        this.debouncedShow = _.debounce(this.preProcessShow, 100, true);
    }

    public registerTooltip(targetCmp: TooltipTarget, el: HTMLElement, config?: TooltipConfig): void {
        targetCmp.addDestroyableEventListener(el, 'mouseover', (e) => this.processMouseOver(e, targetCmp));
        targetCmp.addDestroyableEventListener(el, 'mousemove', (e) => this.processMouseMove(e, targetCmp));
        targetCmp.addDestroyableEventListener(el, 'mousedown', () => this.preProcessHide(true));
        targetCmp.addDestroyableEventListener(el, 'mouseout', () => this.preProcessHide());

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
        }
    }

    private processMouseMove(e: MouseEvent, targetCmp: TooltipTarget): void {
        if (!this.exceededThreshold(e)) { return; }
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.debouncedShow(e, targetCmp);
    }

    private preProcessShow(e: MouseEvent, targetCmp: TooltipTarget): void {
        // this method is fired by a debounced mousemove event, so if a previous
        // timer to display the tooltip has been initiated, we have to reset it.
        if (this.showTimer) {
            window.clearInterval(this.showTimer);
            this.showTimer = 0;
        }

        // if a tooltip is already rendered, we just need to re-align
        // it with the mouse cursor otherwise, create a new tooltip
        if (this.activeComponent) {
            const id = this.activeComponent.getCompId();
            this.popupService.positionPopupUnderMouseEvent({
                type: 'tooltip',
                mouseEvent: e,
                ePopup: this.registeredComponents[id].tooltipComp.getGui()
            });
        } else {
            this.showTimer = window.setTimeout(this.showTooltip.bind(this), 2000, e, targetCmp);
        }
    }

    private preProcessHide(now?: boolean): void {
        this.lastX = 0;
        this.lastY = 0;
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
            const id = this.activeComponent.getCompId();
            const tooltipEl = this.registeredComponents[id].tooltipComp.getGui();
            _.addCssClass(tooltipEl, 'ag-tooltip-hiding');
            this.hideTimer = window.setTimeout(this.hideTooltip.bind(this), now ? 0 : 1000);
        }
    }

    private showTooltip(e: MouseEvent, targetCmp: TooltipTarget): void {
        const id = targetCmp.getCompId();
        const registeredComp = this.registeredComponents[id];

        this.activeComponent = targetCmp;
        this.showTimer = 0;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
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
        this.activeComponent = undefined;
        this.lastX = 0;
        this.lastY = 0;

        if (!cmp) { return; }

        const id = cmp.getCompId();
        const registeredComp = this.registeredComponents[id];

        if (!registeredComp || !registeredComp.destroyFunc) { return; }

        registeredComp.destroyFunc();
        delete registeredComp.tooltipComp;
    }

    private exceededThreshold(e: MouseEvent): boolean {
        if (
            (this.lastX == null || this.lastY == null) ||
            (Math.abs(this.lastX - e.clientX) > 50) ||
            (Math.abs(this.lastY - e.clientY) > 10)
        ) {
            return true;
        }

        return false;
    }
}