import type { ComponentSelector, ISideBar, ISideBarService, NamedBean } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';
export declare class SideBarService extends BeanStub implements NamedBean, ISideBarService {
    beanName: "sideBarService";
    private sideBarComp;
    registerSideBarComp(sideBarComp: ISideBar): void;
    getSideBarComp(): ISideBar;
    getSideBarSelector(): ComponentSelector;
}
