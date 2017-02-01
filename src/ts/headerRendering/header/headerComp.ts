
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
import {QuerySelector} from "../../widgets/componentAnnotations";

export interface IHeaderCompParams {
    column: Column;
    displayName: string;
    enableSorting: boolean;
    enableMenu: boolean;
}

export interface IHeader {

}

export interface IHeaderComp extends IHeader, IComponent<IHeaderCompParams> {

}

// class MyReactHeader extends React.Component implements IHeader {
//
// }

var svgFactory = SvgFactory.getInstance();

export class HeaderComp extends Component implements IHeaderComp {
    private static TEMPLATE =
        '<div>' +
        '  <span ref="agMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
        '  <div ref="agLabel" class="ag-header-cell-label">' +
        '    <span ref="agSortAsc" class="ag-header-icon ag-sort-ascending-icon"></span>' +
        '    <span ref="agSortDesc" class="ag-header-icon ag-sort-descending-icon"></span>' +
        '    <span ref="agNoSort" class="ag-header-icon ag-sort-none-icon"></span>' +
        '    <span ref="agFilter" class="ag-header-icon ag-filter-icon"></span>' +
        '    <span ref="agText" class="ag-header-cell-text"></span>' +
        '  </div>' +
        '</div>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('menuFactory') private menuFactory: IMenuFactory;

    private eFilterIcon: HTMLElement;
    private eSortAsc: HTMLElement;
    private eSortDesc: HTMLElement;
    private eSortNone: HTMLElement;

    private params:IHeaderCompParams;

    constructor() {
        super(HeaderComp.TEMPLATE);
    }

    public init(params: IHeaderCompParams): void {
        this.params = params;

        this.setupTap();
        this.setupIcons(params.column);
        this.setupMenu();
        this.setupSort(this.getRefElement("agLabel"));
        this.setupFilterIcon();
        this.setupText(params.displayName);
    }

    private setupText(displayName: string): void {
        var eText = this.getRefElement('agText');
        eText.innerHTML = displayName;
    }

    private setupIcons(column:Column): void {
        this.addInIcon('sortAscending', 'agSortAsc', column, svgFactory.createArrowUpSvg);
        this.addInIcon('sortDescending', 'agSortDesc', column, svgFactory.createArrowDownSvg);
        this.addInIcon('sortUnSort', 'agNoSort', column, svgFactory.createArrowUpDownSvg);
        this.addInIcon('menu', 'agMenu', column, svgFactory.createMenuSvg);
        this.addInIcon('filter', 'agFilter', column, svgFactory.createFilterSvg);
    }

    private addInIcon(iconName: string, refName: string, column: Column, defaultIconFactory: () => HTMLElement): void {
        var eIcon = _.createIconNoSpan(iconName, this.gridOptionsWrapper, column, defaultIconFactory);
        this.getRefElement(refName).appendChild(eIcon);
    }

    private setupTap(): void {
        if (this.gridOptionsWrapper.isSuppressTouch()) { return; }

        let touchListener = new TouchListener(this.getGui());
        let tapListener = ()=> {
            this.sortController.progressSort(this.params.column, false);
        };
        let longTapListener = (touch: Touch)=> {
            this.gridOptionsWrapper.getApi().showColumnMenuAfterMouseClick(this.params.column, touch);
        };

        this.addDestroyableEventListener(touchListener, TouchListener.EVENT_TAP, tapListener);
        this.addDestroyableEventListener(touchListener, TouchListener.EVENT_LONG_TAP, longTapListener);

        this.addDestroyFunc( ()=> touchListener.destroy() );
    }

    private setupMenu(): void {
        let eMenu = this.getRefElement('agMenu');

        // if no menu provided in template, do nothing
        if (!eMenu) {
            return;
        }

        if (!this.params.enableMenu) {
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
        this.menuFactory.showMenuAfterButtonClick(this.params.column, eventSource);
    }

    public setupSort(eHeaderCellLabel: HTMLElement): void {
        var enableSorting = this.params.enableSorting;

        if (!enableSorting) {
            _.removeFromParent(this.getRefElement('agSortAsc'));
            _.removeFromParent(this.getRefElement('agSortDesc'));
            _.removeFromParent(this.getRefElement('agNoSort'));
            return;
        }

        // add the event on the header, so when clicked, we do sorting
        if (eHeaderCellLabel) {
            eHeaderCellLabel.addEventListener("click", (event:MouseEvent) => {
                this.sortController.progressSort(this.params.column, event.shiftKey);
            });
        }

        // add listener for sort changing, and update the icons accordingly
        this.eSortAsc = this.getRefElement('agSortAsc');
        this.eSortDesc = this.getRefElement('agSortDesc');
        this.eSortNone = this.getRefElement('agNoSort');

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

    private setupFilterIcon(): void {
        this.eFilterIcon = this.getRefElement('agFilter');

        if (!this.eFilterIcon) {
            return;
        }

        this.addDestroyableEventListener(this.params.column, Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.onFilterChanged();
    }

    private onFilterChanged(): void {
        var filterPresent = this.params.column.isFilterActive();
        _.addOrRemoveCssClass(this.eFilterIcon, 'ag-hidden', !filterPresent);
    }

}