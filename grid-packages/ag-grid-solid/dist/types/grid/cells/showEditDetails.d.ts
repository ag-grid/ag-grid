import { CellCtrl, ICellEditor } from 'ag-grid-community';
import { EditDetails } from './common';
declare const ShowEditDetails: (props: {
    editDetails: EditDetails;
    cellCtrl: CellCtrl;
    eGuiFn: () => HTMLDivElement;
    setInlineRef: (ref: ICellEditor) => void;
    setPopupRef: (ref: ICellEditor) => void;
}) => import("solid-js").JSX.Element;
export default ShowEditDetails;
