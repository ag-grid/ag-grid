import { CellCtrl } from 'ag-grid-community';
declare const CellComp: (props: {
    cellCtrl: CellCtrl;
    printLayout: boolean;
    editingRow: boolean;
}) => import("solid-js").JSX.Element;
export default CellComp;
