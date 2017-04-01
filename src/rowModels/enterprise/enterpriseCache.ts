import {
    InfiniteCacheParams,
    RowNode,
    Context,
    PostConstruct,
    Autowired,
    Events,
    EventService,
    IEnterpriseCache,
    IEnterpriseDatasource,
    NumberSequence,
    RowNodeBlock,
    RowNodeCache,
    RowNodeCacheParams
} from "ag-grid";

export interface EnterpriseCacheParams extends RowNodeCacheParams {
    datasource: IEnterpriseDatasource;
    lastAccessedSequence: NumberSequence;
}

export class EnterpriseCache extends RowNodeCache implements IEnterpriseCache {

    private params: EnterpriseCacheParams;

    @Autowired('eventService') private eventService: EventService;

    constructor(params: EnterpriseCacheParams) {
        super(params);
        this.params = params;
    }

    protected dispatchModelUpdated(): void {
        if (this.isActive()) {
            this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
        }
    }
}

export class EnterpriseBlock extends RowNodeBlock {

    @Autowired('context') private context: Context;

    constructor(pageNumber: number, params: InfiniteCacheParams) {
        super(pageNumber, params);
    }

    @PostConstruct
    protected init(): void {
        super.init({
            context: this.context
        });
    }

    protected setTopOnRowNode(rowNode: RowNode, rowIndex: number): void {
    }

    protected loadFromDatasource(): void {
    }

}
