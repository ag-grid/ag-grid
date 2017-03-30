import {Component} from "../../widgets/component";
import {Column} from "../../entities/column";
import {Utils as _} from "../../utils";
import {Autowired} from "../../context/context";
import {IMenuFactory} from "../../interfaces/iMenuFactory";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {SortController} from "../../sortController";
import {TouchListener} from "../../widgets/touchListener";
import {IComponent} from "../../interfaces/iComponent";
import {SvgFactory} from "../../svgFactory";
import {EventService} from "../../eventService";
import {RefSelector} from "../../widgets/componentAnnotations";
import {Events} from "../../events";
import {ColumnApi} from "../../columnController/columnController";
import {GridApi} from "../../gridApi";

export interface IHeaderParams {
    column: Column;
    displayName: string;
    enableSorting: boolean;
    enableMenu: boolean;
    showColumnMenu: (source:HTMLElement)=>void;
    progressSort: (multiSort?: boolean)=>void;
    setSort: (sort: string, multiSort?: boolean)=>void;
    columnApi: ColumnApi,
    api: GridApi,
    context: any
}

export interface IHeader {

}

export interface IHeaderComp extends IHeader, IComponent<IHeaderParams> {

}

var svgFactory = SvgFactory.getInstance();

export class HeaderComp extends Component implements IHeaderComp {

    private static TEMPLATE =
        '<div>' +
        '  <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
        '  <div ref="eLabel" class="ag-header-cell-label">' +
        '    <span ref="eSortOrder" class="ag-header-icon ag-sort-order"></span>' +
        '    <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon"></span>' +
        '    <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon"></span>' +
        '    <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon"></span>' +
        '    <span ref="eFilter" class="ag-header-icon ag-filter-icon"></span>' +
        '    <span ref="eText" class="ag-header-cell-text"></span>' +
        '  </div>' +
        '</div>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('menuFactory') private menuFactory: IMenuFactory;
    @Autowired('eventService') private eventService: EventService;

    @RefSelector('eFilter') private eFilter: HTMLElement;
    @RefSelector('eSortAsc') private eSortAsc: HTMLElement;

    @RefSelector('eSortDesc') private eSortDesc: HTMLElement;
    @RefSelector('eSortNone') private eSortNone: HTMLElement;
    @RefSelector('eSortOrder') private eSortOrder: HTMLElement;
    @RefSelector('eMenu') private eMenu: HTMLElement;
    @RefSelector('eLabel') private eLabel: HTMLElement;
    @RefSelector('eText') private eText: HTMLElement;

    private params:IHeaderParams;

    constructor() {
        super(HeaderComp.TEMPLATE);
    }

    public init(params: IHeaderParams): void {
        this.params = params;

        this.setupTap();
        this.setupIcons(params.column);
        this.setupMenu();
        this.setupSort();
        this.setupFilterIcon();
        this.setupText(params.displayName);

        this.addDestroyableEventListener(this.eventService, Events.EVENT_SORT_CHANGED, this.setMultiSortOrder.bind(this));
    }

    private setupText(displayName: string): void {
        this.eText.innerHTML = displayName;
    }

    private setupIcons(column:Column): void {
        this.addInIcon('sortAscending', this.eSortAsc, column, svgFactory.createArrowUpSvg);
        this.addInIcon('sortDescending', this.eSortDesc, column, svgFactory.createArrowDownSvg);
        this.addInIcon('sortUnSort', this.eSortNone, column, svgFactory.createArrowUpDownSvg);
        this.addInIcon('menu', this.eMenu, column, svgFactory.createMenuSvg);
        this.addInIcon('filter', this.eFilter, column, svgFactory.createFilterSvg);
    }

    private addInIcon(iconName: string, eParent: HTMLElement, column: Column, defaultIconFactory: () => HTMLElement): void {
        var eIcon = _.createIconNoSpan(iconName, this.gridOptionsWrapper, column, defaultIconFactory);
        eParent.appendChild(eIcon);
    }

