import { Autowired, Bean } from "../context/context";
import { Component } from "./component";
import { PopupService } from "./popupService";
import { ComponentRecipes } from "../components/framework/componentRecipes";
import { DynamicComponentParams } from "../components/framework/componentResolver";
import { ColumnApi } from "../columnController/columnApi";
import { GridApi } from "../gridApi";
import { CellComp } from "../rendering/cellComp";
import { HeaderWrapperComp } from "../headerRendering/header/headerWrapperComp";
import { HeaderGroupWrapperComp } from "../headerRendering/headerGroup/headerGroupWrapperComp";
import { _ } from "../utils";

type TooltipTarget = CellComp | HeaderWrapperComp | HeaderGroupWrapperComp;

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
    private registeredComponents: { [key: string]: {comp: Component | undefined, destroyFunc: () => void | undefined} } = {};

    public registerTooltip(cmp: TooltipTarget, el: HTMLElement): void {
        cmp.addDestroyableEventListener(el, 'mouseover', (e) => {
            if (this.hideTimer) {
                window.clearInterval(this.hideTimer);
                this.hideTimer = 0;
                this.hideTooltip();
                this.showTooltip(e, cmp);
            } else {
                this.showTimer = window.setTimeout(this.showTooltip.bind(this), 2000, e, cmp);
            }
        });

        cmp.addDestroyableEventListener(el, 'mouseout', (e) => {
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
        });

        this.registeredComponents[cmp.getCompId()] = { comp: undefined, destroyFunc: undefined };
    }

    public unregisterTooltip(cmp: TooltipTarget): void {
        const id = cmp.getCompId();
        const registeredComp = this.registeredComponents[id];
        const tooltipComp = registeredComp.comp;

        if (!tooltipComp) { return; }

        if (registeredComp.destroyFunc) {
            registeredComp.destroyFunc();
        }

        tooltipComp.destroy();
        delete this.registeredComponents[id];
    }

    private showTooltip(e: MouseEvent, cmp: TooltipTarget): void {
        const id = cmp.getCompId();
        const registeredComp = this.registeredComponents[id];

        this.activeComponent = cmp;
        this.showTimer = 0;
        this.hideTimer = window.setTimeout(this.hideTooltip.bind(this), 10000);

        if (!registeredComp.comp) {
            const colDef = cmp.getComponentHolder();
            const cell = (cmp as CellComp);
            let rowIndex;
            let column;

            if (cell.getGridCell) {
                rowIndex = cell.getGridCell().rowIndex;
            }
            if (cell) {
                column = cell.getColumn();
            }

            const params: DynamicComponentParams = {
                colDef,
                rowIndex,
                column,
                api: this.gridApi,
                columnApi: this.columnApi,
                data: cmp.getGui().getAttribute('data-tooltip')
            };

            this.componentRecipes.newTooltipComponent(params).then(cmp => {
                registeredComp.comp = cmp;
                registeredComp.destroyFunc = this.popupService.addPopup(false, registeredComp.comp.getGui(), false);

                this.popupService.positionPopupUnderMouseEvent({
                    type: 'tooltip',
                    mouseEvent: e,
                    ePopup: registeredComp.comp.getGui()
                });
            });
        }
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
        delete registeredComp.comp;
    }
}