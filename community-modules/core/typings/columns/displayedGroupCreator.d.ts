import { Column, ColumnPinnedType } from "../entities/column";
import { IProvidedColumn } from "../entities/iProvidedColumn";
import { GroupInstanceIdCreator } from "./groupInstanceIdCreator";
import { IHeaderColumn } from "../entities/iHeaderColumn";
import { BeanStub } from "../context/beanStub";
export declare class DisplayedGroupCreator extends BeanStub {
    createDisplayedGroups(sortedVisibleColumns: Column[], balancedColumnTree: IProvidedColumn[], groupInstanceIdCreator: GroupInstanceIdCreator, pinned: ColumnPinnedType, oldDisplayedGroups?: IHeaderColumn[]): IHeaderColumn[];
    private createColumnGroup;
    private mapOldGroupsById;
    private setupParentsIntoColumns;
    private getOriginalPathForColumn;
}