    private setupTap(): void {
        if (this.gridOptionsWrapper.isSuppressTouch()) { return; }

        let touchListener = new TouchListener(this.getGui());

        if (this.params.enableMenu) {
            let longTapListener = (touch: Touch)=> {
                this.gridOptionsWrapper.getApi().showColumnMenuAfterMouseClick(this.params.column, touch);
            };
            this.addDestroyableEventListener(touchListener, TouchListener.EVENT_LONG_TAP, longTapListener);
        }

        if (this.params.enableSorting) {
            let tapListener = ()=> {
                this.sortController.progressSort(this.params.column, false);
            };

            this.addDestroyableEventListener(touchListener, TouchListener.EVENT_TAP, tapListener);
        }

        this.addDestroyFunc( ()=> touchListener.destroy() );
    }

    private setupMenu(): void {

        // if no menu provided in template, do nothing
        if (!this.eMenu) {
            return;
        }

        if (!this.params.enableMenu) {
            _.removeFromParent(this.eMenu);
            return;
        }

        this.eMenu.addEventListener('click', ()=> this.showMenu(this.eMenu));

        if (!this.gridOptionsWrapper.isSuppressMenuHide()) {
            this.eMenu.style.opacity = '0';
            this.addGuiEventListener('mouseover', ()=> {
                this.eMenu.style.opacity = '1';
            });
            this.addGuiEventListener('mouseout', ()=> {
                this.eMenu.style.opacity = '0';
            });
        }
        var style = <any> this.eMenu.style;
        style['transition'] = 'opacity 0.2s, border 0.2s';
        style['-webkit-transition'] = 'opacity 0.2s, border 0.2s';
    }

    public showMenu(eventSource: HTMLElement) {
        this.menuFactory.showMenuAfterButtonClick(this.params.column, eventSource);
    }

    public setupSort(): void {
        var enableSorting = this.params.enableSorting;

        if (!enableSorting) {
            _.removeFromParent(this.eSortAsc);
            _.removeFromParent(this.eSortDesc);
            _.removeFromParent(this.eSortNone);
            _.removeFromParent(this.eSortOrder);
            return;
        }

        // add the event on the header, so when clicked, we do sorting
        if (this.eLabel) {
            this.eLabel.addEventListener('click', (event:MouseEvent) => {
                this.params.progressSort(event.shiftKey);
            });
        }

        this.addDestroyableEventListener(this.params.column, Column.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.onSortChanged();
    }

    private onSortChanged(): void {

        _.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-asc', this.params.column.isSortAscending());
        _.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-desc', this.params.column.isSortDescending());
        _.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-none', this.params.column.isSortNone());

        if (this.eSortAsc) {
            _.addOrRemoveCssClass(this.eSortAsc, 'ag-hidden', !this.params.column.isSortAscending());
        }

        if (this.eSortDesc) {
            _.addOrRemoveCssClass(this.eSortDesc, 'ag-hidden', !this.params.column.isSortDescending());
        }

        if (this.eSortNone) {
            var alwaysHideNoSort = !this.params.column.getColDef().unSortIcon && !this.gridOptionsWrapper.isUnSortIcon();
            _.addOrRemoveCssClass(this.eSortNone, 'ag-hidden', alwaysHideNoSort || !this.params.column.isSortNone());
        }
    }

    // we listen here for global sort events, NOT column sort events, as we want to do this
    // when sorting has been set on all column (if we listened just for our col (where we
    // set the asc / desc icons) then it's possible other cols are yet to get their sorting state.
    private setMultiSortOrder(): void {

        if (!this.eSortOrder) {
            return;
        }

        let col = this.params.column;
        let allColumnsWithSorting = this.sortController.getColumnsWithSortingOrdered();
        let indexThisCol = allColumnsWithSorting.indexOf(col);
        let moreThanOneColSorting = allColumnsWithSorting.length > 1;
        let showIndex = col.isSorting() && moreThanOneColSorting;

        _.setVisible(this.eSortOrder, showIndex);

        if (indexThisCol>=0) {
            this.eSortOrder.innerHTML = (indexThisCol+1).toString();
        } else {
            this.eSortOrder.innerHTML = '';
        }
    }

    private setupFilterIcon(): void {

        if (!this.eFilter) {
            return;
        }

        this.addDestroyableEventListener(this.params.column, Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.onFilterChanged();
    }

    private onFilterChanged(): void {
        var filterPresent = this.params.column.isFilterActive();
        _.addOrRemoveCssClass(this.eFilter, 'ag-hidden', !filterPresent);
    }

}
