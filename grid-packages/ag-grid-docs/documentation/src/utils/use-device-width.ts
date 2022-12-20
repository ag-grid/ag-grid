import { useEffect, useState } from "react";

const IS_SSR = typeof window === "undefined";

export const useDeviceWidth = (): number => {
  const [width, setWidth] = useState<number>(IS_SSR ? 0 : window.innerWidth);
  
  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    if (IS_SSR) { return; }

    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  return width;
}
