import { Context, UserCompDetails, UserComponentFactory, IComponent, AgPromise } from 'ag-grid-community';
import { MutableRefObject } from 'react';

export const createJSComp = (
    compDetails: UserCompDetails | undefined, 
    context: Context, eParent: HTMLElement, 
    callCompFactory: (compFactory: UserComponentFactory) => AgPromise<IComponent<any>> | null,
    ref?: MutableRefObject<IComponent<any> | undefined>
)  => {

    const doNothing = !compDetails || compDetails.componentFromFramework;
    if (doNothing) { return; }

    const compFactory = context.getBean('userComponentFactory') as UserComponentFactory;
    const promise = callCompFactory(compFactory);
    if (!promise) { return; }

    const comp = promise.resolveNow(null, x => x); // js comps are never async
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