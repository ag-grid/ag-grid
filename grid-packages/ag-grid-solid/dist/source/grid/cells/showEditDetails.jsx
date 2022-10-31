import { createMemo } from 'solid-js';
import UserComp from '../userComps/userComp';
import PopupEditorComp from './popupEditorComp';
const ShowEditDetails = (props) => {
    const getCompDetails = createMemo(() => props.editDetails.compDetails);
    const compDetails = props.editDetails.compDetails;
    // when editing, we must have a comp, otherwise doesn't work
    if (!compDetails) {
        return <></>;
    }
    const inPopup = props.editDetails.popup;
    const eGui = props.eGuiFn();
    return (<>
            {inPopup &&
            <PopupEditorComp cellCtrl={props.cellCtrl} eParentCell={eGui} editDetails={props.editDetails}>
                    <UserComp compDetails={getCompDetails()} ref={props.setPopupRef}/>
                </PopupEditorComp>}
            {!inPopup &&
            <UserComp compDetails={getCompDetails()} ref={props.setInlineRef}/>}
        </>);
};
export default ShowEditDetails;
