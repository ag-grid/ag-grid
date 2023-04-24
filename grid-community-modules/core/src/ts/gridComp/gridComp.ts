import { GridBodyComp } from "../gridBodyComp/gridBodyComp";
import { Logger, LoggerFactory } from "../logger";
import { Autowired, PostConstruct } from "../context/context";
import { Component } from "../widgets/component";
import { ISideBar } from "../interfaces/iSideBar";
import { RefSelector } from "../widgets/componentAnnotations";
import { isVisible } from "../utils/dom";
import { FocusService } from "../focusService";
import { GridCtrl, IGridComp } from "./gridCtrl";
import { LayoutCssClasses, UpdateLayoutClassesParams } from "../styling/layoutFeature";
import { TabGuardComp } from "../widgets/tabGuardComp";

export class GridComp extends TabGuardComp {

    @Autowired('loggerFactory') private readonly loggerFactory: LoggerFactory;

    @RefSelector('gridBody') private readonly gridBodyComp: GridBodyComp;
    @RefSelector('sideBar') private readonly sideBarComp: ISideBar & Component;
    @RefSelector('rootWrapperBody') private readonly eRootWrapperBody: HTMLElement;

    private logger: Logger;
    private eGridDiv: HTMLElement;
    private ctrl: GridCtrl;

    constructor(eGridDiv: HTMLElement) {
        super();
        this.eGridDiv = eGridDiv;
    }

    @PostConstruct
    private postConstruct(): void {
        this.logger = this.loggerFactory.create('GridComp');

        const compProxy: IGridComp = {
            destroyGridUi:
                () => this.destroyBean(this),
            setRtlClass:
                (cssClass: string) => this.addCssClass(cssClass),
            addOrRemoveKeyboardFocusClass:
                (addOrRemove: boolean) => this.addOrRemoveCssClass(FocusService.AG_KEYBOARD_FOCUS, addOrRemove),
            forceFocusOutOfContainer: this.forceFocusOutOfContainer.bind(this),
            updateLayoutClasses: this.updateLayoutClasses.bind(this),
            getFocusableContainers: this.getFocusableContainers.bind(this),
            setUserSelect: value => {
                this.getGui().style.userSelect = value != null ? value : '';
                this.getGui().style.webkitUserSelect = value != null ? value : '';
            },
            setCursor: value => {
                this.getGui().style.cursor = value != null ? value : '';
            }
        };

        this.ctrl = this.createManagedBean(new GridCtrl());

        const template = this.createTemplate();
        this.setTemplate(template);

        this.ctrl.setComp(compProxy, this.eGridDiv, this.getGui());

        this.insertGridIntoDom();

        this.initialiseTabGuard({
            // we want to override the default behaviour to do nothing for onTabKeyDown
            onTabKeyDown: () => undefined,
            focusInnerElement: fromBottom => this.ctrl.focusInnerElement(fromBottom)
        });
    }

    private insertGridIntoDom(): void {
        const eGui = this.getGui();
        this.eGridDiv.appendChild(eGui);
        this.addDestroyFunc(() => {
            this.eGridDiv.removeChild(eGui);
            this.logger.log('Grid removed from DOM');
        });
    }

    private updateLayoutClasses(cssClass: string, params: UpdateLayoutClassesParams): void {
        const eRootWrapperBodyClassList = this.eRootWrapperBody.classList;
        eRootWrapperBodyClassList.toggle(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        eRootWrapperBodyClassList.toggle(LayoutCssClasses.NORMAL, params.normal);
        eRootWrapperBodyClassList.toggle(LayoutCssClasses.PRINT, params.print);

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
            `<div class="ag-root-wrapper" role="presentation">
                ${dropZones}
                <div class="ag-root-wrapper-body" ref="rootWrapperBody" role="presentation">
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

}
