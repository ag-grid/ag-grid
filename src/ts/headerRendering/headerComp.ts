
import {Component} from "../widgets/component";
import {Column} from "../entities/column";
import {Utils as _} from "../utils";
import {Autowired, Context, PostConstruct} from "../context/context";
import {FilterManager} from "../filter/filterManager";
import {GridCore} from "../gridCore";
import {HeaderTemplateLoader} from "./headerTemplateLoader";
import {IMenuFactory} from "../interfaces/iMenuFactory";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {SortController} from "../sortController";
import {DropTarget} from "../dragAndDrop/dragAndDropService";
import {TouchListener} from "../widgets/touchListener";
import {IComponent} from "../interfaces/iComponent";

export interface IHeaderCompParams {
    column: Column;
    displayName: string;
}

export interface IHeader {

}

export interface IHeaderComp extends IHeader, IComponent<any> {

}

// class MyReactHeader extends React.Component implements IHeader {
//
// }

export class HeaderComp extends Component implements IHeaderComp {

    private static TEMPLATE =
        '<div>' +
        '  <span ref="agMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
        '  <div class="ag-header-cell-label">' +
        '    <span ref="agSortAsc" class="ag-header-icon ag-sort-ascending-icon"></span>' +
        '    <span ref="agSortDesc" class="ag-header-icon ag-sort-descending-icon"></span>' +
        '    <span ref="agNoSort" class="ag-header-icon ag-sort-none-icon"></span>' +
        '    <span ref="agFilter" class="ag-header-icon ag-filter-icon"></span>' +
        '    <span ref="agText" class="ag-header-cell-text"></span>' +
        '  </div>' +
        '</div>';

    private column: Column;

    constructor() {
        super(HeaderComp.TEMPLATE);
    }

    public init(params: IHeaderCompParams): void {
        this.column = params.column;

        // this.setupTap();
        // this.setupMenu();
        // this.setupSort();
        // this.setupFilterIcon();
        this.setupText(params.displayName);
    }

    private setupText(displayName: string): void {
        var eText = this.queryForHtmlElement('[ref="agText"]');
        eText.innerHTML = displayName;
    }

}



export class RenderedHeaderCell_ForButcher extends Component {

    @Autowired('context') private context: Context;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('$compile') private $compile: any;
    @Autowired('gridCore') private gridCore: GridCore;
    @Autowired('headerTemplateLoader') private headerTemplateLoader: HeaderTemplateLoader;
    @Autowired('menuFactory') private menuFactory: IMenuFactory;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('$scope') private $scope: any;

    private eRoot: HTMLElement;

    private column: Column;
    private childScope: any;

    private dragSourceDropTarget: DropTarget;

    private displayName: string;

    private eFilterIcon: HTMLElement;

    private eSortAsc: HTMLElement;
    private eSortDesc: HTMLElement;
    private eSortNone: HTMLElement;

    private pinned: string;

    constructor(column: Column, eRoot: HTMLElement, dragSourceDropTarget: DropTarget, pinned: string) {
        super();
        this.column = column;
        this.eRoot = eRoot;
        this.dragSourceDropTarget = dragSourceDropTarget;
        this.pinned = pinned;
    }

    public getColumn(): Column {
        return this.column;
    }

    @PostConstruct
    public init(): void {

        let eGui: HTMLElement = null;

        // label div
        var eHeaderCellLabel = <HTMLElement> eGui.querySelector('#agHeaderCellLabel');

        // this.displayName = this.columnController.getDisplayNameForColumn(this.column, 'header', true);


    }

    private setupFilterIcon(): void {
        this.eFilterIcon = this.queryForHtmlElement('#agFilter');

        if (!this.eFilterIcon) {
            return;
        }

        this.addDestroyableEventListener(this.column, Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));

