import { useEffect, useRef } from 'react';

function debug(msg: string) {
    // uncomment this out to get debugging for this file
    // console.log(msg);
}

export const useEffectOnce = ( effect: ()=>( void | (()=>void) ), location: string )=> {
    const destroyFunc = useRef<( void | (()=>void) )>();
    const calledOnce = useRef(false);
    const renderAfterCalled = useRef(false);

    if (calledOnce.current) {
        renderAfterCalled.current = true;
    }

    useEffect( ()=> {
        if (calledOnce.current) { 
            debug(`useEffectOnce skip execute ${location}`);
            return; 
        }

        debug(`useEffectOnce execute ${location}`);

        calledOnce.current = true;
        destroyFunc.current = effect();

        return ()=> {
            if (!renderAfterCalled.current) {
                debug(`useEffectOnce skip destroy ${location}`);
                return;
            }

            debug(`useEffectOnce destroy ${location}`);

            if (destroyFunc.current) {
                destroyFunc.current();
            }
        };
    }, []);
};
