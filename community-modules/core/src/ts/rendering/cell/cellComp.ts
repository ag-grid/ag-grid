import { Column } from "../../entities/column";
import { RowNode } from "../../entities/rowNode";
import { Beans } from "./../beans";
import { Component } from "../../widgets/component";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { ICellRendererComp, ICellRendererParams } from "./../cellRenderers/iCellRenderer";
import { CheckboxSelectionComponent } from "./../checkboxSelectionComponent";
import { RowCtrl } from "./../row/rowCtrl";
import { RowDragComp } from "./../row/rowDragComp";
import { PopupEditorWrapper } from "./../cellEditors/popupEditorWrapper";
import { DndSourceComp } from "./../dndSourceComp";
import { TooltipParentComp } from "../../widgets/tooltipFeature";
import { setAriaColIndex, setAriaDescribedBy, setAriaSelected } from "../../utils/aria";
import { escapeString } from "../../utils/string";
import { missing } from "../../utils/generic";
import { addStylesToElement, clearElement } from "../../utils/dom";
import { isBrowserIE } from "../../utils/browser";
import { doOnce } from "../../utils/function";
import { CellCtrl, ICellComp } from "./cellCtrl";

export const CSS_CELL_VALUE = 'ag-cell-value';

enum ShowingState { ShowRenderer, ShowEditor }

export class CellComp extends Component implements TooltipParentComp {

    private static CELL_RENDERER_TYPE_NORMAL = 'cellRenderer';

    private eCellWrapper: HTMLElement | null;
    private eCellValue: HTMLElement;

    private beans: Beans;
    private column: Column;
    private rowNode: RowNode;
    private eRow: HTMLElement;

    private includeSelection: boolean;
    private includeRowDrag: boolean;
    private includeDndSource: boolean;

    private forceWrapper: boolean;

    private checkboxSelectionComp: CheckboxSelectionComponent | undefined;
    private dndSourceComp: DndSourceComp | undefined;
    private rowDraggingComp: RowDragComp | undefined;

    private cellEditorInPopup: boolean;
    private hideEditorPopup: Function | null;

    // instance of the cellRenderer class
    private cellRenderer: ICellRendererComp | null | undefined;
    private cellEditor: ICellEditorComp | null | undefined;

    private autoHeightCell: boolean;

    private rowCtrl: RowCtrl | null;

    private scope: any = null;

    private cellCtrl: CellCtrl;

    private cellState: ShowingState;
    private firstRender: boolean;

    // every time we go into edit mode, or back again, this gets incremented.
    // it's the components way of dealing with the async nature of framework components,
    // so if a framework component takes a while to be created, we know if the object
    // is still relevant when creating is finished. eg we could click edit / un-edit 20
    // times before the first React edit component comes back - we should discard
    // the first 19.
    private latestCompRequestVersion = 0;

    constructor(scope: any, beans: Beans, cellCtrl: CellCtrl,
        autoHeightCell: boolean, printLayout: boolean, eRow: HTMLElement, editingRow: boolean) {
        super();
        this.scope = scope;
        this.beans = beans;
        this.column = cellCtrl.getColumn();
        this.rowNode = cellCtrl.getRowNode();
        this.rowCtrl = cellCtrl.getRowCtrl();
        this.autoHeightCell = autoHeightCell;
        this.eRow = eRow;

        this.setTemplate(`<div comp-id="${this.getCompId()}"/>`);

        const eGui = this.getGui();
        const style = eGui.style;

        const setAttribute = (name: string, value: string | null, element?: HTMLElement) => {
            const actualElement = element ? element : eGui;
            if (value != null && value != '') {
                actualElement.setAttribute(name, value);
            } else {
                actualElement.removeAttribute(name);
            }
        };

        const compProxy: ICellComp = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            setUserStyles: styles => addStylesToElement(eGui, styles),
            setAriaSelected: selected => setAriaSelected(eGui, selected),
            getFocusableElement: () => this.getFocusableElement(),
            setLeft: left => style.left = left,
            setWidth: width => style.width = width,
            setAriaColIndex: index => setAriaColIndex(this.getGui(), index),
            setHeight: height => style.height = height,
            setZIndex: zIndex => style.zIndex = zIndex,
            setTabIndex: tabIndex => setAttribute('tabindex', tabIndex.toString()),
            setRole: role => setAttribute('role', role),
            setColId: colId => setAttribute('col-id', colId),
            setTitle: title => setAttribute('title', title),
            setUnselectable: value => setAttribute('unselectable', value, this.eCellValue),
            setTransition: transition => style.transition = transition ? transition : '',
            showRenderer: (params, force) => this.showRenderer(params, force),
            showEditor: params => this.showEditor(params),

            setIncludeSelection: include => this.includeSelection = include,
            setIncludeRowDrag: include => this.includeRowDrag = include,
            setIncludeDndSource: include => this.includeDndSource = include,
            setForceWrapper: force => this.forceWrapper = force,

            getCellEditor: () => this.cellEditor ? this.cellEditor : null,
            getParentOfValue: () => this.eCellValue ? this.eCellValue : null,

            // hacks
            addRowDragging: (customElement?: HTMLElement, dragStartPixels?: number) => this.addRowDragging(customElement, dragStartPixels)
        };

