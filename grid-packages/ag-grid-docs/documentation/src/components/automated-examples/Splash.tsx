import classnames from 'classnames';
import React, { FunctionComponent, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import styles from './Splash.module.scss';

interface Props {
    width?: string;
    contentOffset?: string;
    hideOverlayClickTarget: boolean;
    onSplashHide: () => boolean;
    onSplashShow: () => void;
    renderContent: (params: {
        hideSplash: (event: Event) => void;
        setClickTargetHover: (isHover: boolean) => void;
    }) => ReactNode;
}

/**
 * Specify example hover as a global class name so that it can be used outside of here
 */
const EXAMPLE_HOVER_CLASSNAME = 'exampleHover';

const useSplashWidth = ({ splashEl, width }) => {
    useEffect(() => {
        if (!width || !splashEl.current) {
            return;
        }

        splashEl.current.style.setProperty('--splash-width', width);
    }, [width, splashEl.current]);
};

const useSplashContentOffset = ({ splashEl, contentOffset }) => {
    useEffect(() => {
        if (!contentOffset || !splashEl.current) {
            return;
        }

        splashEl.current.style.setProperty('--splash-content-offset', contentOffset);
    }, [contentOffset, splashEl.current]);
};

export const Splash: FunctionComponent<Props> = ({
    width,
    contentOffset,
    hideOverlayClickTarget,
    onSplashHide,
    onSplashShow,
    renderContent,
}) => {
    const [showSplash, setShowSplash] = useState<boolean>(true);
    const [splashIsTransitioning, setSplashIsTransitioning] = useState<boolean>(false);
    const [clickTargetHover, setClickTargetHover] = useState<boolean>(false);
    const splashEl = useRef<HTMLDivElement>(null);
    const hideSplash = useCallback(() => {
        const shouldCancel = onSplashHide();
        if (shouldCancel) {
            return;
        }
        setShowSplash(false);
        setSplashIsTransitioning(true);

        // NOTE: Require hover to be off for transition to occur
        setClickTargetHover(false);
    }, [onSplashHide]);
    const splashClickHandler = useCallback(() => {
        if (!showSplash) {
            onSplashShow();
            setShowSplash(true);
        }
    }, [showSplash, onSplashShow]);

    useEffect(() => {
        if (!splashEl.current) {
            return;
        }

        const transitionHandler = (event) => {
            if (event.target !== splashEl.current) {
                return;
            }

            setSplashIsTransitioning(false);
        };

        splashEl.current.addEventListener('transitionend', transitionHandler);

        return () => {
            splashEl.current?.removeEventListener('transitionend', transitionHandler);
        };
    }, []);

    useEffect(() => {
        if (showSplash) {
            document.body.classList.add(styles.splashOn);
        } else {
            document.body.classList.remove(styles.splashOn);
        }
    }, [showSplash]);

    useSplashWidth({ splashEl, width });
    useSplashContentOffset({ splashEl, contentOffset });

    return (
        <div
            className={classnames({
                [styles.splash]: true,
                [styles.hide]: !showSplash,
                [styles.hiding]: splashIsTransitioning,
                [EXAMPLE_HOVER_CLASSNAME]: clickTargetHover,
            })}
            onClick={splashClickHandler}
            aria-hidden="true"
            ref={splashEl}
        >
            {!hideOverlayClickTarget && (
                <div
                    className={styles.exampleClickTarget}
                    onClick={hideSplash}
                    aria-hidden="true"
                    onPointerEnter={() => {
                        setClickTargetHover(true);
                    }}
                    onPointerOut={() => {
                        setClickTargetHover(false);
                    }}
                ></div>
            )}
            {renderContent({ hideSplash, setClickTargetHover })}
            <div className={styles.openPanelIndicator}>
                <Icon name="sidePanelClose" />
                <span>See details</span>
            </div>
            <div className={styles.splashTrapeziumBackground}></div>
        </div>
    );
};
