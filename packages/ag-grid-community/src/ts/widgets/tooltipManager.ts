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

type TooltipTarget = CellComp | HeaderWrapperComp | HeaderGroupWrapperComp;

@Bean('tooltipManager')
export class TooltipManager {

    // really this should be using eGridDiv, not sure why it's not working.
    // maybe popups in the future should be parent to the body??
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('componentRecipes') private componentRecipes: ComponentRecipes;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    // map if compId to [tooltip component, close function]
    private registeredComponents: { [key: string]: {comp: Component | undefined, destroyFunc: () => void | undefined} } = {};

    public registerTooltip(cmp: TooltipTarget, el: HTMLElement): void {
        cmp.addDestroyableEventListener(el, 'mouseover', (e) => this.showTooltip(e, cmp));
        cmp.addDestroyableEventListener(el, 'mouseout', (e) => this.hideTooltip(e, cmp));
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

    private hideTooltip(e: MouseEvent, cmp: TooltipTarget): void {
        const id = cmp.getCompId();
        const registeredComp = this.registeredComponents[id];
        if (!registeredComp || !registeredComp.destroyFunc) { return; }

        registeredComp.destroyFunc();
        delete registeredComp.comp;
    }
}