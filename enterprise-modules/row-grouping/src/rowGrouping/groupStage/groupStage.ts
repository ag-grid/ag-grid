import type { BeanCollection, IRowNodeStage, NamedBean, StageExecuteParams } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';

import { GroupStrategy } from './groupStrategy/groupStrategy';
import type { SelectableService } from './selectableService';
import { TreeStrategy } from './treeStrategy/treeStrategy';

export class GroupStage extends BeanStub implements NamedBean, IRowNodeStage {
    beanName = 'groupStage' as const;

    private selectableService: SelectableService;
    private strategy: GroupStrategy | TreeStrategy | undefined;

    public wireBeans(beans: BeanCollection) {
        this.selectableService = beans.selectableService as SelectableService;
    }

    public execute(params: StageExecuteParams): void {
        const Strategy = this.gos.get('treeData') ? TreeStrategy : GroupStrategy;

        let strategy = this.strategy;
        if (strategy?.constructor !== Strategy) {
            this.destroyBean(strategy);
            strategy = this.createManagedBean(new Strategy());
            this.strategy = strategy;
        }

        strategy.execute(params);

        this.selectableService.updateSelectableAfterGrouping();
    }

    public override destroy(): void {
        this.destroyBean(this.strategy);
        this.strategy = undefined;
        super.destroy();
    }
}
