import { Autowired, Bean, Qualifier } from "../context/context";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
import { ColumnEventType } from "../events";
import { Logger, LoggerFactory } from "../logger";
import { ColumnAnimationService } from "../rendering/columnAnimationService";
import { ColumnEventDispatcher } from "./columnEventDispatcher";
import { depthFirstOriginalTreeSearch } from "./columnFactory";
import { ColumnModel } from "./columnModel";
import { VisibleColsService } from "./visibleColsService";

@Bean('columnGroupStateService')
export class ColumnGroupStateService {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('columnAnimationService') private columnAnimationService: ColumnAnimationService;
    @Autowired('columnEventDispatcher') private eventDispatcher: ColumnEventDispatcher;
    @Autowired('visibleColsService') private visibleColsService: VisibleColsService;

    private logger: Logger;

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('columnModel');
    }

    public getColumnGroupState(): { groupId: string, open: boolean; }[] {
        const columnGroupState: { groupId: string, open: boolean; }[] = [];
        const gridBalancedTree = this.columnModel.getColTree();

        depthFirstOriginalTreeSearch(null, gridBalancedTree, node => {
            if (node instanceof ProvidedColumnGroup) {
                columnGroupState.push({
                    groupId: node.getGroupId(),
                    open: node.isExpanded()
                });
            }
        });

        return columnGroupState;
    }

    public resetColumnGroupState(source: ColumnEventType): void {
        const primaryColumnTree = this.columnModel.getColDefColTree();
        if (!primaryColumnTree) { return; }

        const stateItems: { groupId: string, open: boolean | undefined; }[] = [];

        depthFirstOriginalTreeSearch(null, primaryColumnTree, child => {
            if (child instanceof ProvidedColumnGroup) {
                const colGroupDef = child.getColGroupDef();
                const groupState = {
                    groupId: child.getGroupId(),
                    open: !colGroupDef ? undefined : colGroupDef.openByDefault
                };
                stateItems.push(groupState);
            }
        });

        this.setColumnGroupState(stateItems, source);
    }

    public setColumnGroupState(stateItems: { groupId: string, open: boolean | undefined; }[], source: ColumnEventType): void {
        const gridBalancedTree = this.columnModel.getColTree();
        if (!gridBalancedTree) { return; }

        this.columnAnimationService.start();

        const impactedGroups: ProvidedColumnGroup[] = [];

        stateItems.forEach(stateItem => {
            const groupKey = stateItem.groupId;
            const newValue = stateItem.open;
            const providedColumnGroup: ProvidedColumnGroup | null = this.columnModel.getProvidedColGroup(groupKey);

            if (!providedColumnGroup) { return; }
            if (providedColumnGroup.isExpanded() === newValue) { return; }

            this.logger.log('columnGroupOpened(' + providedColumnGroup.getGroupId() + ',' + newValue + ')');
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