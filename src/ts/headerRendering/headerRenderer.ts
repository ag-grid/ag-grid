import _ from '../utils';
import HeaderTemplateLoader from "./headerTemplateLoader";
import GridOptionsWrapper from "../gridOptionsWrapper";
import {ColumnController} from "../columnController/columnController";
import {Grid} from "../grid";
import FilterManager from "../filter/filterManager";
import GridPanel from "../gridPanel/gridPanel";
import {ColumnGroupChild} from "../entities/columnGroupChild";
import ColumnGroup from "../entities/columnGroup";
import RenderedHeaderGroupCell from "./renderedHeaderGroupCell";
import Column from "../entities/column";
import RenderedHeaderCell from "./renderedHeaderCell";
import {DragService} from "./dragService";
import {Bean} from "../context/context";
import {Qualifier} from "../context/context";
import {GridCore} from "../gridCore";
import {IMenuFactory} from "../interfaces/iMenuFactory";
import PopupService from "../widgets/agPopupService";
import {Autowired} from "../context/context";
import {Context} from "../context/context";
import {IRenderedHeaderElement} from "./iRenderedHeaderElement";

@Bean('headerRenderer')
export default class HeaderRenderer {

    @Autowired('headerTemplateLoader') private headerTemplateLoader: HeaderTemplateLoader;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridCore') private grid: GridCore;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('$scope') private $scope: any;
    @Autowired('$compile') private $compile: any;
    @Autowired('dragService') private dragService: DragService;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('menuFactory') private menuFactory: IMenuFactory;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('context') private context: Context;

    private ePinnedLeftHeader: HTMLElement;
    private ePinnedRightHeader: HTMLElement;
    private eHeaderContainer: HTMLElement;
    private eHeaderViewport: HTMLElement;
    private eRoot: HTMLElement;
    private eHeaderOverlay: HTMLElement;

    private headerElements: IRenderedHeaderElement[] = [];

    private agPostWire() {
        this.ePinnedLeftHeader = this.gridPanel.getPinnedLeftHeader();
        this.ePinnedRightHeader = this.gridPanel.getPinnedRightHeader();
        this.eHeaderContainer = this.gridPanel.getHeaderContainer();
        this.eHeaderViewport = this.gridPanel.getHeaderViewport();
        this.eRoot = this.gridPanel.getRoot();
        this.eHeaderOverlay = this.gridPanel.getHeaderOverlay();
    }

    public refreshHeader() {
        _.removeAllChildren(this.ePinnedLeftHeader);
        _.removeAllChildren(this.ePinnedRightHeader);
        _.removeAllChildren(this.eHeaderContainer);

        this.headerElements.forEach( (headerElement: IRenderedHeaderElement) => {
            headerElement.destroy();
        });
        this.headerElements = [];

        this.insertHeaderRowsIntoContainer(this.columnController.getLeftDisplayedColumnGroups(), this.ePinnedLeftHeader);
        this.insertHeaderRowsIntoContainer(this.columnController.getRightDisplayedColumnGroups(), this.ePinnedRightHeader);
        this.insertHeaderRowsIntoContainer(this.columnController.getCenterDisplayedColumnGroups(), this.eHeaderContainer);
    }

    public addChildToOverlay(child: HTMLElement): void {
        if (this.eHeaderOverlay) {
            this.eHeaderOverlay.appendChild(child);
        }
    }

    public removeChildFromOverlay(child: HTMLElement): void {
        if (this.eHeaderOverlay) {
            this.eHeaderOverlay.removeChild(child);
        }
    }

    private addTreeNodesAtDept(cellTree: ColumnGroupChild[], dept: number, result: ColumnGroupChild[]): void {
        cellTree.forEach( (abstractColumn) => {
            if (dept===0) {
                result.push(abstractColumn);
            } else if (abstractColumn instanceof ColumnGroup) {
                var columnGroup = <ColumnGroup> abstractColumn;
                this.addTreeNodesAtDept(columnGroup.getDisplayedChildren(), dept-1, result);
            } else {
                // we are looking for children past a column, so have come to the end,
                // do nothing, and because the tree is balanced, the result of this recursion
                // will be an empty list.
            }
        });
    }

