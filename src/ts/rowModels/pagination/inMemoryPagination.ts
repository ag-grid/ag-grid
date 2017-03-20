import {Bean, Autowired, PostConstruct} from "../../context/context";
import {PaginationStrategy} from "./paginationService";
import {IRowModel} from "../../interfaces/iRowModel";
import {IInMemoryRowModel} from "../../interfaces/iInMemoryRowModel";
import {PaginationModel, PaginationDef} from "../inMemory/inMemoryRowModel";


@Bean('clientSidePaginationStrategy')
export class ClientSidePaginationStrategy implements PaginationStrategy {
    @Autowired('rowModel') private rowModel: IRowModel;
    private inMemoryRowModel: IInMemoryRowModel;

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
        this.setPaginationDef({
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
        if (!this.inMemoryRowModel.getPaginationModel()) return null;
        return this.inMemoryRowModel.getPaginationModel().allRowsCount;
    }

    setPaginationDef(memoryPaginationDef: PaginationDef) {
        this.inMemoryRowModel.setPaginationDef(memoryPaginationDef);
    }
}
