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

interface RegisteredComponent {
    tooltipComp?: Component;
    destroyFunc?: () => void;
}

@Bean('tooltipManager')
export class TooltipManager {

    @Autowired('popupService') private popupService: PopupService;
    @Autowired('componentRecipes') private componentRecipes: ComponentRecipes;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    private readonly DEFAULT_HIDE_TOOLTIP_TIMEOUT = 10000;
    private readonly MOUSEOUT_HIDE_TOOLTIP_TIMEOUT = 1000;
    private readonly MOUSEOVER_SHOW_TOOLTIP_TIMEOUT = 2000;

    private showTimer: number = 0;
    private hideTimer: number = 0;
    private activeComponent: TooltipTarget | undefined;
    private lastHoveredComponent: TooltipTarget | undefined;

    // map of compId to [tooltip component, close function]
    private registeredComponents: { [key: string]: RegisteredComponent } = {};

    public registerTooltip(targetCmp: TooltipTarget): void {
        const el = targetCmp.getGui();
        const id = targetCmp.getCompId();

        targetCmp.addDestroyableEventListener(el, 'mouseover', (e) => this.processMouseOver(e, targetCmp));
        targetCmp.addDestroyableEventListener(el, 'mousedown', this.hideTooltip.bind(this));
        targetCmp.addDestroyableEventListener(el, 'mouseout', this.processMouseOut.bind(this));

        this.registeredComponents[id] = { tooltipComp: undefined, destroyFunc: undefined };
        targetCmp.addDestroyFunc(() => this.unregisterTooltip(targetCmp));
    }

    private unregisterTooltip(targetCmp: TooltipTarget): void {
        const id = targetCmp.getCompId();

        if (this.activeComponent === targetCmp) {
            this.hideTooltip();
        }
        delete this.registeredComponents[id];
    }

    private processMouseOver(e: MouseEvent, targetCmp: TooltipTarget) {
        let delay = this.MOUSEOVER_SHOW_TOOLTIP_TIMEOUT;

        if (this.activeComponent) {
            if (this.lastHoveredComponent === this.activeComponent) { return; }
            delay = 0;
            this.hideTooltip();
        }

        this.clearTimers();
        if (this.lastHoveredComponent === targetCmp) { return; }

        this.lastHoveredComponent = targetCmp;
        this.showTimer = window.setTimeout(this.showTooltip.bind(this), delay, e);
    }

    private processMouseOut(e: MouseEvent) {
        const activeComponent = this.activeComponent;
        const relatedTarget = e.relatedTarget as HTMLElement;

        if (!activeComponent) {
            if (this.lastHoveredComponent && !this.lastHoveredComponent.getGui().contains(relatedTarget)) {
                this.lastHoveredComponent = undefined;
            }
            this.clearTimers();
            return;
        }

        if (activeComponent.getGui().contains(relatedTarget)) {
            return;
        }

        const registedComponent = this.registeredComponents[activeComponent.getCompId()];
        _.addCssClass(registedComponent.tooltipComp.getGui(), 'ag-tooltip-hiding');
        this.lastHoveredComponent = undefined;
        this.clearTimers();
        this.hideTimer = window.setTimeout(this.hideTooltip.bind(this), this.MOUSEOUT_HIDE_TOOLTIP_TIMEOUT);
    }

    private showTooltip(e: MouseEvent): void {
        const targetCmp = this.lastHoveredComponent;
        const cell = targetCmp as CellComp;
        const registedComponent = this.registeredComponents[targetCmp.getCompId()];

        const params: ITooltipParams = {
            colDef: targetCmp.getComponentHolder(),
            rowIndex: cell.getGridCell && cell.getGridCell().rowIndex,
            column: cell.getColumn && cell.getColumn(),
            api: this.gridApi,
            columnApi: this.columnApi,
            value: targetCmp.getTooltipText()
        };

        this.createTooltipComponent(params, registedComponent, e);
        this.activeComponent = this.lastHoveredComponent;
        this.hideTimer = window.setTimeout(this.hideTooltip.bind(this), this.DEFAULT_HIDE_TOOLTIP_TIMEOUT);
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

    hideTooltip(): void {
        const activeComponent = this.activeComponent;

        this.clearTimers();
        if (!activeComponent) { return; }

        const id = activeComponent.getCompId();
        const registedComponent = this.registeredComponents[id];

        this.activeComponent = undefined;

        if (!registedComponent) { return; }
        if (registedComponent.destroyFunc) {
            registedComponent.destroyFunc();
        }
        this.clearRegisteredComponent(registedComponent);
    }

    clearRegisteredComponent(registedComponent: RegisteredComponent) {
        delete registedComponent.destroyFunc;
        delete registedComponent.tooltipComp;
    }

    clearTimers(): void {
        if (this.hideTimer) {
            window.clearTimeout(this.hideTimer);
        }

        if (this.showTimer) {
            window.clearTimeout(this.showTimer);
        }

        this.showTimer = this.hideTimer = 0;
    }
}
