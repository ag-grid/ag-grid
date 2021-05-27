import { GridBodyComp } from "../gridBodyComp/gridBodyComp";
import { Logger, LoggerFactory } from "../logger";
import { Autowired } from "../context/context";
import { Component } from "../widgets/component";
import { ISideBar } from "../interfaces/iSideBar";
import { RefSelector } from "../widgets/componentAnnotations";
import { ManagedFocusComponent } from "../widgets/managedFocusComponent";
import { ColumnModel } from "../columns/columnModel";
import { addCssClass, addOrRemoveCssClass, isVisible } from "../utils/dom";
import { last } from "../utils/array";
import { FocusService } from "../focusService";
import { GridCtrl, IGridComp } from "./gridCtrl";
import { LayoutCssClasses, UpdateLayoutClassesParams } from "../styling/layoutFeature";

export class GridComp extends ManagedFocusComponent {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;

    @RefSelector('gridBody') private gridBodyComp: GridBodyComp;
    @RefSelector('sideBar') private sideBarComp: ISideBar & Component;
    @RefSelector('rootWrapperBody') private eRootWrapperBody: HTMLElement;

    private logger: Logger;
    private eGridDiv: HTMLElement;
    private ctrl: GridCtrl;

    constructor(eGridDiv: HTMLElement) {
        super(undefined, true);
        this.eGridDiv = eGridDiv;
    }

    protected postConstruct(): void {
        this.logger = this.loggerFactory.create('GridComp');

        const compProxy: IGridComp = {
            destroyGridUi:
                () => this.destroyBean(this),
            setRtlClass:
                (cssClass: string) => addCssClass(this.getGui(), cssClass),
            addOrRemoveKeyboardFocusClass:
                (addOrRemove: boolean) => this.addOrRemoveCssClass(FocusService.AG_KEYBOARD_FOCUS, addOrRemove),
            forceFocusOutOfContainer: this.forceFocusOutOfContainer.bind(this),
            updateLayoutClasses: this.updateLayoutClasses.bind(this),
            getFocusableContainers: this.getFocusableContainers.bind(this)
        };

        this.ctrl = this.createManagedBean(new GridCtrl());

        const template = this.createTemplate();
        this.setTemplate(template);

        this.ctrl.setComp(compProxy, this.eGridDiv, this.getGui());

        this.insertGridIntoDom();

        super.postConstruct();
    }

    private insertGridIntoDom(): void {
        const eGui = this.getGui();
        this.eGridDiv.appendChild(eGui);
        this.addDestroyFunc(() => {
            this.eGridDiv.removeChild(eGui);
            this.logger.log('Grid removed from DOM');
        });
    }

    private updateLayoutClasses(params: UpdateLayoutClassesParams): void {
        addOrRemoveCssClass(this.eRootWrapperBody, LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        addOrRemoveCssClass(this.eRootWrapperBody, LayoutCssClasses.NORMAL, params.normal);
        addOrRemoveCssClass(this.eRootWrapperBody, LayoutCssClasses.PRINT, params.print);

        this.addOrRemoveCssClass(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        this.addOrRemoveCssClass(LayoutCssClasses.NORMAL, params.normal);
        this.addOrRemoveCssClass(LayoutCssClasses.PRINT, params.print);
    }

    private createTemplate(): string {
        const dropZones = this.ctrl.showDropZones() ? '<ag-grid-header-drop-zones></ag-grid-header-drop-zones>' : '';
        const sideBar = this.ctrl.showSideBar() ? '<ag-side-bar ref="sideBar"></ag-side-bar>' : '';
        const statusBar = this.ctrl.showStatusBar() ? '<ag-status-bar ref="statusBar"></ag-status-bar>' : '';
        const watermark = this.ctrl.showWatermark() ? '<ag-watermark></ag-watermark>' : '';

        const template = /* html */
            `<div ref="eRootWrapper" class="ag-root-wrapper">
                ${dropZones}
                <div class="ag-root-wrapper-body" ref="rootWrapperBody">
                    <ag-grid-body ref="gridBody"></ag-grid-body>
                    ${sideBar}
                </div>
                ${statusBar}
                <ag-pagination></ag-pagination>
                ${watermark}
            </div>`;

        return template;
    }

    public getFocusableElement(): HTMLElement {
        return this.eRootWrapperBody;
    }

    protected getFocusableContainers(): HTMLElement[] {
        const focusableContainers = [
            this.gridBodyComp.getGui()
        ];

        if (this.sideBarComp) {
            focusableContainers.push(
                this.sideBarComp.getGui()
            );
        }

        return focusableContainers.filter(el => isVisible(el));
    }

    protected focusInnerElement(fromBottom?: boolean): boolean {
        const focusableContainers = this.getFocusableContainers();

        if (fromBottom) {
            if (focusableContainers.length > 1) {
                return this.focusService.focusInto(last(focusableContainers));
            }

            const lastColumn = last(this.columnModel.getAllDisplayedColumns());
            if (this.focusService.focusGridView(lastColumn, true)) { return true; }
        }

        return this.ctrl.focusGridHeader();
    }

    protected onTabKeyDown(): void { }
}
