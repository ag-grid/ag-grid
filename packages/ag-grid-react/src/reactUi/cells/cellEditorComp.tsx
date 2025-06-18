import React from 'react';

import type { CellCtrl, ICellEditor, ICellEditorComp } from 'ag-grid-community';

import { CustomContext } from '../../shared/customComp/customContext';
import type { CustomCellEditorCallbacks } from '../../shared/customComp/interfaces';
import { isComponentStateless } from '../utils';
import type { EditDetails } from './interfaces';
import PopupEditorComp from './popupEditorComp';

const jsxEditorProxy = (
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
            {isStateless ? (
                <CellEditorClass {...props} />
            ) : (
                <CellEditorClass {...props} ref={(ref: any) => compProxy!.setRef(ref)} />
            )}
        </CustomContext.Provider>
    );
};

const jsxEditor = (
    editDetails: EditDetails,
    CellEditorClass: any,
    setRef: (cellEditor: ICellEditor | undefined) => void
) => {
    const newFormat = editDetails.compProxy;

    return newFormat ? (
        jsxEditorProxy(editDetails, CellEditorClass, setRef)
    ) : (
        <CellEditorClass {...editDetails.compDetails.params} ref={setRef} />
    );
};

export const jsxEditValue = (
    editDetails: EditDetails,
    setCellEditorRef: (cellEditor: ICellEditor | undefined) => void,
    eGui: HTMLElement,
    cellCtrl: CellCtrl,
    jsEditorComp: ICellEditorComp | undefined
) => {
    const compDetails = editDetails.compDetails;
    const CellEditorClass = compDetails.componentClass;

    const reactInlineEditor = compDetails.componentFromFramework && !editDetails.popup;
    const reactPopupEditor = compDetails.componentFromFramework && editDetails.popup;
    const jsPopupEditor = !compDetails.componentFromFramework && editDetails.popup;

    return reactInlineEditor ? (
        jsxEditor(editDetails, CellEditorClass, setCellEditorRef)
    ) : reactPopupEditor ? (
        <PopupEditorComp
            editDetails={editDetails}
            cellCtrl={cellCtrl}
            eParentCell={eGui}
            wrappedContent={jsxEditor(editDetails, CellEditorClass, setCellEditorRef)}
        />
    ) : jsPopupEditor && jsEditorComp ? (
        <PopupEditorComp editDetails={editDetails} cellCtrl={cellCtrl} eParentCell={eGui} jsChildComp={jsEditorComp} />
    ) : null;
};
