import { UserCompDetails } from "../../components/framework/userComponentFactory";
import { CellStyle } from "../../entities/colDef";
import { Column } from "../../entities/column";
import { RowNode } from "../../entities/rowNode";
import { ICellEditorComp } from "../../interfaces/iCellEditor";
import { setAriaRole } from "../../utils/aria";
import { addStylesToElement, clearElement, removeFromParent } from "../../utils/dom";
import { escapeString } from "../../utils/string";
import { Component } from "../../widgets/component";
import { Beans } from "./../beans";
import { ICellRendererComp } from "./../cellRenderers/iCellRenderer";
import { RowCtrl } from "./../row/rowCtrl";
import { CellCtrl, ICellComp } from "./cellCtrl";

export class CellComp extends Component {

    private eCellWrapper: HTMLElement | undefined;
    private eCellValue: HTMLElement | undefined;

    private beans: Beans;
    private column: Column;
    private rowNode: RowNode;
    private eRow: HTMLElement;

    private forceWrapper: boolean;

    private cellRenderer: ICellRendererComp | null | undefined;
    private cellRendererGui: HTMLElement | null;
    private cellRendererClass: any;

    private rowCtrl: RowCtrl | null;

    private cellCtrl: CellCtrl;

    private firstRender: boolean;

    // every time we go into edit mode, or back again, this gets incremented.
    // it's the components way of dealing with the async nature of framework components,
    // so if a framework component takes a while to be created, we know if the object
    // is still relevant when creating is finished. eg we could click edit / un-edit 20
    // times before the first React edit component comes back - we should discard
    // the first 19.
    private rendererVersion = 0;
    private editorVersion = 0;

    constructor(beans: Beans, cellCtrl: CellCtrl,
        printLayout: boolean, eRow: HTMLElement, editingRow: boolean) {
        super();
        this.beans = beans;
        this.column = cellCtrl.getColumn();
        this.rowNode = cellCtrl.getRowNode();
        this.rowCtrl = cellCtrl.getRowCtrl();
        this.eRow = eRow;
        this.cellCtrl = cellCtrl;

        const cellDiv = document.createElement('div');
        cellDiv.setAttribute('comp-id', `${this.getCompId()}`);
        this.setTemplateFromElement(cellDiv);

        const eGui = this.getGui();

        this.forceWrapper = cellCtrl.isForceWrapper();

        this.refreshWrapper(false);

        const setAttribute = (name: string, value: string | null | undefined) => {
            if (value != null && value != '') {
                eGui.setAttribute(name, value);
            } else {
                eGui.removeAttribute(name);
            }
        };

        setAriaRole(eGui, cellCtrl.getCellAriaRole());
        setAttribute('col-id', cellCtrl.getColumnIdSanitised());
        const tabIndex = cellCtrl.getTabIndex();
        if (tabIndex !== undefined) {
            setAttribute('tabindex', tabIndex.toString());
        }

        const compProxy: ICellComp = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            setUserStyles: (styles: CellStyle) => addStylesToElement(eGui, styles),
            getFocusableElement: () => this.getFocusableElement(),
            
            setRenderDetails: (compDetails, valueToDisplay, force) =>
                this.setRenderDetails(compDetails, valueToDisplay, force),
            setEditDetails: (compDetails, popup, position) =>
                {},

            getCellEditor: () => null,
            getCellRenderer: () => this.cellRenderer || null,
            getParentOfValue: () => this.getParentOfValue()
        };

