import type { BeanCollection } from '../context/context';
import { GridBodyComp } from '../gridBodyComp/gridBodyComp';
import type { ISideBar } from '../interfaces/iSideBar';
import type { Logger, LoggerFactory } from '../logger';
import { PaginationComp } from '../pagination/paginationComp';
import type { UpdateLayoutClassesParams } from '../styling/layoutFeature';
import { LayoutCssClasses } from '../styling/layoutFeature';
import { _isVisible } from '../utils/dom';
import { type Component, RefPlaceholder } from '../widgets/component';
import { TabGuardComp } from '../widgets/tabGuardComp';
import type { IGridComp } from './gridCtrl';
import { GridCtrl } from './gridCtrl';

export class GridComp extends TabGuardComp {
    private loggerFactory: LoggerFactory;

    public wireBeans(beans: BeanCollection) {
        this.loggerFactory = beans.loggerFactory;
    }

    private readonly gridBody: GridBodyComp = RefPlaceholder;
    private readonly sideBar: ISideBar & Component = RefPlaceholder;
    private readonly rootWrapperBody: HTMLElement = RefPlaceholder;

    private logger: Logger;
    private eGridDiv: HTMLElement;
    private ctrl: GridCtrl;

    constructor(eGridDiv: HTMLElement) {
        super();
        this.eGridDiv = eGridDiv;
    }

    public postConstruct(): void {
        this.logger = this.loggerFactory.create('GridComp');

        const compProxy: IGridComp = {
            destroyGridUi: () => this.destroyBean(this),
            setRtlClass: (cssClass: string) => this.addCssClass(cssClass),
            forceFocusOutOfContainer: this.forceFocusOutOfContainer.bind(this),
            updateLayoutClasses: this.updateLayoutClasses.bind(this),
            getFocusableContainers: this.getFocusableContainers.bind(this),
            setUserSelect: (value) => {
                this.getGui().style.userSelect = value != null ? value : '';
                this.getGui().style.webkitUserSelect = value != null ? value : '';
            },
            setCursor: (value) => {
                this.getGui().style.cursor = value != null ? value : '';
            },
        };

        this.ctrl = this.createManagedBean(new GridCtrl());

        const template = this.createTemplate();
        this.setTemplate(template, [GridBodyComp, PaginationComp]);

        this.ctrl.setComp(compProxy, this.eGridDiv, this.getGui());

        this.insertGridIntoDom();

        this.initialiseTabGuard({
            // we want to override the default behaviour to do nothing for onTabKeyDown
            onTabKeyDown: () => undefined,
            focusInnerElement: (fromBottom) => this.ctrl.focusInnerElement(fromBottom),
            forceFocusOutWhenTabGuardsAreEmpty: true,
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
        const eRootWrapperBodyClassList = this.rootWrapperBody.classList;
        eRootWrapperBodyClassList.toggle(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        eRootWrapperBodyClassList.toggle(LayoutCssClasses.NORMAL, params.normal);
        eRootWrapperBodyClassList.toggle(LayoutCssClasses.PRINT, params.print);

        this.addOrRemoveCssClass(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        this.addOrRemoveCssClass(LayoutCssClasses.NORMAL, params.normal);
        this.addOrRemoveCssClass(LayoutCssClasses.PRINT, params.print);
    }

    private createTemplate(): string {
        const dropZones = this.ctrl.showDropZones() ? '<ag-grid-header-drop-zones></ag-grid-header-drop-zones>' : '';
        const sideBar = this.ctrl.showSideBar() ? '<ag-side-bar data-ref="sideBar"></ag-side-bar>' : '';
        const statusBar = this.ctrl.showStatusBar() ? '<ag-status-bar></ag-status-bar>' : '';
        const watermark = this.ctrl.showWatermark() ? '<ag-watermark></ag-watermark>' : '';

        const template =
            /* html */
            `<div class="ag-root-wrapper" role="presentation">
                ${dropZones}
                <div class="ag-root-wrapper-body" data-ref="rootWrapperBody" role="presentation">
                    <ag-grid-body data-ref="gridBody"></ag-grid-body>
                    ${sideBar}
                </div>
                ${statusBar}
                <ag-pagination></ag-pagination>
                ${watermark}
            </div>`;

        return template;
    }

    public override getFocusableElement(): HTMLElement {
        return this.rootWrapperBody;
    }

    protected getFocusableContainers(): HTMLElement[] {
        const focusableContainers = [this.gridBody.getGui()];

        if (this.sideBar) {
            focusableContainers.push(this.sideBar.getGui());
        }

        return focusableContainers.filter((el) => _isVisible(el));
    }
}
