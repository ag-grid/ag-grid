import IssueTypeCellRenderer from '../../components/grid/IssueTypeRenderer';
import ChevronButtonCellRenderer from '../../components/grid/ChevronButtonRenderer';
import PaddingCellRenderer from '../../components/grid/PaddingCellRenderer';

export const IssueColDef = {
    colId: 'key',
    field: 'key',
    headerName: 'Issue',
    width: 150,
    valueGetter: (params) => {
        return parseInt(params.data.key.replace('AG-', ''));
    },
    valueFormatter: (params) => {
        return params.value ? `AG-${params.value}` : '';
    },
    cellRendererSelector: (params) => {
        if (
            params.node.data.moreInformation ||
            params.node.data.deprecationNotes ||
            params.node.data.breakingChangesNotes
        ) {
            return {
                component: ChevronButtonCellRenderer,
            };
        }
        return {
            component: PaddingCellRenderer,
        };
    },
    filter: 'agSetColumnFilter',
    filterParams: {
        valueFormatter: (params) => {
            return params.value ? `AG-${params.value}` : '';
        },
        comparator: (a, b) => {
        var valA = a == null ? 0 : parseInt(a);
        var valB = b == null ? 0 : parseInt(b);
        if (valA === valB) return 0;
        return valA > valB ? 1 : -1;
        },
    },
}
export const IssueTypeColDef = {
    field: 'issueType',
    valueFormatter: (params) => (params.value === 'Bug' ? 'Defect' : 'Feature Request'),
    cellRenderer: IssueTypeCellRenderer,
    width: 175,
    resizable: false,
    filterParams: {
        valueFormatter: (params) => (params.value === 'Bug' ? 'Defect' : 'Feature Request'),
    }
};