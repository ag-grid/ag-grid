import { useEffect, useRef, useState } from 'react';

export const useEffectOnce = (effect: () => void | (() => void)) => {

    const effectFn = 
    const destroyFunc = useRef<void | (() => void)>();
    const effectCalled = useRef(false);
    const renderAfterCalled = useRef(false);
    const [val, setVal] = useState<number>(0);
  
    if (effectCalled.current) {
      renderAfterCalled.current = true;
    }
  
    useEffect(() => {
      // only execute the effect first time around
      if (!effectCalled.current) {
        destroyFunc.current = effect();
        effectCalled.current = true;
      }
  
      // this forces one render after the effect is run
      setVal((val) => val + 1);
  
      return () => {
        // if the comp didn't render since the useEffect was called,
        // we know it's the dummy React cycle
        if (!renderAfterCalled.current) { return; }

        // otherwise this is not a dummy destroy, so call the destroy func
        if (destroyFunc.current) { destroyFunc.current(); }
      };
    }, []);
  };
