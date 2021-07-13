import { Context, UserCompDetails, UserComponentFactory, IComponent, AgPromise } from 'ag-grid-community';

export function useJsComp(compDetails: UserCompDetails | undefined, context: Context, eParent: HTMLElement, 
    callCompFactory: (compFactory: UserComponentFactory)=>AgPromise<IComponent<any>> | null) {

    const showFullWidthJs = compDetails && !compDetails.componentFromFramework;
    if (!showFullWidthJs) { return; }

    const compFactory = context.getBean('userComponentFactory') as UserComponentFactory;
    const promise = callCompFactory(compFactory);
    if (!promise) { return; }

    const comp = promise.resolveNow(null, x => x); // js comps are never async
    if (!comp) { return; }

    const compGui = comp.getGui();
    eParent.appendChild(compGui);

    return () => {
        const compGui = comp.getGui();

        if (compGui && compGui.parentElement) {
            compGui.parentElement.removeChild(compGui);
        }

        context.destroyBean(comp);
    };
}