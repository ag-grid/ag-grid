import { Context, UserCompDetails, UserComponentFactory, IComponent, AgPromise, ICellRendererComp } from '@ag-grid-community/core';
import { MutableRefObject } from 'react';

export const showJsComp = (
    compDetails: UserCompDetails | undefined, 
    context: Context, eParent: HTMLElement, 
    ref?: MutableRefObject<any>
)  => {

    const doNothing = !compDetails || compDetails.componentFromFramework;
    if (doNothing) { return; }

    const callCompFactory = (compFactory: UserComponentFactory) => compFactory.createInstanceFromCompDetails(compDetails);

    const comp = createJsComp(context, callCompFactory) as ICellRendererComp;

    if (!comp) { return; }

    const compGui = comp.getGui();

    eParent.appendChild(compGui);

    if (ref) {
        ref.current = comp;
    }

    return () => {
        const compGui = comp.getGui();

        if (compGui && compGui.parentElement) {
            compGui.parentElement.removeChild(compGui);
        }

        context.destroyBean(comp);

        if (ref) {
            ref.current = undefined;
        }
    };
}

export const createJsComp = (
    context: Context,
    callCompFactory: (compFactory: UserComponentFactory) => AgPromise<IComponent<any>> | null
): any => {

    const compFactory = context.getBean('userComponentFactory') as UserComponentFactory;
    const promise = callCompFactory(compFactory);
    if (!promise) { return; }

    return promise.resolveNow(null, x => x); // js comps are never async
};