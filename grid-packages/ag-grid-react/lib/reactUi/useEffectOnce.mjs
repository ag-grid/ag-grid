// ag-grid-react v30.0.4
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
export const useEffectOnce = (effect) => {
    const effectFn = useRef(effect);
    const destroyFn = useRef();
    const effectCalled = useRef(false);
    const rendered = useRef(false);
    const [, setVal] = useState(0);
    if (effectCalled.current) {
        rendered.current = true;
    }
    useEffect(() => {
        // only execute the effect first time around
        if (!effectCalled.current) {
            destroyFn.current = effectFn.current();
            effectCalled.current = true;
        }
        // this forces one render after the effect is run
        setVal((val) => val + 1);
        return () => {
            // if the comp didn't render since the useEffect was called,
            // we know it's the dummy React cycle
            if (!rendered.current) {
                return;
            }
            // otherwise this is not a dummy destroy, so call the destroy func
            if (destroyFn.current) {
                destroyFn.current();
            }
        };
    }, []);
};
export const useLayoutEffectOnce = (effect) => {
    const effectFn = useRef(effect);
    const destroyFn = useRef();
    const effectCalled = useRef(false);
    const rendered = useRef(false);
    const [, setVal] = useState(0);
    if (effectCalled.current) {
        rendered.current = true;
    }
    useLayoutEffect(() => {
        // only execute the effect first time around
        if (!effectCalled.current) {
            destroyFn.current = effectFn.current();
            effectCalled.current = true;
        }
        // this forces one render after the effect is run
        setVal((val) => val + 1);
        return () => {
            // if the comp didn't render since the useEffect was called,
            // we know it's the dummy React cycle
            if (!rendered.current) {
                return;
            }
            // otherwise this is not a dummy destroy, so call the destroy func
            if (destroyFn.current) {
                destroyFn.current();
            }
        };
    }, []);
};
