export interface IServerSideRowExpansionState {
    expandAll: 'notInteracted' | 'expandAll' | 'collapseAll';
    toggledNodes: string[];
}
