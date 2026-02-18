import { ColumnToolPanelDeferredService } from './columnToolPanelDeferredService';
import type { ColumnToolPanelDeferredState } from './columnToolPanelDeferredService';

const createState = (overrides: Partial<ColumnToolPanelDeferredState> = {}): ColumnToolPanelDeferredState => ({
    pivotMode: false,
    rowGroupColIds: [],
    pivotColIds: [],
    valueCols: [],
    visibleColIds: ['athlete', 'age', 'country'],
    ...overrides,
});

describe('ColumnToolPanelDeferredService', () => {
    it('invalidates pending snapshot cache when reconciling applied state with no pending changes', () => {
        const service = new ColumnToolPanelDeferredService();
        service.reconcileFromApplied(createState({ visibleColIds: ['athlete', 'age', 'country'] }));

        const snapshotBefore = service.getPendingStateSnapshot();
        expect(snapshotBefore.visibleColIds).toEqual(['athlete', 'age', 'country']);
        expect(service.hasPendingChanges()).toBe(false);

        service.reconcileFromAppliedPreservingPending(createState({ visibleColIds: ['age', 'country'] }));

        const snapshotAfter = service.getPendingStateSnapshot();
        expect(snapshotAfter.visibleColIds).toEqual(['age', 'country']);
    });

    it('returns mutable pending snapshots', () => {
        const service = new ColumnToolPanelDeferredService();
        service.reconcileFromApplied(
            createState({
                valueCols: [{ colId: 'age', aggFunc: 'sum' }],
                visibleColIds: ['athlete', 'age'],
            })
        );

        const snapshot = service.getPendingStateSnapshot() as any;
        snapshot.visibleColIds.push('country');
        snapshot.valueCols[0].aggFunc = 'max';

        const latestSnapshot = service.getPendingStateSnapshot();
        expect(latestSnapshot.visibleColIds).toEqual(['athlete', 'age', 'country']);
        expect(latestSnapshot.valueCols).toEqual([{ colId: 'age', aggFunc: 'max' }]);
    });

    it('stages agg changes without mutating applied value columns', () => {
        const service = new ColumnToolPanelDeferredService();
        service.reconcileFromApplied(
            createState({
                valueCols: [{ colId: 'age', aggFunc: 'sum' }],
            })
        );

        service.applyPivotColumnStateToPending([{ colId: 'age', aggFunc: 'max' }]);

        expect(service.getAppliedState().valueCols).toEqual([{ colId: 'age', aggFunc: 'sum' }]);
        expect(service.getPendingState().valueCols).toEqual([{ colId: 'age', aggFunc: 'max' }]);
        expect(service.hasPendingChanges()).toBe(true);
    });
});
