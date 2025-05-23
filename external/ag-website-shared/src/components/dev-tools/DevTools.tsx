import {
    $devTools,
    $exampleDevToolbar,
    toggleDevTools,
    toggleExampleDevToolbar,
} from '@ag-website-shared/components/dev-tools/stores/devToolsStore';
import { useStoreSsr } from '@utils/hooks/useStoreSsr';
import type { FunctionComponent, ReactNode } from 'react';
import { useEffect, useState } from 'react';

import styles from './DevTools.module.scss';

const TOGGLE_COUNT = 5;

export const DevToolsToggle = ({ children }: { children: ReactNode }) => {
    const [toggleCount, setToggleCount] = useState(0);

    useEffect(() => {
        if (toggleCount >= TOGGLE_COUNT) {
            toggleDevTools();
            setToggleCount(0);
        }
    }, [toggleCount]);

    return (
        <span
            className={styles.devToolsTrigger}
            onClick={() => {
                setToggleCount((prev) => prev + 1);
            }}
        >
            {children}
        </span>
    );
};

export const DevTools: FunctionComponent = () => {
    const devTools = useStoreSsr($devTools, false);
    const exampleDevToolbar = useStoreSsr($exampleDevToolbar, false);

    return devTools ? (
        <div className={styles.devToolsContainer}>
            <h2>Dev Tools</h2>
            <div className={styles.options}>
                <div>
                    <label>Example Dev Toolbar:</label>
                    <input
                        type="checkbox"
                        defaultChecked={exampleDevToolbar}
                        onClick={() => {
                            toggleExampleDevToolbar();
                        }}
                    />
                </div>
            </div>
        </div>
    ) : null;
};