        this.cellCtrl = cellCtrl;
        cellCtrl.setComp(compProxy, false, this.scope, this.getGui(), printLayout, editingRow);
    }

    private showRenderer(params: ICellRendererParams, forceNewCellRendererInstance: boolean): void {
        this.setCellState(ShowingState.ShowRenderer);
        const usingCellRenderer = this.isUsingCellRenderer(params);
        const usingAngular1Template = this.isUsingAngular1Template(params);

        // this will go to cellCtrl in time
        if (this.hideEditorPopup) {
            this.hideEditorPopup();
            this.hideEditorPopup = null;
        }

        // if display template has changed, means any previous Cell Renderer is in the wrong location
        const controlWrapperChanged = this.setupControlsWrapper();

        // all of these have dependencies on the eGui, so only do them after eGui is set
        if (usingCellRenderer) {
            const neverRefresh = forceNewCellRendererInstance || controlWrapperChanged;
            const cellRendererRefreshSuccessful = neverRefresh ? false : this.refreshCellRenderer(params);
            if (!cellRendererRefreshSuccessful) {
                this.destroyEditorAndRenderer();
                this.createCellRendererInstance(params);
            }
        } else {
            this.destroyEditorAndRenderer();
            if (usingAngular1Template) {
                this.insertValueUsingAngular1Template(params);
            } else {
                this.insertValueWithoutCellRenderer(params);
            }
        }

        this.updateAngular1ScopeAndCompile();
    }

    private showEditor(params: ICellEditorParams): void {
        this.setCellState(ShowingState.ShowEditor);

        this.destroyEditorAndRenderer();
        this.createCellEditorInstance(params);

        this.updateAngular1ScopeAndCompile();
    }

    private setCellState(state: ShowingState): void {
        if (this.cellState === state) { return; }

        this.firstRender = this.cellState == null;
        this.cellState = state;

        this.removeControlsWrapper();
        this.destroyEditorAndRenderer();
        this.clearCellElement();
    }

    private removeControlsWrapper(): void {
        this.eCellValue = this.getGui();
        this.eCellWrapper = null;

        this.checkboxSelectionComp = this.beans.context.destroyBean(this.checkboxSelectionComp);
        this.dndSourceComp = this.beans.context.destroyBean(this.dndSourceComp);
        this.rowDraggingComp = this.beans.context.destroyBean(this.rowDraggingComp);

        this.updateCssCellValue();
    }

    private updateCssCellValue(): void {
        // when using the wrapper, this CSS class appears inside the wrapper instead
        const includeAtTop = this.eCellWrapper == null;
        this.addOrRemoveCssClass(CSS_CELL_VALUE, includeAtTop);
    }

    // returns true if wrapper was changed
    private setupControlsWrapper(): boolean {

        const usingWrapper = this.includeRowDrag || this.includeDndSource || this.includeSelection || this.forceWrapper;

        const changed = true;
        const notChanged = false;

        // turn wrapper on
        if (usingWrapper && !this.eCellWrapper) {
            this.addControlsWrapper();
            return changed;
        }

        // turn wrapper off
        if (!usingWrapper && this.eCellWrapper) {
            this.removeControlsWrapper();
            return changed;
        }

        return notChanged;
    }

    private addControlsWrapper(): void {
        const unselectable = !this.beans.gridOptionsWrapper.isEnableCellTextSelection() ? ' unselectable="on"' : '';

        this.updateCssCellValue();

        const eGui = this.getGui();
        eGui.innerHTML = 'TEST';
        eGui.innerHTML = /* html */
            `<div ref="eCellWrapper" class="ag-cell-wrapper" role="presentation">
                    <span ref="eCellValue" role="presentation" class="${CSS_CELL_VALUE}"${unselectable}></span>
                </div>`;

        this.eCellValue = this.getRefElement('eCellValue');
        this.eCellWrapper = this.getRefElement('eCellWrapper');

        const id = this.eCellValue.id = `cell-${this.getCompId()}`;
        const describedByIds: string[] = [];

        if (this.includeRowDrag) {
            this.addRowDragging();
        }

        if (this.includeDndSource) {
            this.addDndSource();
        }

        if (this.includeSelection) {
            describedByIds.push(this.addSelectionCheckbox().getCheckboxId());
        }

        describedByIds.push(id);

        setAriaDescribedBy(this.getGui(), describedByIds.join(' '));
    }

    private createCellEditorInstance(params: ICellEditorParams): void {
        const versionCopy = this.latestCompRequestVersion;

        const cellEditorPromise = this.beans.userComponentFactory.newCellEditor(this.column.getColDef(), params);
        if (!cellEditorPromise) { return; } // if empty, userComponentFactory already did a console message

        cellEditorPromise.then(c => this.afterCellEditorCreated(versionCopy, c!, params));

        // if we don't do this, and editor component is async, then there will be a period
        // when the component isn't present and keyboard navigation won't work - so example
        // of user hitting tab quickly (more quickly than renderers getting created) won't work
        const cellEditorAsync = missing(this.cellEditor);
        if (cellEditorAsync && params.cellStartedEdit) {
            this.cellCtrl.focusCell(true);
        }
    }

    private wrapPopupEditor(params: ICellEditorParams, cellEditor: ICellEditorComp): ICellEditorComp {
        const cellEditorComp = cellEditor!;
        const isPopup = cellEditorComp.isPopup && cellEditorComp.isPopup();

        if (!isPopup) { return cellEditorComp; }

        if (this.beans.gridOptionsWrapper.isFullRowEdit()) {
            console.warn('AG Grid: popup cellEditor does not work with fullRowEdit - you cannot use them both ' +
                '- either turn off fullRowEdit, or stop using popup editors.');
        }

        // if a popup, then we wrap in a popup editor and return the popup
        const popupEditorWrapper = this.beans.context.createBean(new PopupEditorWrapper(cellEditorComp));
        popupEditorWrapper.init(params);

        return popupEditorWrapper;
    }

    private insertValueWithoutCellRenderer(params: ICellRendererParams): void {
        const { valueFormatted, value } = params;
        const valueToDisplay = valueFormatted != null ? valueFormatted : value;
        const escapedValue = valueToDisplay != null ? escapeString(valueToDisplay) : null;
        if (escapedValue != null) {
            this.eCellValue.innerHTML = escapedValue;
        } else {
            clearElement(this.eCellValue);
        }
    }

    private insertValueUsingAngular1Template(params: ICellRendererParams): void {
        if (!params.colDef) { return; }
        const { template, templateUrl } = params.colDef;

        if (template != null) {
            this.eCellValue.innerHTML = template;
        } else if (templateUrl != null) {
            // first time this happens it will return nothing, as the template will still be loading async,
            // however once loaded it will refresh the cell and second time around it will be returned sync
            // as in cache.
            const templateFromUrl = this.beans.templateService.getTemplate(templateUrl,
                () => this.cellCtrl.refreshCell({forceRefresh: true}));
            this.eCellValue.innerHTML = templateFromUrl || '';
        } else {
            // should never happen, as we only enter this method when template or templateUrl exist
        }
    }

    private destroyEditorAndRenderer(): void {
        this.cellRenderer = this.beans.context.destroyBean(this.cellRenderer);
        this.cellEditor = this.beans.context.destroyBean(this.cellEditor);
        // increase version, so if any async comps return, they will be destroyed
        this.latestCompRequestVersion++;
    }

    private refreshCellRenderer(params: ICellRendererParams): boolean {
        if (this.cellRenderer == null || this.cellRenderer.refresh == null) { return false; }

        // take any custom params off of the user
        const finalParams = this.beans.userComponentFactory.mergeParmsWithApplicationProvidedParams(this.column.getColDef(), CellComp.CELL_RENDERER_TYPE_NORMAL, params);

        const result = this.cellRenderer.refresh(finalParams);

        // NOTE on undefined: previous version of the cellRenderer.refresh() interface
        // returned nothing, if the method existed, we assumed it refreshed. so for
        // backwards compatibility, we assume if method exists and returns nothing,
        // that it was successful.
        return result === true || result === undefined;
    }

    private createCellRendererInstance(params: ICellRendererParams): void {
        // never use task service if angularCompileRows=true, as that assume the cell renderers
        // are finished when the row is created. also we never use it if animation frame service
        // is turned off.
        // and lastly we never use it if doing auto-height, as the auto-height service checks the
        // row height directly after the cell is created, it doesn't wait around for the tasks to complete
        const angularCompileRows = this.beans.gridOptionsWrapper.isAngularCompileRows();
        const suppressAnimationFrame = this.beans.gridOptionsWrapper.isSuppressAnimationFrame();
        const useTaskService = !angularCompileRows && !suppressAnimationFrame && !this.autoHeightCell;

        const displayComponentVersionCopy = this.latestCompRequestVersion;

        const createCellRendererFunc = () => {
            const staleTask = this.latestCompRequestVersion !== displayComponentVersionCopy || !this.isAlive();
            if (staleTask) { return; }

            // this can return null in the event that the user has switched from a renderer component to nothing, for example
            // when using a cellRendererSelect to return a component or null depending on row data etc
            const componentPromise = this.beans.userComponentFactory.newCellRenderer(this.column.getColDef(), params);
            const callback = this.afterCellRendererCreated.bind(this, displayComponentVersionCopy);
            if (componentPromise) {
                componentPromise.then(callback);
            }
        };

        // we only use task service when rendering for first time, which means it is not used when doing edits.
        // if we changed this (always use task service) would make sense, however it would break tests, possibly
        // test of users.
        if (useTaskService && this.firstRender) {
            this.beans.taskQueue.createTask(createCellRendererFunc, this.rowNode.rowIndex!, 'createTasksP2');
        } else {
            createCellRendererFunc();
        }
    }

    private isUsingCellRenderer(params: ICellRendererParams): boolean {
        const colDef = params.colDef!;
        const res = colDef.cellRenderer != null || colDef.cellRendererFramework != null || colDef.cellRendererSelector != null;
        return res;
    }

    private isUsingAngular1Template(params: ICellRendererParams): boolean {
        const colDef = params.colDef!;
        const res = colDef.template != null || colDef.templateUrl != null;
        return res;
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
        return this.cellEditor;
    }

    private afterCellRendererCreated(cellRendererVersion: number, cellRenderer: ICellRendererComp): void {
        const staleTask = !this.isAlive() || cellRendererVersion !== this.latestCompRequestVersion;

        if (staleTask) {
            this.beans.context.destroyBean(cellRenderer);
            return;
        }

        this.cellRenderer = cellRenderer;
        const eGui = this.cellRenderer.getGui();

        if (eGui != null) {
            this.eCellValue.appendChild(eGui);
        }
    }

    private afterCellEditorCreated(requestVersion: number, cellEditor: ICellEditorComp, params: ICellEditorParams): void {

        // if editingCell=false, means user cancelled the editor before component was ready.
        // if versionMismatch, then user cancelled the edit, then started the edit again, and this
        //   is the first editor which is now stale.
        const staleComp = requestVersion !== this.latestCompRequestVersion;

        if (staleComp) {
            this.beans.context.destroyBean(cellEditor);
            return;
        }

        const editingCancelledByUserComp = cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart();
        if (editingCancelledByUserComp) {
            this.beans.context.destroyBean(cellEditor);
            this.cellCtrl.stopEditing();
            return;
        }

        if (!cellEditor.getGui) {
            console.warn(`AG Grid: cellEditor for column ${this.column.getId()} is missing getGui() method`);
            this.beans.context.destroyBean(cellEditor);
            return;
        }

        this.cellEditorInPopup = cellEditor.isPopup !== undefined && cellEditor.isPopup();

        if (this.cellEditorInPopup) {
            this.cellEditor = this.wrapPopupEditor(params, cellEditor);
            this.addPopupCellEditor();
        } else {
            this.cellEditor = cellEditor;
            this.addInCellEditor();
        }

        if (cellEditor.afterGuiAttached) {
            cellEditor.afterGuiAttached();
        }
    }

    private addInCellEditor(): void {
        const eGui = this.getGui();

        // if focus is inside the cell, we move focus to the cell itself
        // before removing it's contents, otherwise errors could be thrown.
        if (eGui.contains(document.activeElement)) {
            eGui.focus();
        }

        this.clearCellElement();
        this.cellRenderer = this.beans.context.destroyBean(this.cellRenderer);

        eGui.appendChild(this.cellEditor!.getGui());
    }

    private addPopupCellEditor(): void {
        const ePopupGui = this.cellEditor && this.cellEditor.getGui();

        if (!ePopupGui) { return; }

        const popupService = this.beans.popupService;

        const useModelPopup = this.beans.gridOptionsWrapper.isStopEditingWhenCellsLoseFocus();

        const position = this.cellEditor && this.cellEditor.getPopupPosition ? this.cellEditor.getPopupPosition() : 'over';

        const params = {
            column: this.column,
            rowNode: this.rowNode,
            type: 'popupCellEditor',
            eventSource: this.getGui(),
            ePopup: ePopupGui,
            keepWithinBounds: true
        };

        const positionCallback = position === 'under' ?
            popupService.positionPopupUnderComponent.bind(popupService, params)
            : popupService.positionPopupOverComponent.bind(popupService, params);

        const addPopupRes = popupService.addPopup({
            modal: useModelPopup,
            eChild: ePopupGui,
            closeOnEsc: true,
            closedCallback: () => { this.onPopupEditorClosed(); },
            anchorToElement: this.getGui(),
            positionCallback
        });
        if (addPopupRes) {
            this.hideEditorPopup = addPopupRes.hideFunc;
        }
    }

    private onPopupEditorClosed(): void {
        // we only call stopEditing if we are editing, as
        // it's possible the popup called 'stop editing'
        // before this, eg if 'enter key' was pressed on
        // the editor.

        if (!this.cellCtrl.isEditing()) { return; }
        // note: this only happens when use clicks outside of the grid. if use clicks on another
        // cell, then the editing will have already stopped on this cell
        this.cellCtrl.stopRowOrCellEdit();
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
        this.cellCtrl.stopEditing();

        this.destroyEditorAndRenderer();
        this.removeControlsWrapper();

        super.destroy();
    }

    private addRowDragging(customElement?: HTMLElement, dragStartPixels?: number): void {
        const pagination = this.beans.gridOptionsWrapper.isPagination();
        const rowDragManaged = this.beans.gridOptionsWrapper.isRowDragManaged();
        const clientSideRowModelActive = this.beans.gridOptionsWrapper.isRowModelDefault();

        if (rowDragManaged) {
            // row dragging only available in default row model
            if (!clientSideRowModelActive) {
                doOnce(() => console.warn('AG Grid: managed row dragging is only allowed in the Client Side Row Model'),
                    'CellComp.addRowDragging');

                return;
            }

            if (pagination) {
                doOnce(() => console.warn('AG Grid: managed row dragging is not possible when doing pagination'),
                    'CellComp.addRowDragging');

                return;
            }
        }
        if (!this.rowDraggingComp) {
            this.rowDraggingComp = new RowDragComp(() => this.cellCtrl.getValue(), this.rowNode, this.column, customElement, dragStartPixels);
            this.beans.context.createBean(this.rowDraggingComp);
        } else if (customElement) {
            // if the rowDraggingComp is already present, means we should only set the drag element
            this.rowDraggingComp.setDragElement(customElement, dragStartPixels);
        }

        // If there is a custom element, the Cell Renderer is responsible for displaying it.
        if (!customElement) {
            // put the checkbox in before the value
            this.eCellWrapper!.insertBefore(this.rowDraggingComp.getGui(), this.eCellValue);
        }
    }

    private addDndSource(): void {
        const dndSourceComp = new DndSourceComp(this.rowNode, this.column, this.beans, this.getGui());
        this.beans.context.createBean(dndSourceComp);

        // put the checkbox in before the value
        this.eCellWrapper!.insertBefore(dndSourceComp.getGui(), this.eCellValue);
    }

    private addSelectionCheckbox(): CheckboxSelectionComponent {
        const cbSelectionComponent = new CheckboxSelectionComponent();
        this.beans.context.createBean(cbSelectionComponent);

        cbSelectionComponent.init({ rowNode: this.rowNode, column: this.column });

        // put the checkbox in before the value
        this.eCellWrapper!.insertBefore(cbSelectionComponent.getGui(), this.eCellValue);
        return cbSelectionComponent;
    }

    private clearCellElement(): void {
        const eGui = this.getGui();

        // if focus is inside the cell, we move focus to the cell itself
        // before removing it's contents, otherwise errors could be thrown.
        if (eGui.contains(document.activeElement) && !isBrowserIE()) {
            eGui.focus({
                preventScroll: true
            });
        }

        clearElement(eGui);
    }

    private updateAngular1ScopeAndCompile() {
        if (this.beans.gridOptionsWrapper.isAngularCompileRows() && this.scope) {
            this.scope.data = { ...this.rowNode.data };

            const eGui = this.getGui();

            // only compile the node if it hasn't already been done
            // this prevents "orphaned" node leaks
            if (!eGui.classList.contains('ng-scope') || eGui.childElementCount === 0) {
                const compiledElement = this.beans.$compile(eGui)(this.scope);
                this.addDestroyFunc(() => compiledElement.remove());
            }
        }
    }
}
