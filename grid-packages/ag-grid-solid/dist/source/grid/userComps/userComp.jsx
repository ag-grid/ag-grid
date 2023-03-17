import { createMemo } from 'solid-js';
import JsUserComp from './jsUserComp';
import SolidUserComp from './solidUserComp';
const UserComp = (p) => {
    const showSolidComp = createMemo(() => {
        const details = p.compDetails;
        if (!details) {
            return false;
        }
        return details.componentFromFramework;
    });
    const showJsComp = createMemo(() => {
        const details = p.compDetails;
        if (!details) {
            return false;
        }
        return !details.componentFromFramework;
    });
    return (<>
            {showSolidComp()
            && <SolidUserComp compDetails={p.compDetails} ref={p.ref}/>}
            {showJsComp()
            && <JsUserComp compDetails={p.compDetails} ref={p.ref}/>}
        </>);
};
export default UserComp;
