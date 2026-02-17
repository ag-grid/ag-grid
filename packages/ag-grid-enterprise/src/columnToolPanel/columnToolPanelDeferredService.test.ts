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
        service.initialiseFromApplied(createState({ visibleColIds: ['athlete', 'age', 'country'] }));

        const snapshotBefore = service.getPendingStateSnapshot();
        expect(snapshotBefore.visibleColIds).toEqual(['athlete', 'age', 'country']);
        expect(service.hasPendingChanges()).toBe(false);

        service.reconcileFromAppliedPreservingPending(createState({ visibleColIds: ['age', 'country'] }));

        const snapshotAfter = service.getPendingStateSnapshot();
        expect(snapshotAfter.visibleColIds).toEqual(['age', 'country']);
    });

    it('returns immutable pending snapshots so external callers cannot mutate service state', () => {
        const service = new ColumnToolPanelDeferredService();
        service.initialiseFromApplied(
            createState({
                valueCols: [{ colId: 'age', aggFunc: 'sum' }],
                visibleColIds: ['athlete', 'age'],
            })
        );

        const snapshot = service.getPendingStateSnapshot() as any;
        expect(Object.isFrozen(snapshot)).toBe(true);
        expect(Object.isFrozen(snapshot.visibleColIds)).toBe(true);
        expect(Object.isFrozen(snapshot.valueCols)).toBe(true);
        expect(Object.isFrozen(snapshot.valueCols[0])).toBe(true);

        expect(() => snapshot.visibleColIds.push('country')).toThrow();
        expect(() => {
            snapshot.valueCols[0].aggFunc = 'max';
        }).toThrow();

        const latestSnapshot = service.getPendingStateSnapshot();
        expect(latestSnapshot.visibleColIds).toEqual(['athlete', 'age']);
        expect(latestSnapshot.valueCols).toEqual([{ colId: 'age', aggFunc: 'sum' }]);
    });
});
