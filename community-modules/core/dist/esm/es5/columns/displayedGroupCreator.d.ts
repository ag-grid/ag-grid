// Type definitions for @ag-grid-community/core v29.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column, ColumnPinnedType } from "../entities/column";
import { IProvidedColumn } from "../interfaces/iProvidedColumn";
import { GroupInstanceIdCreator } from "./groupInstanceIdCreator";
import { IHeaderColumn } from "../interfaces/iHeaderColumn";
import { BeanStub } from "../context/beanStub";
export declare class DisplayedGroupCreator extends BeanStub {
    createDisplayedGroups(sortedVisibleColumns: Column[], balancedColumnTree: IProvidedColumn[], groupInstanceIdCreator: GroupInstanceIdCreator, pinned: ColumnPinnedType, oldDisplayedGroups?: IHeaderColumn[]): IHeaderColumn[];
    private createColumnGroup;
    private mapOldGroupsById;
    private setupParentsIntoColumns;
    private getOriginalPathForColumn;
}
