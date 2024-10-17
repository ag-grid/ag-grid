import type {
    BeanCollection,
    ClientSideRowModelStage,
    GridOptions,
    IRowNodeStage,
    ISelectionService,
    NamedBean,
    StageExecuteParams,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { GroupStrategy } from './groupStrategy/groupStrategy';
import { TreeStrategy } from './treeStrategy/treeStrategy';

export class GroupStage extends BeanStub implements NamedBean, IRowNodeStage {
    beanName = 'groupStage' as const;

    public refreshProps: Set<keyof GridOptions<any>> = new Set([
        'groupDefaultExpanded',
        'groupAllowUnbalanced',
        'initialGroupOrderComparator',
        'groupHideOpenParents',
        'groupDisplayType',
    ]);
    public step: ClientSideRowModelStage = 'group';

    private selectionService: ISelectionService | undefined;
    private strategy: GroupStrategy | TreeStrategy | undefined;

    public wireBeans(beans: BeanCollection) {
        this.selectionService = beans.selectionService;
    }

    public execute(params: StageExecuteParams): void {
        const Strategy = this.gos.get('treeData') ? TreeStrategy : GroupStrategy;

        let strategy = this.strategy;
        if (strategy?.constructor !== Strategy) {
            strategy?.deactivate?.();
            this.destroyBean(strategy);
            strategy = this.createManagedBean(new Strategy());
            this.strategy = strategy;
        }

        strategy.execute(params);

        this.selectionService?.updateSelectable(true);
    }

    public override destroy(): void {
        this.destroyBean(this.strategy);
        this.strategy = undefined;
        super.destroy();
    }
}