    public setPinnedColContainerWidth() {
        if (this.gridOptionsWrapper.isForPrint()) {
            // pinned col doesn't exist when doing forPrint
            return;
        }

        var pinnedLeftWidth = this.columnController.getPinnedLeftContainerWidth() + 'px';
        this.eHeaderViewport.style.marginLeft = pinnedLeftWidth;

        var pinnedRightWidth = this.columnController.getPinnedRightContainerWidth() + 'px';
        this.eHeaderViewport.style.marginRight = pinnedRightWidth;
    }

    public getRightPinnedStartPixel(): number {
        var rightStart = this.ePinnedRightHeader.getBoundingClientRect().left;
        var parentStart = this.eHeaderOverlay.getBoundingClientRect().left;
        return rightStart - parentStart;
    }

    private insertHeaderRowsIntoContainer(cellTree: ColumnGroupChild[], eContainerToAddTo: HTMLElement): void {

        // if we are displaying header groups, then we have many rows here.
        // go through each row of the header, one by one.
        var rowHeight = this.gridOptionsWrapper.getHeaderHeight();
        for (var dept = 0; ; dept++) {

            var nodesAtDept: ColumnGroupChild[] = [];
            this.addTreeNodesAtDept(cellTree, dept, nodesAtDept);

            // we want to break the for loop when we get to an empty set of cells,
            // that's how we know we have finished rendering the last row.
            if (nodesAtDept.length===0) {
                break;
            }

            var eRow: HTMLElement = document.createElement('div');
            eRow.className = 'ag-header-row';
            eRow.style.top = (dept * rowHeight) + 'px';
            eRow.style.height = rowHeight + 'px';

            nodesAtDept.forEach( (child: ColumnGroupChild) => {

                // skip groups that have no displayed children. this can happen when the group is broken,
                // and this section happens to have nothing to display for the open / closed state
                if (child instanceof ColumnGroup && (<ColumnGroup>child).getDisplayedChildren().length==0) {
                    return;
                }

                var renderedHeaderElement = this.createHeaderElement(child);
                this.headerElements.push(renderedHeaderElement);
                var eGui = renderedHeaderElement.getGui();
                eRow.appendChild(eGui);
            });

            eContainerToAddTo.appendChild(eRow);
        }

        // if forPrint, overlay is missing
        if (this.eHeaderOverlay) {
            this.eHeaderOverlay.style.height = rowHeight + 'px';
            this.eHeaderOverlay.style.top = ((dept-1) * rowHeight) + 'px';
        }
    }

    private createHeaderElement(columnGroupChild: ColumnGroupChild): IRenderedHeaderElement {
        var result: IRenderedHeaderElement;
        if (columnGroupChild instanceof ColumnGroup) {
            result = new RenderedHeaderGroupCell(<ColumnGroup> columnGroupChild, this.eRoot, this.$scope);
        } else {
            result = new RenderedHeaderCell(<Column> columnGroupChild, this.$scope, this.eRoot);
        }
        this.context.wireBean(result);
        return result;
    }

    public updateSortIcons() {
        this.headerElements.forEach( (headerElement: IRenderedHeaderElement) => {
            headerElement.refreshSortIcon();
        });
    }

    public updateFilterIcons() {
        this.headerElements.forEach( (headerElement: IRenderedHeaderElement) => {
            headerElement.refreshFilterIcon();
        });
    }

    public onIndividualColumnResized(column: Column): void {
        this.headerElements.forEach( (headerElement: IRenderedHeaderElement) => {
            headerElement.onIndividualColumnResized(column);
        });
    }
}
