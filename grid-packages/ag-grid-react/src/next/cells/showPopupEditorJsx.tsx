
import { MutableRefObject, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
    Context,
    CellCtrl,
    UserCompDetails,
    _,
    UserComponentFactory,
    ICellEditor,
    PopupService,
    GridOptionsWrapper,
    PopupEditorWrapper,
    ICellEditorComp
} from 'ag-grid-community';
import { CssClasses } from '../utils';
import { showJsCellRenderer } from './showJsRenderer'
import { EditDetails } from './cellComp';
import { createJsComp } from '../jsComp';

export const showPopupEditorJsx = (
    editDetails: EditDetails | undefined, 
    context: Context, 
    eGui: HTMLElement, 
    cellCtrl: CellCtrl,
    ref?: MutableRefObject<ICellEditor | undefined>
)  => {

    const portalParent = useMemo

    return (
        <>
        {editDetails!=null && editDetails.compDetails.componentFromFramework }
        </>
    );

}
