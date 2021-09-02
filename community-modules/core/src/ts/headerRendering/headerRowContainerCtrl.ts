import { BeanStub } from "../context/beanStub";
import { CenterWidthFeature } from "../gridBodyComp/centerWidthFeature";

export interface IHeaderRowContainerComp {
    setCenterWidth(width: string): void;
}

export class HeaderRowContainerCtrl extends BeanStub {

    private pinned: string | null;
    private comp: IHeaderRowContainerComp;

    constructor(pinned: string | null) {
        super();
        this.pinned = pinned;
    }
    
    public setComp(comp: IHeaderRowContainerComp): void {
        this.comp = comp;

        this.setupCenterWidth();
    }

    private setupCenterWidth(): void {
        if (this.pinned!=null) { return; }

        this.createManagedBean(new CenterWidthFeature(width => this.comp.setCenterWidth(`${width}px`)));
    }

}
