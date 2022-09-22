import { CellCtrl, ICellEditor } from 'ag-grid-community';
import { createMemo } from 'solid-js';
import UserComp from '../userComps/userComp';
import { EditDetails } from './common';
import PopupEditorComp from './popupEditorComp';

const ShowEditDetails = (props: {
    editDetails: EditDetails,
    cellCtrl: CellCtrl,
    eGuiFn: () => HTMLDivElement,
    setInlineRef: (ref: ICellEditor) => void,
    setPopupRef: (ref: ICellEditor) => void
}
) => {

    const getCompDetails = createMemo(() => props.editDetails.compDetails);
    const compDetails = props.editDetails.compDetails;

    // when editing, we must have a comp, otherwise doesn't work
    if (!compDetails) { return <></>; }

    const inPopup = props.editDetails.popup;
    const eGui = props.eGuiFn();

    return (
        <>
            {inPopup &&
                <PopupEditorComp cellCtrl={props.cellCtrl} eParentCell={eGui} editDetails={props.editDetails}>
                    <UserComp compDetails={getCompDetails()!} ref={props.setPopupRef} />
                </PopupEditorComp>
            }
            {!inPopup &&
                <UserComp compDetails={getCompDetails()!} ref={props.setInlineRef} />
            }
        </>
    );
};

export default ShowEditDetails;
