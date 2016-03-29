import {Utils as _, Component, Autowired, PostConstruct, GridOptionsWrapper} from "ag-grid/main";

var template =
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

export class RichList extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    constructor() {
        super(null);
    }

    @PostConstruct
    private init(): void {
        this.setTemplate('<div>inside the rich list</div>');
    }
}
