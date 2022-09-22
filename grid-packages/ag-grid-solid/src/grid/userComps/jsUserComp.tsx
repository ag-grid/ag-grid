import { UserCompDetails } from 'ag-grid-community';
import { onCleanup, useContext } from 'solid-js';
import { BeansContext } from '../core/beansContext';

const JsUserComp = (p: {
    compDetails: UserCompDetails,
    ref?: (ref: any)=>void
})=> {
    const { context } = useContext(BeansContext);

    const promise = p.compDetails.newAgStackInstance();
    if (!promise) { return <></>; }

    const comp = promise.resolveNow(null, (x: any) => x); // js comps are never async
    if (!comp) { return <></>; }
    p.ref && p.ref(comp);

    const gui = comp.getGui();

    onCleanup( ()=> {
        comp && context.destroyBean(comp);
        p.ref && p.ref(undefined);
    });

    return <>{gui}</>;
};

export default JsUserComp;