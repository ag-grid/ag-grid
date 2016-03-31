import {Utils as _, Component, Autowired, PostConstruct, GridOptionsWrapper} from "ag-grid/main";

export class RichList extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private static TEMPLATE =
        '<div>'+
            '<div class="ag-filter-header-container">'+
                '<input class="ag-filter-filter" type="text" placeholder="[SEARCH...]"/>'+
            '</div>'+
            '<div class="ag-filter-header-container">'+
                '<label>'+
                    '<input id="selectAll" type="checkbox" class="ag-filter-checkbox"/>'+
                    '([SELECT ALL])'+
                '</label>'+
            '</div>'+
            '<div class="ag-filter-list-viewport">'+
                '<div class="ag-filter-list-container">'+
                    '<div id="itemForRepeat" class="ag-filter-item">'+
                        '<label>'+
                        '<input type="checkbox" class="ag-filter-checkbox" filter-checkbox="true"/>'+
                        '<span class="ag-filter-value"></span>'+
                    '</label>'+
                '</div>'+
                '</div>'+
            '</div>'+
        '</div>';

    constructor() {
        super(null);
    }

    @PostConstruct
    private init(): void {
        this.setTemplate(RichList.TEMPLATE);
    }

    private createTemplate() {
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        return RichList.TEMPLATE
            .replace('[SELECT ALL]', localeTextFunc('selectAll', 'Select All'))
            .replace('[SEARCH...]', localeTextFunc('searchOoo', 'Search...'))
            .replace('[APPLY FILTER]', localeTextFunc('applyFilter', 'Apply Filter'));
    }

}
