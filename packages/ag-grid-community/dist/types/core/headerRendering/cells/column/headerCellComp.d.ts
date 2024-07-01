import type { AgColumn } from '../../../entities/agColumn';
import type { ColumnPinnedType } from '../../../interfaces/iColumn';
import { AbstractHeaderCellComp } from '../abstractCell/abstractHeaderCellComp';
import type { HeaderCellCtrl } from './headerCellCtrl';
export declare class HeaderCellComp extends AbstractHeaderCellComp<HeaderCellCtrl> {
    private readonly eResize;
    private readonly eHeaderCompWrapper;
    protected readonly column: AgColumn;
    protected readonly pinned: ColumnPinnedType;
    private headerComp;
    private headerCompGui;
    private headerCompVersion;
    constructor(ctrl: HeaderCellCtrl);
    postConstruct(): void;
    destroy(): void;
    private destroyHeaderComp;
    private setUserCompDetails;
    private afterCompCreated;
}
