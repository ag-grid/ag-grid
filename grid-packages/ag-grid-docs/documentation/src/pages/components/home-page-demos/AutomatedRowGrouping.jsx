// Remount component when Fast Refresh is triggered
// @refresh reset

import classNames from 'classnames';
import { withPrefix } from 'gatsby';
import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { createAutomatedRowGrouping } from '../../../components/automated-examples/examples/row-grouping';
import { OverlayButton } from '../../../components/automated-examples/OverlayButton';
import { ToggleAutomatedExampleButton } from '../../../components/automated-examples/ToggleAutomatedExampleButton';
import { Icon } from '../../../components/Icon';
import LogoMark from '../../../components/LogoMark';
import { hostPrefix, isProductionBuild, localPrefix } from '../../../utils/consts';
import { useIntersectionObserver } from '../../../utils/use-intersection-observer';
import styles from './AutomatedRowGrouping.module.scss';

const EXAMPLE_ID = 'row-grouping';

const helmet = [];
if (!isProductionBuild()) {
    helmet.push(
        <link
            key="hero-grid-theme"
            rel="stylesheet"
            href={`${localPrefix}/@ag-grid-community/styles/ag-theme-alpine.css`}
            crossOrigin="anonymous"
            type="text/css"
        />
    );
    helmet.push(
        <script
            key="enterprise-lib"
            src={`${localPrefix}/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js`}
            type="text/javascript"
        />
    );
} else {
    helmet.push(
        <script
            key="enterprise-lib"
            src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise/dist/ag-grid-enterprise.min.js"
            type="text/javascript"
        />
    );
}

const mouseStyles = `
    .automated-row-grouping-grid .ag-root-wrapper,
    .automated-row-grouping-grid .ag-root-wrapper * {
        cursor: url(${hostPrefix}/images/cursor/automated-example-cursor-dark-background.svg) 22 21, pointer !important;
    }
`;

const BUTTON_TEXT = {
    explore: 'Explore this example',
    replay: 'Replay',
};

function AutomatedRowGrouping({
    automatedExampleManager,
    scriptDebuggerManager,
    useStaticData,
    runOnce,
    visibilityThreshold,
}) {
    const gridClassname = 'automated-row-grouping-grid';
    const gridRef = useRef(null);
    const [scriptIsEnabled, setScriptIsEnabled] = useState(true);
    const [gridIsReady, setGridIsReady] = useState(false);
    const [gridIsHoveredOver, setGridIsHoveredOver] = useState(false);

    const setAllScriptEnabledVars = (isEnabled) => {
        setScriptIsEnabled(isEnabled);
        automatedExampleManager.setEnabled({ id: EXAMPLE_ID, isEnabled });
    };

    useIntersectionObserver({
        elementRef: gridRef,
        onChange: ({ isIntersecting }) => {
            if (isIntersecting) {
                automatedExampleManager.start(EXAMPLE_ID);
            } else {
                automatedExampleManager.inactive(EXAMPLE_ID);
            }
        },
        threshold: visibilityThreshold,
        isDisabled: !gridIsReady,
    });

    useEffect(() => {
        let params = {
            gridClassname,
            mouseMaskClassname: styles.mouseMask,
            scriptDebuggerManager,
            suppressUpdates: useStaticData,
            useStaticData,
            runOnce,
            onGridReady() {
                setGridIsReady(true);
            },
            visibilityThreshold,
        };

        automatedExampleManager.add({
            id: EXAMPLE_ID,
            automatedExample: createAutomatedRowGrouping(params),
        });
    }, []);

    return (
        <>
            <header className={styles.sectionHeader}>
                <h2 className="font-size-gigantic">Feature Packed, Incredible Performance</h2>
                <p>
                    All the features your users expect and more. Out of the box performance that can handle any data you
                    can throw&nbsp;at&nbsp;it.
                </p>
            </header>

            <Helmet>
                {helmet.map((entry) => entry)}
                <style>{mouseStyles}</style>
            </Helmet>
            <div ref={gridRef} className="automated-row-grouping-grid ag-theme-alpine-dark">
                <OverlayButton
                    ariaLabel={BUTTON_TEXT.explore}
                    isHidden={!scriptIsEnabled}
                    onPointerEnter={() => setGridIsHoveredOver(true)}
                    onPointerOut={() => setGridIsHoveredOver(false)}
                    onClick={() => {
                        setAllScriptEnabledVars(false);
                        automatedExampleManager.stop(EXAMPLE_ID);
                    }}
                />
                {!gridIsReady && !useStaticData && <LogoMark isSpinning />}
            </div>

            <footer className={styles.sectionFooter}>
                <ToggleAutomatedExampleButton
                    onClick={() => {
                        if (scriptIsEnabled) {
                            setAllScriptEnabledVars(false);
                            automatedExampleManager.stop(EXAMPLE_ID);
                        } else {
                            setAllScriptEnabledVars(true);
                            automatedExampleManager.start(EXAMPLE_ID);
                        }
                    }}
                    isHoveredOver={gridIsHoveredOver}
                >
                    {scriptIsEnabled ? (
                        <>
                            {BUTTON_TEXT.explore} <Icon name="centerToFit" />
                        </>
                    ) : (
                        <>{BUTTON_TEXT.replay}</>
                    )}
                </ToggleAutomatedExampleButton>
                <a
                    className={classNames('font-size-large', styles.getStartedLink)}
                    href={withPrefix('/documentation/')}
                >
                    Get Started with AG Grid <Icon name="chevronRight" />
                </a>
            </footer>
        </>
    );
}

export default AutomatedRowGrouping;
