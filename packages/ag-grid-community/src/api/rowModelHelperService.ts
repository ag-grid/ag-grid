import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { IInfiniteRowModel } from '../interfaces/iInfiniteRowModel';
import type { IRowModel } from '../interfaces/iRowModel';
import type { IServerSideRowModel } from '../interfaces/iServerSideRowModel';

export class RowModelHelperService extends BeanStub implements NamedBean {
    beanName = 'rowModelHelperService' as const;

    private rowModel: IRowModel;
    private clientSideRowModel: IClientSideRowModel;
    private infiniteRowModel: IInfiniteRowModel;
    private serverSideRowModel: IServerSideRowModel;

    public wireBeans(beans: BeanCollection): void {
        this.rowModel = beans.rowModel;
    }

    public postConstruct(): void {
        const rowModel = this.rowModel;
        switch (rowModel.getType()) {
            case 'clientSide':
                this.clientSideRowModel = rowModel as IClientSideRowModel;
                break;
            case 'infinite':
                this.infiniteRowModel = rowModel as IInfiniteRowModel;
                break;
            case 'serverSide':
                this.serverSideRowModel = rowModel as IServerSideRowModel;
                break;
        }
    }

    public getClientSideRowModel(): IClientSideRowModel | undefined {
        return this.clientSideRowModel;
    }

    public getInfiniteRowModel(): IInfiniteRowModel | undefined {
        return this.infiniteRowModel;
    }

    public getServerSideRowModel(): IServerSideRowModel | undefined {
        return this.serverSideRowModel;
    }
}