        this.onFilterChanged();
    }

    private onFilterChanged(): void {
        var filterPresent = this.column.isFilterActive();
        _.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-filtered', filterPresent);
        _.addOrRemoveCssClass(this.eFilterIcon, 'ag-hidden', !filterPresent);
    }

    private setupMenu(): void {
        var eMenu = this.queryForHtmlElement('#agMenu');

        // if no menu provided in template, do nothing
        if (!eMenu) {
            return;
        }

        var skipMenu = !this.menuFactory.isMenuEnabled(this.column) || this.column.getColDef().suppressMenu;

        if (skipMenu) {
            _.removeFromParent(eMenu);
            return;
        }

        eMenu.addEventListener('click', ()=> this.showMenu(eMenu));

        if (!this.gridOptionsWrapper.isSuppressMenuHide()) {
            eMenu.style.opacity = '0';
            this.addGuiEventListener('mouseover', function () {
                eMenu.style.opacity = '1';
            });
            this.addGuiEventListener('mouseout', function () {
                eMenu.style.opacity = '0';
            });
        }
        var style = <any> eMenu.style;
        style['transition'] = 'opacity 0.2s, border 0.2s';
        style['-webkit-transition'] = 'opacity 0.2s, border 0.2s';
    }

    public showMenu(eventSource: HTMLElement) {
        this.menuFactory.showMenuAfterButtonClick(this.column, eventSource);
    }

    private setupTap(): void {

        if (this.gridOptionsWrapper.isSuppressTouch()) { return; }

        let touchListener = new TouchListener(this.getGui());
        let tapListener = ()=> {
            this.sortController.progressSort(this.column, false);
        };
        let longTapListener = (touch: Touch)=> {
            this.gridOptionsWrapper.getApi().showColumnMenuAfterMouseClick(this.column, touch);
        };

        this.addDestroyableEventListener(touchListener, TouchListener.EVENT_TAP, tapListener);
        this.addDestroyableEventListener(touchListener, TouchListener.EVENT_LONG_TAP, longTapListener);

        this.addDestroyFunc( ()=> touchListener.destroy() );
    }

    private useRenderer(headerNameValue: string, headerCellRenderer: Function, eText: HTMLElement): void {
        // renderer provided, use it
        var cellRendererParams = {
            colDef: this.column.getColDef(),
            $scope: this.childScope,
            context: this.gridOptionsWrapper.getContext(),
            value: headerNameValue,
            api: this.gridOptionsWrapper.getApi(),
            eHeaderCell: this.getGui()
        };
        var cellRendererResult = headerCellRenderer(cellRendererParams);
        var childToAppend: any;
        if (_.isNodeOrElement(cellRendererResult)) {
            // a dom node or element was returned, so add child
            childToAppend = cellRendererResult;
        } else {
            // otherwise assume it was html, so just insert
            var eTextSpan = document.createElement("span");
            eTextSpan.innerHTML = cellRendererResult;
            childToAppend = eTextSpan;
        }
        // angular compile header if option is turned on
        if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
            var childToAppendCompiled = this.$compile(childToAppend)(this.childScope)[0];
            eText.appendChild(childToAppendCompiled);
        } else {
            eText.appendChild(childToAppend);
        }
    }

    public setupSort(eHeaderCellLabel: HTMLElement): void {
        var enableSorting = this.gridOptionsWrapper.isEnableSorting() && !this.column.getColDef().suppressSorting;
        let eGui = this.getGui();
        if (!enableSorting) {
            _.removeFromParent(eGui.querySelector('#agSortAsc'));
            _.removeFromParent(eGui.querySelector('#agSortDesc'));
            _.removeFromParent(eGui.querySelector('#agNoSort'));
            return;
        }

        // add sortable class for styling
        _.addCssClass(eGui, 'ag-header-cell-sortable');

        // add the event on the header, so when clicked, we do sorting
        if (eHeaderCellLabel) {
            eHeaderCellLabel.addEventListener("click", (event:MouseEvent) => {
                this.sortController.progressSort(this.column, event.shiftKey);
            });
        }

        // add listener for sort changing, and update the icons accordingly
        this.eSortAsc = this.queryForHtmlElement('#agSortAsc');
        this.eSortDesc = this.queryForHtmlElement('#agSortDesc');
        this.eSortNone = this.queryForHtmlElement('#agNoSort');

        this.addDestroyableEventListener(this.column, Column.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.onSortChanged();
    }

    private onSortChanged(): void {

        _.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-asc', this.column.isSortAscending());
        _.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-desc', this.column.isSortDescending());
        _.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-none', this.column.isSortNone());

        if (this.eSortAsc) {
            _.addOrRemoveCssClass(this.eSortAsc, 'ag-hidden', !this.column.isSortAscending());
        }

        if (this.eSortDesc) {
            _.addOrRemoveCssClass(this.eSortDesc, 'ag-hidden', !this.column.isSortDescending());
        }

        if (this.eSortNone) {
            var alwaysHideNoSort = !this.column.getColDef().unSortIcon && !this.gridOptionsWrapper.isUnSortIcon();
            _.addOrRemoveCssClass(this.eSortNone, 'ag-hidden', alwaysHideNoSort || !this.column.isSortNone());
        }
    }

}
