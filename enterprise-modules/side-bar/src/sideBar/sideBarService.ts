import type { BeanName, ISideBar, ISideBarService } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';

export class SideBarService extends BeanStub implements ISideBarService {
    beanName: BeanName = 'sideBarService';

    private sideBarComp: ISideBar;

    public registerSideBarComp(sideBarComp: ISideBar): void {
        this.sideBarComp = sideBarComp;
    }

    public getSideBarComp(): ISideBar {
        return this.sideBarComp;
    }
}
