import { MutableRefObject, useEffect, useRef, useState, useCallback } from 'react';
import {
    Context,
    CellCtrl,
    UserCompDetails,
    _,
    UserComponentFactory,
    ICellEditor,
    PopupService,
    GridOptionsWrapper,
    PopupEditorWrapper
} from 'ag-grid-community';
import { CssClasses } from '../utils';
import { showJsCellRenderer } from './showJsCellRenderer';

export enum CellCompState { ShowValue, EditValue }


export const showJSCellEditor = (
    compDetails: UserCompDetails | undefined, 
    context: Context, 
    eGui: HTMLElement, 
    cellCtrl: CellCtrl,
    ref?: MutableRefObject<ICellEditor | undefined>
)  => {

    const doNothing = !compDetails || compDetails.componentFromFramework;
    if (doNothing) { return; }

    const compFactory = context.getBean('userComponentFactory') as UserComponentFactory;
    const promise = compFactory.createCellEditor(compDetails!);
    if (!promise) { return; }

    const cellEditor = promise.resolveNow(null, x => x); // js comps are never async
    if (!cellEditor) { return; }

    const colDef = cellCtrl.getColumn().getColDef();

    // give preference to what's assigned in the col def
    const inPopup = colDef.cellEditorPopup != null ? colDef.cellEditorPopup : cellEditor.isPopup && cellEditor.isPopup();

    const destroyFuncs: (()=>void)[] = [];

    if (inPopup) {
        const popupService = context.getBean('popupService') as PopupService;
        const gridOptionsWrapper = context.getBean('gridOptionsWrapper') as GridOptionsWrapper;
        const useModelPopup = gridOptionsWrapper.isStopEditingWhenCellsLoseFocus();

        const position = colDef.cellEditorPopupPosition != null ? colDef.cellEditorPopupPosition : cellEditor.getPopupPosition ? cellEditor.getPopupPosition() : 'over';

        const popupWrapper = new PopupEditorWrapper(cellEditor);

        const compGui = popupWrapper.getGui();

        const params = {
            column: cellCtrl.getColumn(),
            rowNode: cellCtrl.getRowNode(),
            type: 'popupCellEditor',
            eventSource: eGui,
            ePopup: compGui,
            keepWithinBounds: true
        };

        const positionCallback = position === 'under' ?
            popupService.positionPopupUnderComponent.bind(popupService, params)
            : popupService.positionPopupOverComponent.bind(popupService, params);

        const addPopupRes = popupService.addPopup({
            modal: useModelPopup,
            eChild: compGui,
            closeOnEsc: true,
            closedCallback: () => { cellCtrl.onPopupEditorClosed(); },
            anchorToElement: eGui,
            positionCallback
        });

        const hideEditorPopup = addPopupRes ? addPopupRes.hideFunc : undefined;

        destroyFuncs.push( ()=> {
            if (hideEditorPopup) {
                hideEditorPopup();
            }
            context.destroyBean(popupWrapper);
        });

    } else {
        const compGui = cellEditor.getGui();
        eGui.appendChild(compGui);

        destroyFuncs.push( ()=> {
            context.destroyBean(cellEditor);

            if (compGui.parentElement) {
                compGui.parentElement.removeChild(compGui);
            }
        });
    }

    if (ref) {
        ref.current = cellEditor;
        destroyFuncs.push( ()=> ref.current = undefined );
    }

    return () => destroyFuncs.forEach( f => f() );
}