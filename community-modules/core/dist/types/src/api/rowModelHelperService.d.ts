import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { IInfiniteRowModel } from '../interfaces/iInfiniteRowModel';
import type { IServerSideRowModel } from '../interfaces/iServerSideRowModel';
export declare class RowModelHelperService extends BeanStub implements NamedBean {
    beanName: "rowModelHelperService";
    private rowModel;
    private clientSideRowModel;
    private infiniteRowModel;
    private serverSideRowModel;
    wireBeans(beans: BeanCollection): void;
    postConstruct(): void;
    getClientSideRowModel(): IClientSideRowModel | undefined;
    getInfiniteRowModel(): IInfiniteRowModel | undefined;
    getServerSideRowModel(): IServerSideRowModel | undefined;
}
