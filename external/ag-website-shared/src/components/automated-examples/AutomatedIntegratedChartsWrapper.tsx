import { createAutomatedExampleManager } from '@ag-website-shared/components/automated-examples/lib/createAutomatedExampleManager';
import styles from '@pages-styles/homepage.module.scss';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import type { FunctionComponent, ReactNode } from 'react';

import { AutomatedIntegratedChartsWithPackages } from './AutomatedIntegratedChartsPackages';
import type { LogLevel } from './lib/scriptDebugger';

interface Props {
    children?: ReactNode;
}

export const AutomatedIntegratedChartsWrapper: FunctionComponent<Props> = ({ children }) => {
    const [isCI, setIsCI] = useState(false);
    const [runOnce, setRunOnce] = useState(false);
    const automatedExampleManager = useMemo(
        () =>
            createAutomatedExampleManager({
                debugCanvasClassname: styles.automatedExampleDebugCanvas,
                debugPanelClassname: styles.automatedExampleDebugPanel,
            }),
        []
    );

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const debugValue = searchParams.get('debug');
        const debugLogLevel = searchParams.get('debugLogLevel') as LogLevel;
        setIsCI(searchParams.get('isCI') === 'true');
        setRunOnce(searchParams.get('runOnce') === 'true');

        automatedExampleManager.setDebugEnabled(Boolean(debugValue));
        automatedExampleManager.setDebugLogLevel(debugLogLevel);
        automatedExampleManager.setDebugInitialDraw(debugValue === 'draw');
    }, []);

    return (
        <section className={styles.automatedIntegratedChartsOuter}>
            <div className={classNames('layout-max-width-small', styles.homepageExample)}>
                <div className={styles.automatedIntegratedCharts}>
                    <AutomatedIntegratedChartsWithPackages
                        automatedExampleManager={automatedExampleManager}
                        useStaticData={isCI}
                        runOnce={runOnce}
                        visibilityThreshold={0.8}
                    >
                        {children}
                    </AutomatedIntegratedChartsWithPackages>
                </div>
            </div>
        </section>
    );
};
