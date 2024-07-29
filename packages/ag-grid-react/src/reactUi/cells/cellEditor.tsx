import type { CellCtrl, ICellEditor, ICellEditorComp, UserCompDetails } from 'ag-grid-community';
import React from 'react';

import type { CellEditorComponentProxy } from '../../shared/customComp/cellEditorComponentProxy';
import { CustomContext } from '../../shared/customComp/customContext';
import type { CustomCellEditorCallbacks } from '../../shared/customComp/interfaces';
import { isComponentStateless } from '../utils';
import PopupEditorComp from './popupEditorComp';

export interface EditDetails {
    compDetails: UserCompDetails;
    popup?: boolean;
    popupPosition?: 'over' | 'under';
    compProxy?: CellEditorComponentProxy;
}

export const jsxEditorProxy = (
    editDetails: EditDetails,
    CellEditorClass: any,
    setRef: (cellEditor: ICellEditor | undefined) => void
) => {
    const { compProxy } = editDetails;
    setRef(compProxy);

    const props = compProxy!.getProps();

    const isStateless = isComponentStateless(CellEditorClass);

    return (
        <CustomContext.Provider
            value={{
                setMethods: (methods: CustomCellEditorCallbacks) => compProxy!.setMethods(methods),
            }}
        >
            {isStateless && <CellEditorClass {...props} />}
            {!isStateless && <CellEditorClass {...props} ref={(ref: any) => compProxy!.setRef(ref)} />}
        </CustomContext.Provider>
    );
};

export const jsxEditor = (
    editDetails: EditDetails,
    CellEditorClass: any,
    setRef: (cellEditor: ICellEditor | undefined) => void
) => {
    const newFormat = editDetails.compProxy;

    return (
        <>
            {!newFormat && <CellEditorClass {...editDetails.compDetails.params} ref={setRef} />}
            {newFormat && jsxEditorProxy(editDetails, CellEditorClass, setRef)}
        </>
    );
};

export const jsxEditValue = (
    editDetails: EditDetails,
    setInlineCellEditorRef: (cellEditor: ICellEditor | undefined) => void,
    setPopupCellEditorRef: (cellEditor: ICellEditor | undefined) => void,
    eGui: HTMLElement,
    cellCtrl: CellCtrl,
    jsEditorComp: ICellEditorComp | undefined
) => {
    const compDetails = editDetails.compDetails;
    const CellEditorClass = compDetails.componentClass;

    const reactInlineEditor = compDetails.componentFromFramework && !editDetails.popup;
    const reactPopupEditor = compDetails.componentFromFramework && editDetails.popup;
    const jsPopupEditor = !compDetails.componentFromFramework && editDetails.popup;

    return (
        <>
            {reactInlineEditor && jsxEditor(editDetails, CellEditorClass, setInlineCellEditorRef)}

            {reactPopupEditor && (
                <PopupEditorComp
                    editDetails={editDetails}
                    cellCtrl={cellCtrl}
                    eParentCell={eGui}
                    wrappedContent={jsxEditor(editDetails, CellEditorClass, setPopupCellEditorRef)}
                />
            )}

            {jsPopupEditor && jsEditorComp && (
                <PopupEditorComp
                    editDetails={editDetails}
                    cellCtrl={cellCtrl}
                    eParentCell={eGui}
                    jsChildComp={jsEditorComp}
                />
            )}
        </>
    );
};
