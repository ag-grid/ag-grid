import { CellCtrl } from '@ag-grid-community/core';
import { JSX } from 'solid-js';
import { EditDetails } from './common';
declare const PopupEditorComp: (props: {
    editDetails: EditDetails;
    cellCtrl: CellCtrl;
    eParentCell: HTMLElement;
    children?: JSX.Element;
}) => JSX.Element;
export default PopupEditorComp;
