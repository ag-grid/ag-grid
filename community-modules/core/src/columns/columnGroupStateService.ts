import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { type AgProvidedColumnGroup, isProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColumnEventType } from '../events';
import type { ColumnAnimationService } from '../rendering/columnAnimationService';
import type { ColumnEventDispatcher } from './columnEventDispatcher';
import { depthFirstOriginalTreeSearch } from './columnFactory';
import type { ColumnModel } from './columnModel';
import type { VisibleColsService } from './visibleColsService';

export class ColumnGroupStateService extends BeanStub implements NamedBean {
    beanName = 'columnGroupStateService' as const;

    private columnModel: ColumnModel;
    private columnAnimationService: ColumnAnimationService;
    private eventDispatcher: ColumnEventDispatcher;
    private visibleColsService: VisibleColsService;

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.columnAnimationService = beans.columnAnimationService;
        this.eventDispatcher = beans.columnEventDispatcher;
        this.visibleColsService = beans.visibleColsService;
    }

    public getColumnGroupState(): { groupId: string; open: boolean }[] {
        const columnGroupState: { groupId: string; open: boolean }[] = [];
        const gridBalancedTree = this.columnModel.getColTree();

        depthFirstOriginalTreeSearch(null, gridBalancedTree, (node) => {
            if (isProvidedColumnGroup(node)) {
                columnGroupState.push({
                    groupId: node.getGroupId(),
                    open: node.isExpanded(),
                });
            }
        });

        return columnGroupState;
    }

    public resetColumnGroupState(source: ColumnEventType): void {
        const primaryColumnTree = this.columnModel.getColDefColTree();
        if (!primaryColumnTree) {
            return;
        }

        const stateItems: { groupId: string; open: boolean | undefined }[] = [];

        depthFirstOriginalTreeSearch(null, primaryColumnTree, (child) => {
            if (isProvidedColumnGroup(child)) {
                const colGroupDef = child.getColGroupDef();
                const groupState = {
                    groupId: child.getGroupId(),
                    open: !colGroupDef ? undefined : colGroupDef.openByDefault,
                };
                stateItems.push(groupState);
            }
        });

        this.setColumnGroupState(stateItems, source);
    }

    public setColumnGroupState(
        stateItems: { groupId: string; open: boolean | undefined }[],
        source: ColumnEventType
    ): void {
        const gridBalancedTree = this.columnModel.getColTree();
        if (!gridBalancedTree) {
            return;
        }

        this.columnAnimationService.start();

        const impactedGroups: AgProvidedColumnGroup[] = [];

        stateItems.forEach((stateItem) => {
            const groupKey = stateItem.groupId;
            const newValue = stateItem.open;
            const providedColumnGroup = this.columnModel.getProvidedColGroup(groupKey);

            if (!providedColumnGroup) {
                return;
            }
            if (providedColumnGroup.isExpanded() === newValue) {
                return;
            }

            providedColumnGroup.setExpanded(newValue);
            impactedGroups.push(providedColumnGroup);
        });

        this.visibleColsService.refresh(source, true);

        if (impactedGroups.length) {
            this.eventDispatcher.groupOpened(impactedGroups);
        }

        this.columnAnimationService.finish();
    }
}
