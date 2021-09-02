import { BeanStub } from "../../context/beanStub";
import { Autowired } from "../../context/context";
import { CtrlsService } from "../../ctrlsService";
import { Column } from "../../entities/column";
import { CenterWidthFeature } from "../../gridBodyComp/centerWidthFeature";
import { HeaderWrapperComp } from "./../columnHeader/headerWrapperComp";
import { HeaderRowComp } from "../headerRow/headerRowComp";

export interface IHeaderRowContainerComp {
    setCenterWidth(width: string): void;
    setContainerTransform(transform: string): void;

    // remove these, the comp should not be doing
    getRowComps(): HeaderRowComp[];
    refresh(): void;
    getHeaderWrapperComp(column: Column): HeaderWrapperComp | undefined;
}

export class HeaderRowContainerCtrl extends BeanStub {

    @Autowired('ctrlsService') private ctrlsService: CtrlsService;

    private pinned: string | null;
    private comp: IHeaderRowContainerComp;

    constructor(pinned: string | null) {
        super();
        this.pinned = pinned;
    }
    
    public setComp(comp: IHeaderRowContainerComp): void {
        this.comp = comp;

        this.setupCenterWidth();

        this.ctrlsService.registerHeaderContainer(this, this.pinned);
    }

    private setupCenterWidth(): void {
        if (this.pinned!=null) { return; }

        this.createManagedBean(new CenterWidthFeature(width => this.comp.setCenterWidth(`${width}px`)));
    }

    public setHorizontalScroll(offset: number): void {
        this.comp.setContainerTransform(`translateX(${offset}px)`);
    }


    // temp - should not be in new design
    public getRowComps(): HeaderRowComp[] {
        return this.comp.getRowComps();
    }

    // temp - should not be in new design
    public getHeaderWrapperComp(column: Column): HeaderWrapperComp | undefined {
        return this.comp.getHeaderWrapperComp(column);
    }

    // temp - should not be in new design
    public refresh(): void {
        this.comp.refresh();
    }
}
