import {
    $devTools,
    $exampleDevToolbar,
    $fpsMonitor,
    $openLinksInNewTab,
    toggleDevTools,
    toggleExampleDevToolbar,
    toggleFpsMonitor,
    toggleOpenLinksInNewTab,
} from '@ag-website-shared/components/dev-tools/stores/devToolsStore';
import { useStoreSsr } from '@utils/hooks/useStoreSsr';
import type { FunctionComponent, ReactNode } from 'react';
import { useEffect, useState } from 'react';

import styles from './DevTools.module.scss';

const TOGGLE_COUNT = 5;
const DEV_TOOLS_ID = 'devTools';

export const DevToolsToggle = ({ children }: { children: ReactNode }) => {
    const [toggleCount, setToggleCount] = useState(0);

    useEffect(() => {
        if (toggleCount >= TOGGLE_COUNT) {
            toggleDevTools();

            if ($devTools.get()) {
                setTimeout(() => {
                    document.getElementById(DEV_TOOLS_ID)?.scrollIntoView({
                        behavior: 'smooth',
                    });
                }, 0);
            }
            setToggleCount(0);
        }
    }, [toggleCount, $devTools]);

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
    const openLinksInNewTab = useStoreSsr($openLinksInNewTab, false);
    const fpsMonitor = useStoreSsr($fpsMonitor, false);

    useEffect(() => {
        let stop: (() => void) | undefined;
        let cancelled = false;

        if (fpsMonitor) {
            import('@ag-website-shared/components/fps-monitor/fpsMonitor.js').then(({ startFpsMonitor }) => {
                if (!cancelled) stop = startFpsMonitor();
            });
        }

        return () => {
            cancelled = true;
            stop?.();
        };
    }, [fpsMonitor]);

    return devTools ? (
        <div id={DEV_TOOLS_ID} className={styles.devToolsContainer}>
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
                <div>
                    <label>Open Links In New Tab:</label>
                    <input
                        type="checkbox"
                        defaultChecked={openLinksInNewTab}
                        onClick={() => {
                            toggleOpenLinksInNewTab();
                        }}
                    />
                </div>
                <div>
                    <label>FPS Monitor:</label>
                    <input
                        type="checkbox"
                        defaultChecked={fpsMonitor}
                        onClick={() => {
                            toggleFpsMonitor();
                        }}
                    />
                </div>
            </div>
        </div>
    ) : null;
};
