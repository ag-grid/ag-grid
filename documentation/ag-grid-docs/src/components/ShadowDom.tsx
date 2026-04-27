import { type ReactNode, useEffect, useState } from 'react';
import root from 'react-shadow';

export type ShadowDomProps = {
    children: ReactNode;
};

export const ShadowDom = ({ children }: ShadowDomProps) => {
    const [isHydrated, setIsHydrated] = useState(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional hydration pattern
    useEffect(() => setIsHydrated(true), []);

    return <>{isHydrated && <root.div style={{ height: '100%' }}>{children}</root.div>}</>;
};
