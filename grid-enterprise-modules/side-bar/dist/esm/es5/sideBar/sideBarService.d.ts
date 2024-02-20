import { BeanStub, ISideBar, ISideBarService } from "@ag-grid-community/core";
export declare class SideBarService extends BeanStub implements ISideBarService {
    private sideBarComp;
    registerSideBarComp(sideBarComp: ISideBar): void;
    getSideBarComp(): ISideBar;
}
