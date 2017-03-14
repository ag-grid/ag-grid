import {IDatasource} from "../iDatasource";
import {Autowired, Bean} from "../../context/context";
import {SortService} from "../../rowNodes/sortService";
import {PaginationDataSource} from "./paginationDataSource";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {FilterService} from "../../rowNodes/filterService";
import {RowNodeFactory} from "../../rowNodes/rowNodeFactory";

@Bean("paginationDataSourceFactory")
export class PaginationDataSourceFactory {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('sortService') private sortService: SortService;
    @Autowired('filterService') private filterService: FilterService;
    @Autowired('rowNodeFactory') private rowNodeFactory: RowNodeFactory;

    public create (data:any[]):IDatasource{
        this.gridOptionsWrapper.setProperty("enableServerSideSorting", true);
        this.gridOptionsWrapper.setProperty("enableServerSideFilter", true);

        return new PaginationDataSource (
            this.rowNodeFactory.create(data),
            this.sortService,
            this.filterService
        )
    }
}