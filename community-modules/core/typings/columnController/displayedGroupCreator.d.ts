import { Column } from "../entities/column";
import { OriginalColumnGroupChild } from "../entities/originalColumnGroupChild";
import { GroupInstanceIdCreator } from "./groupInstanceIdCreator";
import { ColumnGroupChild } from "../entities/columnGroupChild";
import { BeanStub } from "../context/beanStub";
export declare class DisplayedGroupCreator extends BeanStub {
    createDisplayedGroups(sortedVisibleColumns: Column[], balancedColumnTree: OriginalColumnGroupChild[], groupInstanceIdCreator: GroupInstanceIdCreator, pinned: 'left' | 'right' | null, oldDisplayedGroups?: ColumnGroupChild[]): ColumnGroupChild[];
    private createColumnGroup;
    private mapOldGroupsById;
    private setupParentsIntoColumns;
    private getOriginalPathForColumn;
}
