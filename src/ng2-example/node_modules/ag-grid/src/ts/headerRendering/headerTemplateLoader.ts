import {Utils as _} from "../utils";
import {SvgFactory} from "../svgFactory";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Column} from "../entities/column";
import {Bean, Autowired} from "../context/context";

var svgFactory = SvgFactory.getInstance();

@Bean('headerTemplateLoader')
export class HeaderTemplateLoader {

    private static HEADER_CELL_TEMPLATE =
        '<div class="ag-header-cell">' +
        '  <div id="agResizeBar" class="ag-header-cell-resize"></div>' +
        '  <span id="agMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
        '  <div id="agHeaderCellLabel" class="ag-header-cell-label">' +
        '    <span id="agSortAsc" class="ag-header-icon ag-sort-ascending-icon"></span>' +
        '    <span id="agSortDesc" class="ag-header-icon ag-sort-descending-icon"></span>' +
        '    <span id="agNoSort" class="ag-header-icon ag-sort-none-icon"></span>' +
        '    <span id="agFilter" class="ag-header-icon ag-filter-icon"></span>' +
        '    <span id="agText" class="ag-header-cell-text"></span>' +
        '  </div>' +
        '</div>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public createHeaderElement(column: Column): HTMLElement {

        var params = {
            column: column,
            colDef: column.getColDef,
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridOptionsWrapper.getApi()
        };

        // option 1 - see if user provided a template in colDef
        var userProvidedTemplate = column.getColDef().headerCellTemplate;
        if (typeof userProvidedTemplate === 'function') { // and if they did, and it's a function, execute it
            var colDefFunc = (<(params: any) => string> userProvidedTemplate);
            userProvidedTemplate = colDefFunc(params);
        }
        // option 2 - check the gridOptions for cellTemplate
        if (!userProvidedTemplate && this.gridOptionsWrapper.getHeaderCellTemplate()) {
            userProvidedTemplate = this.gridOptionsWrapper.getHeaderCellTemplate();
        }
        // option 3 - check the gridOptions for templateFunction
        if (!userProvidedTemplate && this.gridOptionsWrapper.getHeaderCellTemplateFunc()) {
            var gridOptionsFunc = this.gridOptionsWrapper.getHeaderCellTemplateFunc();
            userProvidedTemplate = gridOptionsFunc(params);
        }
        // finally, if still no template, use the default
        if (!userProvidedTemplate) {
            userProvidedTemplate = this.createDefaultHeaderElement(column);
        }

        // template can be a string or a dom element, if string we need to convert to a dom element
        var result: HTMLElement;
        if (typeof userProvidedTemplate === 'string') {
            result = <HTMLElement> _.loadTemplate(userProvidedTemplate);
        } else if (_.isNodeOrElement(userProvidedTemplate)) {
            result = <HTMLElement> userProvidedTemplate;
        } else {
            console.error('ag-Grid: header template must be a string or an HTML element');
        }

        return result;
    }

    public createDefaultHeaderElement(column: Column): HTMLElement {

        var eTemplate = <HTMLElement> _.loadTemplate(HeaderTemplateLoader.HEADER_CELL_TEMPLATE);

        this.addInIcon(eTemplate, 'sortAscending', '#agSortAsc', column, svgFactory.createArrowUpSvg);
        this.addInIcon(eTemplate, 'sortDescending', '#agSortDesc', column, svgFactory.createArrowDownSvg);
        this.addInIcon(eTemplate, 'sortUnSort', '#agNoSort', column, svgFactory.createArrowUpDownSvg);
        this.addInIcon(eTemplate, 'menu', '#agMenu', column, svgFactory.createMenuSvg);
        this.addInIcon(eTemplate, 'filter', '#agFilter', column, svgFactory.createFilterSvg);

        return eTemplate;
    }

    private addInIcon(eTemplate: HTMLElement, iconName: string, cssSelector: string, column: Column, defaultIconFactory: () => HTMLElement): void {
        var eIcon = _.createIconNoSpan(iconName, this.gridOptionsWrapper, column, defaultIconFactory);
        eTemplate.querySelector(cssSelector).appendChild(eIcon);
    }
}
