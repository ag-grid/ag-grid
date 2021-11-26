import { Context, UserCompDetails, ICellRendererComp } from 'ag-grid-community';
import { MutableRefObject } from 'react';

export const showJsComp = (
    compDetails: UserCompDetails | undefined, 
    context: Context, eParent: HTMLElement, 
    ref?: MutableRefObject<any> | ((ref: any)=>void)
)  => {

    const doNothing = !compDetails || compDetails.componentFromFramework;
    if (doNothing) { return; }

    const comp = createJsComp(compDetails) as ICellRendererComp;

    if (!comp) { return; }

    const compGui = comp.getGui();

    eParent.appendChild(compGui);

    setRef(ref, comp);

    return () => {
        const compGui = comp.getGui();

        if (compGui && compGui.parentElement) {
            compGui.parentElement.removeChild(compGui);
        }

        context.destroyBean(comp);

        if (ref) {
            setRef(ref, undefined);
        }
    };
}

const setRef = (ref: MutableRefObject<any> | ((ref: any)=>void) | undefined, value: any) => {
    if (!ref) { return; }
    
    if (ref instanceof Function) {
        const refCallback = ref as (ref: any)=>void;
        refCallback(value);
    } else {
        const refObj = ref as MutableRefObject<any>;
        refObj.current = value;
    }
};

export const createJsComp = (compDetails: UserCompDetails): any => {
    const promise = compDetails.newAgStackInstance();
    if (!promise) { return; }
    return promise.resolveNow(null, x => x); // js comps are never async
};