import {GridPanelComp} from "./gridPanel/gridPanelComp";
import {Logger} from "./logger";
import {Autowired} from "./context/context";
import {Component} from "./widgets/component";
import {ISideBar} from "./interfaces/iSideBar";
import {RefSelector} from "./widgets/componentAnnotations";
import {ModuleNames} from "./modules/moduleNames";
import {ModuleRegistry} from "./modules/moduleRegistry";
import {ManagedFocusComponent} from "./widgets/managedFocusComponent";
import {ColumnController} from "./columnController/columnController";
import {ColumnGroup} from "./entities/columnGroup";
import {Column} from "./entities/column";
import {addCssClass, addOrRemoveCssClass, isVisible} from "./utils/dom";
import {findIndex, last} from "./utils/array";
import {FocusController} from "./focusController";
import {GridCompController} from "./gridCompController";
import {LayoutCssClasses, UpdateLayoutClassesParams} from "./styling/layoutFeature";

export class GridComp extends ManagedFocusComponent {

    @Autowired('columnController') private columnController: ColumnController;

    @RefSelector('gridPanel') private gridPanelComp: GridPanelComp;
    @RefSelector('sideBar') private sideBarComp: ISideBar & Component;
    @RefSelector('rootWrapperBody') private eRootWrapperBody: HTMLElement;

    private logger: Logger;
    private eGridDiv: HTMLElement;

    constructor(eGridDiv: HTMLElement) {
        super(undefined, true);
        this.eGridDiv = eGridDiv;
    }

    protected postConstruct(): void {
        const template = this.createTemplate();
        this.setTemplate(template);

        const view = {
            destroyGridUi:
                ()=> this.destroyBean(this),
            setRtlClass:
                (cssClass: string) => addCssClass(this.getGui(), cssClass),
            addOrRemoveKeyboardFocusClass:
                (addOrRemove: boolean) => this.addOrRemoveCssClass(FocusController.AG_KEYBOARD_FOCUS, addOrRemove),
            focusNextInnerContainer: this.focusNextInnerContainer.bind(this),
            forceFocusOutOfContainer: this.forceFocusOutOfContainer.bind(this),
            updateLayoutClasses: this.updateLayoutClasses.bind(this)
        };

        this.createManagedBean(new GridCompController(view, this.getGui(), this.eGridDiv, this.sideBarComp, this.gridPanelComp));

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

    public getFocusableElement(): HTMLElement {
        return this.eRootWrapperBody;
    }

    private createTemplate(): string {
        const sideBarModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.SideBarModule);
        const statusBarModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.StatusBarModule);
        const rowGroupingLoaded = ModuleRegistry.isRegistered(ModuleNames.RowGroupingModule);
        const enterpriseCoreLoaded = ModuleRegistry.isRegistered(ModuleNames.EnterpriseCoreModule);

        const dropZones = rowGroupingLoaded ? '<ag-grid-header-drop-zones></ag-grid-header-drop-zones>' : '';
        const sideBar = sideBarModuleLoaded ? '<ag-side-bar ref="sideBar"></ag-side-bar>' : '';
        const statusBar = statusBarModuleLoaded ? '<ag-status-bar ref="statusBar"></ag-status-bar>' : '';
        const watermark = enterpriseCoreLoaded ? '<ag-watermark></ag-watermark>' : '';

        const template = /* html */
            `<div ref="eRootWrapper" class="ag-root-wrapper">
                ${dropZones}
                <div class="ag-root-wrapper-body" ref="rootWrapperBody">
                    <ag-grid-panel ref="gridPanel"></ag-grid-panel>
                    ${sideBar}
                </div>
                ${statusBar}
                <ag-pagination></ag-pagination>
                ${watermark}
            </div>`;

        return template;
    }

    protected getFocusableContainers(): HTMLElement[] {
        const focusableContainers = [
            this.gridPanelComp.getGui()
        ];

        if (this.sideBarComp) {
            focusableContainers.push(
                this.sideBarComp.getGui()
            );
        }

        return focusableContainers.filter(el => isVisible(el));
    }

    public focusNextInnerContainer(backwards: boolean): boolean {
        const focusableContainers = this.getFocusableContainers();
        const idxWithFocus = findIndex(focusableContainers, container => container.contains(document.activeElement));
        const nextIdx = idxWithFocus + (backwards ? -1 : 1);

        if (nextIdx < 0 || nextIdx >= focusableContainers.length) {
            return false;
        }

        if (nextIdx === 0) {
            return this.focusGridHeader();
        }

        return this.focusController.focusInto(focusableContainers[nextIdx]);
    }

    protected focusInnerElement(fromBottom?: boolean): boolean {
        const focusableContainers = this.getFocusableContainers();

        if (fromBottom) {
            if (focusableContainers.length > 1) {
                return this.focusController.focusInto(last(focusableContainers));
            }

            const lastColumn = last(this.columnController.getAllDisplayedColumns());
            if (this.focusController.focusGridView(lastColumn, true)) { return true; }
        }

        return this.focusGridHeader();
    }

    private focusGridHeader(): boolean {
        let firstColumn: Column | ColumnGroup = this.columnController.getAllDisplayedColumns()[0];
        if (!firstColumn) { return false; }

        if (firstColumn.getParent()) {
            firstColumn = this.columnController.getColumnGroupAtLevel(firstColumn, 0)!;
        }

        this.focusController.focusHeaderPosition(
            { headerRowIndex: 0, column: firstColumn }
        );

        return true;
    }

    protected onTabKeyDown(): void { }
}
