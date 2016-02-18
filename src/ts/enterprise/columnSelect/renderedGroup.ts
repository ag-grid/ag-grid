import {Autowired} from "../../context/context";
import {ColumnController} from "../../columnController/columnController";
import {DragAndDropService2} from "../../dragAndDrop/dragAndDropService2";
import Column from "../../entities/column";
import _ from '../../utils';
import {DragSource} from "../../dragAndDrop/dragAndDropService2";
import {OriginalColumnGroup} from "../../entities/originalColumnGroup";
import SvgFactory from "../../svgFactory";
import GridOptionsWrapper from "../../gridOptionsWrapper";

var svgFactory = SvgFactory.getInstance();

export class RenderedGroup {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private static TEMPLATE =
        '<div class="ag-column-select-column-group">' +
        '  <span id="eExpand" class="ag-column-select-column-group-expand"></span>' +
        '  <span id="eContract" class="ag-column-select-column-group-contract"></span>' +
        '  <span id="eText" class="ag-column-select-column-group-label"></span>' +
        '</div>';

    private eGui: HTMLElement;
    private columnGroup: OriginalColumnGroup;
    private expanded = true;
    private columnDept: number;

    private eExpand: HTMLElement;
    private eContract: HTMLElement;
    private expandedCallback: ()=>void;

    constructor(columnGroup: OriginalColumnGroup, columnDept: number, expandedCallback: ()=>void ) {
        this.eGui = _.loadTemplate(RenderedGroup.TEMPLATE);
        this.columnGroup = columnGroup;
        this.columnDept = columnDept;
        this.expandedCallback = expandedCallback;
    }

    public agPostWire(): void {
        var eText = <HTMLElement> this.eGui.querySelector('#eText');

        var headerName = this.columnGroup.getColGroupDef() ? this.columnGroup.getColGroupDef().headerName : null;
        if (_.missing(headerName)) {
            headerName = '>>>'
        }

        eText.innerHTML = headerName;

        this.eExpand = <HTMLElement> this.eGui.querySelector('#eExpand');
        this.eContract = <HTMLElement> this.eGui.querySelector('#eContract');

        this.eContract.appendChild(_.createIcon('groupContracted', this.gridOptionsWrapper, null, svgFactory.createArrowRightSvg));
        this.eExpand.appendChild(_.createIcon('groupExpanded', this.gridOptionsWrapper, null, svgFactory.createArrowDownSvg));

        this.eGui.style.marginLeft = (this.columnDept * 10) + 'px';

        this.eExpand.addEventListener('click', this.onExpandOrContractClicked.bind(this, false));
        this.eContract.addEventListener('click', this.onExpandOrContractClicked.bind(this, true));

        eText.addEventListener('dblclick', () =>  this.onExpandOrContractClicked(!this.expanded));

        this.setIconVisibility();
    }

    private onExpandOrContractClicked(newValue: boolean): void {
        console.log(`${Math.random()} value is ${newValue}`);
        this.expanded = newValue;
        this.setIconVisibility();
        this.expandedCallback();
    }

    private setIconVisibility(): void {
        _.setVisible(this.eExpand, this.expanded);
        _.setVisible(this.eContract, !this.expanded);
    }

    public destroy(): void {
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public isExpanded(): boolean {
        return this.expanded;
    }
}