        cellCtrl.setComp(compProxy, this.getGui(), this.eCellWrapper, printLayout, editingRow);
    }

    private getParentOfValue(): HTMLElement {
        if (this.eCellValue) {
            // if not editing, and using wrapper, then value goes in eCellValue
            return this.eCellValue;
        }
        if (this.eCellWrapper) {
            // if editing, and using wrapper, value (cell editor) goes in eCellWrapper
            return this.eCellWrapper;
        }

        // if editing or rendering, and not using wrapper, value (or comp) is directly inside cell
        return this.getGui();
    }

    private setRenderDetails(compDetails: UserCompDetails | undefined, valueToDisplay: any, forceNewCellRendererInstance: boolean): void {
        // this means firstRender will be true for one pass only, as it's initialised to undefined
        this.firstRender = this.firstRender == null;

        // if display template has changed, means any previous Cell Renderer is in the wrong location
        const controlWrapperChanged = this.refreshWrapper(false);

        // all of these have dependencies on the eGui, so only do them after eGui is set
        if (compDetails) {
            const neverRefresh = forceNewCellRendererInstance || controlWrapperChanged;
            const cellRendererRefreshSuccessful = neverRefresh ? false : this.refreshCellRenderer(compDetails);
            if (!cellRendererRefreshSuccessful) {
                this.destroyRenderer();
                this.createCellRendererInstance(compDetails);
            }
        } else {
            this.destroyRenderer();
            this.insertValueWithoutCellRenderer(valueToDisplay);
        }
    }

    // returns true if wrapper was changed
    private refreshWrapper(editing: boolean): boolean {
        const usingWrapper = this.forceWrapper;

        const putWrapperIn = usingWrapper && this.eCellWrapper == null;
        if (putWrapperIn) {
            const wrapperDiv = document.createElement('div');
            wrapperDiv.setAttribute('role', 'presentation');
            wrapperDiv.setAttribute('class', 'ag-cell-wrapper');
            this.eCellWrapper = wrapperDiv;
            this.getGui().appendChild(this.eCellWrapper);
        }
        const takeWrapperOut = !usingWrapper && this.eCellWrapper != null;
        if (takeWrapperOut) {
            removeFromParent(this.eCellWrapper!);
            this.eCellWrapper = undefined;
        }

        this.addOrRemoveCssClass('ag-cell-value', !usingWrapper);

        const usingCellValue = !editing && usingWrapper;
        const putCellValueIn = usingCellValue && this.eCellValue == null;
        if (putCellValueIn) {
            const cellSpan = document.createElement('span');
            cellSpan.setAttribute('role', 'presentation');
            cellSpan.setAttribute('class', 'ag-cell-value');
            this.eCellValue = cellSpan;
            this.eCellWrapper!.appendChild(this.eCellValue);
        }
        const takeCellValueOut = !usingCellValue && this.eCellValue != null;
        if (takeCellValueOut) {
            removeFromParent(this.eCellValue!);
            this.eCellValue = undefined;
        }

        const templateChanged = putWrapperIn || takeWrapperOut || putCellValueIn || takeCellValueOut;

        return templateChanged;
    }

    private insertValueWithoutCellRenderer(valueToDisplay: any): void {
        const eParent = this.getParentOfValue();
        clearElement(eParent);

        const escapedValue = valueToDisplay != null ? escapeString(valueToDisplay, true) : null;
        if (escapedValue != null) {
            eParent.textContent = escapedValue;
        }
    }

    private destroyEditorAndRenderer(): void {
        this.destroyRenderer();
    }

    private destroyRenderer(): void {
        const {context} = this.beans;
        this.cellRenderer = context.destroyBean(this.cellRenderer);
        removeFromParent(this.cellRendererGui);
        this.cellRendererGui = null;
        this.rendererVersion++;
    }

    private refreshCellRenderer(compClassAndParams: UserCompDetails): boolean {
        if (this.cellRenderer == null || this.cellRenderer.refresh == null) { return false; }

        // if different Cell Renderer configured this time (eg user is using selector, and
        // returns different component) then don't refresh, force recreate of Cell Renderer
        if (this.cellRendererClass !== compClassAndParams.componentClass) { return false; }

        // take any custom params off of the user
        const result = this.cellRenderer.refresh(compClassAndParams.params);

        // NOTE on undefined: previous version of the cellRenderer.refresh() interface
        // returned nothing, if the method existed, we assumed it refreshed. so for
        // backwards compatibility, we assume if method exists and returns nothing,
        // that it was successful.
        return result === true || result === undefined;
    }

    private createCellRendererInstance(compDetails: UserCompDetails): void {
        // never use task service if animation frame service is turned off.
        // and lastly we never use it if doing auto-height, as the auto-height service checks the
        // row height directly after the cell is created, it doesn't wait around for the tasks to complete        
        const suppressAnimationFrame = this.beans.gos.get('suppressAnimationFrame');
        const useTaskService = !suppressAnimationFrame;

        const displayComponentVersionCopy = this.rendererVersion;

        const {componentClass} = compDetails;

        const createCellRendererFunc = () => {
            const staleTask = this.rendererVersion !== displayComponentVersionCopy || !this.isAlive();
            if (staleTask) { return; }

            // this can return null in the event that the user has switched from a renderer component to nothing, for example
            // when using a cellRendererSelect to return a component or null depending on row data etc
            const componentPromise = compDetails.newAgStackInstance();
            const callback = this.afterCellRendererCreated.bind(this, displayComponentVersionCopy, componentClass);
            if (componentPromise) {
                componentPromise.then(callback);
            }
        };

        // we only use task service when rendering for first time, which means it is not used when doing edits.
        // if we changed this (always use task service) would make sense, however it would break tests, possibly
        // test of users.
        if (useTaskService && this.firstRender) {
            this.beans.animationFrameService.createTask(createCellRendererFunc, this.rowNode.rowIndex!, 'createTasksP2');
        } else {
            createCellRendererFunc();
        }
    }

    public getCtrl(): CellCtrl {
        return this.cellCtrl;
    }

    public getRowCtrl(): RowCtrl | null {
        return this.rowCtrl;
    }

    public getCellRenderer(): ICellRendererComp | null | undefined {
        return this.cellRenderer;
    }

    public getCellEditor(): ICellEditorComp | null | undefined {
        return null;
    }

    private afterCellRendererCreated(cellRendererVersion: number, cellRendererClass: any, cellRenderer: ICellRendererComp): void {
        const staleTask = !this.isAlive() || cellRendererVersion !== this.rendererVersion;

        if (staleTask) {
            this.beans.context.destroyBean(cellRenderer);
            return;
        }

        this.cellRenderer = cellRenderer;
        this.cellRendererClass = cellRendererClass;
        this.cellRendererGui = this.cellRenderer.getGui();

        if (this.cellRendererGui != null) {
            const eParent = this.getParentOfValue();
            clearElement(eParent);
            eParent.appendChild(this.cellRendererGui);
        }
    }

    public detach(): void {
        this.eRow.removeChild(this.getGui());
    }

    // if the row is also getting destroyed, then we don't need to remove from dom,
    // as the row will also get removed, so no need to take out the cells from the row
    // if the row is going (removing is an expensive operation, so only need to remove
    // the top part)
    //
    // note - this is NOT called by context, as we don't wire / unwire the CellComp for performance reasons.
    public destroy(): void {
        this.destroyEditorAndRenderer();

        super.destroy();
    }
}
