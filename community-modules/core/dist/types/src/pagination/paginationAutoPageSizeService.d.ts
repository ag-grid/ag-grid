import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
export declare class PaginationAutoPageSizeService extends BeanStub implements NamedBean {
    beanName: "paginationAutoPageSizeService";
    private ctrlsService;
    private paginationService;
    wireBeans(beans: BeanCollection): void;
    private centerRowsCtrl;
    private isBodyRendered;
    postConstruct(): void;
    private notActive;
    private onPaginationAutoSizeChanged;
    private checkPageSize;
}
