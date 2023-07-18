import { AbstractHeaderCellComp } from '../abstractCell/abstractHeaderCellComp';
import { HeaderFilterCellCtrl } from './headerFilterCellCtrl';
export declare class HeaderFilterCellComp extends AbstractHeaderCellComp<HeaderFilterCellCtrl> {
    private static TEMPLATE;
    private readonly eFloatingFilterBody;
    private readonly eButtonWrapper;
    private readonly eButtonShowMainFilter;
    private floatingFilterComp;
    private compPromise;
    constructor(ctrl: HeaderFilterCellCtrl);
    private postConstruct;
    private setCompDetails;
    private destroyFloatingFilterComp;
    private afterCompCreated;
}
