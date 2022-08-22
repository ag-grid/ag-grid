import { IHeaderColumn } from "../../entities/iHeaderColumn";
import { Column } from "../../entities/column";
import { BeanStub } from "../../context/beanStub";
import { Beans } from "../beans";
export declare class SetLeftFeature extends BeanStub {
    private readonly columnOrGroup;
    private eCell;
    private ariaEl;
    private actualLeft;
    private colsSpanning;
    private beans;
    constructor(columnOrGroup: IHeaderColumn, eCell: HTMLElement, beans: Beans, colsSpanning?: Column[]);
    setColsSpanning(colsSpanning: Column[]): void;
    getColumnOrGroup(): IHeaderColumn;
    private postConstruct;
    private setLeftFirstTime;
    private animateInLeft;
    private onLeftChanged;
    private modifyLeftForPrintLayout;
    private setLeft;
}
