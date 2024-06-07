import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { IInfiniteRowModel } from '../interfaces/iInfiniteRowModel';
import type { IServerSideRowModel } from '../interfaces/iServerSideRowModel';

export class RowModelHelperService extends BeanStub implements NamedBean {
    beanName = 'rowModelHelperService' as const;

    private clientSideRowModel: IClientSideRowModel;
    private infiniteRowModel: IInfiniteRowModel;
    private serverSideRowModel: IServerSideRowModel;

    public wireBeans(beans: BeanCollection): void {
        switch (beans.rowModel.getType()) {
            case 'clientSide':
                this.clientSideRowModel = beans.rowModel as IClientSideRowModel;
                break;
            case 'infinite':
                this.infiniteRowModel = beans.rowModel as IInfiniteRowModel;
                break;
            case 'serverSide':
                this.serverSideRowModel = beans.rowModel as IServerSideRowModel;
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
