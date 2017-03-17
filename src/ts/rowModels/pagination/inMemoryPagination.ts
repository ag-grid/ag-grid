import {Bean, Autowired, PostConstruct} from "../../context/context";
import {PaginationStrategy} from "./paginationService";
import {IRowModel} from "../../interfaces/iRowModel";
import {IInMemoryRowModel} from "../../interfaces/iInMemoryRowModel";
import {PaginationModel, InMemoryPaginationDef} from "../inMemory/inMemoryRowModel";


@Bean('inMemoryPaginationStrategy')
export class InMemoryPaginationStrategy implements PaginationStrategy {
    @Autowired('rowModel') private rowModel: IRowModel;
    private inMemoryRowModel: IInMemoryRowModel;
    private paginationModel:PaginationModel;

    @PostConstruct
    public init() {
        // if we are doing pagination, we are guaranteed that the model type
        // is normal. if it is not, then this paginationController service
        // will never be called.
        this.inMemoryRowModel = <IInMemoryRowModel> this.rowModel;
    }

    isReady(): boolean {
        return true;
    }

    onLoadPage(currentPage: number, pageSize: number, doneCb: () => void): void {
        this.paginate({
            currentPage: currentPage,
            pageSize: pageSize
        });
        doneCb();
    }

    onSortOrFilterPage(currentPage:number, pageSize:number, doneCb:()=>void): void {
        //In memory sort and filter handled directly by the inMemoryRowModel, at this point is performed
        //already so we only need to get the freshest pagination model.
        doneCb();
    }

    rowCount(): number {
        return this.inMemoryRowModel.getPaginationModel().allRowsCount;
    }

    paginate(memoryPaginationDef: InMemoryPaginationDef) {
        this.paginationModel = this.inMemoryRowModel.setPagination(memoryPaginationDef);
    }
}
