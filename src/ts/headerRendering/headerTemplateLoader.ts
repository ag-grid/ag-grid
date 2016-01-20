/// <reference path="../utils.ts"/>
/// <reference path="../svgFactory.ts"/>

module ag.grid {

    var _ = Utils;
    var svgFactory = SvgFactory.getInstance();

    export class HeaderTemplateLoader {

        private static HEADER_CELL_TEMPLATE =
            '<div class="ag-header-cell">' +
            '  <div id="agResizeBar" class="ag-header-cell-resize"></div>' +
            '  <span id="agMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
            '  <span class="ag-header-cell-label">' +
            '    <span id="agSortAsc" class="ag-header-icon ag-sort-ascending-icon"></span>' +
            '    <span id="agSortDesc" class="ag-header-icon ag-sort-descending-icon"></span>' +
            '    <span id="agNoSort" class="ag-header-icon ag-sort-none-icon"></span>' +
            '    <span id="agFilter" class="ag-header-icon ag-filter-icon"></span>' +
            '    <span id="agText" class="ag-header-cell-text"></span>' +
            '  </span>' +
            '</div>';

        private gridOptionsWrapper: GridOptionsWrapper;

        public init(gridOptionsWrapper: GridOptionsWrapper): void {
            this.gridOptionsWrapper = gridOptionsWrapper;
        }

        public createHeaderElement(column: Column): HTMLElement {

            var eTemplate = <HTMLElement> _.loadTemplate(HeaderTemplateLoader.HEADER_CELL_TEMPLATE);

            this.addInIcon(eTemplate, 'sortAscending', '#agSortAsc', column, svgFactory.createArrowUpSvg);
            this.addInIcon(eTemplate, 'sortDescending', '#agSortDesc', column, svgFactory.createArrowDownSvg);
            this.addInIcon(eTemplate, 'sortUnSort', '#agNoSort', column, svgFactory.createArrowUpDownSvg);
            this.addInIcon(eTemplate, 'menu', '#agMenu', column, svgFactory.createMenuSvg);
            this.addInIcon(eTemplate, 'filter', '#agFilter', column, svgFactory.createFilterSvg);

            return eTemplate;
        }

        private addInIcon(eTemplate: HTMLElement, iconName: string, cssSelector: string, column: Column, defaultIconFactory: () => Node): void {
            var eIcon = _.createIconNoSpan(iconName, this.gridOptionsWrapper, column, defaultIconFactory);
            eTemplate.querySelector(cssSelector).appendChild(eIcon);
        }
    }
}