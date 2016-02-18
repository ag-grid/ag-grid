import {Autowired} from "../../context/context";
import {ColumnController} from "../../columnController/columnController";
import {DragAndDropService2} from "../../dragAndDrop/dragAndDropService2";
import Column from "../../entities/column";
import _ from '../../utils';
import {DragSource} from "../../dragAndDrop/dragAndDropService2";
import {OriginalColumnGroup} from "../../entities/originalColumnGroup";
import SvgFactory from "../../svgFactory";
import GridOptionsWrapper from "../../gridOptionsWrapper";
import {RenderedItem} from "./renderedItem";

var svgFactory = SvgFactory.getInstance();

export class RenderedGroup extends RenderedItem {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;

    private static TEMPLATE =
        '<div class="ag-column-select-column-group">' +
        '  <span id="eIndent" class="ag-column-select-indent"></span>' +
        '  <span id="eExpand" class="ag-column-select-column-group-expand"></span>' +
        '  <span id="eContract" class="ag-column-select-column-group-contract"></span>' +
        '  <label>' +
        '    <input id="eCheckbox" type="checkbox" class="ag-column-select-checkbox"/>' +
        '    <span id="eText" class="ag-column-select-column-group-label"></span>' +
        '  </label>' +
        '</div>';

    private columnGroup: OriginalColumnGroup;
    private expanded = true;
    private columnDept: number;

    private eExpand: HTMLElement;
    private eContract: HTMLElement;
    private eCheckbox: HTMLInputElement;
    private expandedCallback: ()=>void;

    constructor(columnGroup: OriginalColumnGroup, columnDept: number, expandedCallback: ()=>void ) {
        super(RenderedGroup.TEMPLATE);
        this.columnGroup = columnGroup;
        this.columnDept = columnDept;
        this.expandedCallback = expandedCallback;
    }

    public agPostWire(): void {
        var eText = this.queryForHtmlElement('#eText');

        var headerName = this.columnGroup.getColGroupDef() ? this.columnGroup.getColGroupDef().headerName : null;
        if (_.missing(headerName)) {
            headerName = '>>'
        }

        eText.innerHTML = headerName;
        this.setupExpandContract();
        this.setupCheckbox();

        var eIndent = this.queryForHtmlElement('#eIndent');
        eIndent.style.width = (this.columnDept * 10) + 'px';

        this.addListenerToAllChildColumns();

        this.setIconVisibility();
    }

    private setupCheckbox(): void {
        this.eCheckbox = this.queryForHtmlInputElement('#eCheckbox');
        this.setSelectedBasedOnChildren();

        var changeEventListener = () => {
            var columns = this.columnGroup.getLeafColumns();
            this.columnController.setColumnsVisible(columns, this.eCheckbox.checked);
        };
        this.eCheckbox.addEventListener('change', changeEventListener);
    }

    private setupExpandContract(): void {
        this.eExpand = this.queryForHtmlElement('#eExpand');
        this.eContract = this.queryForHtmlElement('#eContract');

        this.eContract.appendChild(_.createIcon('groupContracted', this.gridOptionsWrapper, null, svgFactory.createArrowRightSvg));
        this.eExpand.appendChild(_.createIcon('groupExpanded', this.gridOptionsWrapper, null, svgFactory.createArrowDownSvg));

        this.eExpand.addEventListener('click', this.onExpandOrContractClicked.bind(this, false));
        this.eContract.addEventListener('click', this.onExpandOrContractClicked.bind(this, true));
    }

    private addListenerToAllChildColumns(): void {
        var columnSelectedListener = this.setSelectedBasedOnChildren.bind(this);
        this.columnGroup.getLeafColumns().forEach( column => {
            column.addEventListener(Column.EVENT_VISIBLE_CHANGED, columnSelectedListener);
            this.addDestroyFunc( ()=> column.removeEventListener(Column.EVENT_VISIBLE_CHANGED, columnSelectedListener) );
        });
    }

    private setSelectedBasedOnChildren(): void {

        var foundVisible = false;
        var foundNotVisible = false;

        this.columnGroup.getLeafColumns().forEach( column => {
            if (column.isVisible()) {
                foundVisible = true;
            } else {
                foundNotVisible = true;
            }
        });

        var selected: boolean;
        if (foundVisible && foundNotVisible) {
            selected = undefined;
        } else {
            selected = foundVisible;
        }

        _.setCheckboxState(this.eCheckbox, selected);
    }

    private onExpandOrContractClicked(newValue: boolean): void {
        this.expanded = newValue;
        this.setIconVisibility();
        this.expandedCallback();
    }

    private setIconVisibility(): void {
        _.setVisible(this.eExpand, this.expanded);
        _.setVisible(this.eContract, !this.expanded);
    }

    public isExpanded(): boolean {
        return this.expanded;
    }
}