import { getLoadingIFrameId } from '@ag-website-shared/components/loading-logo/getElementId';
import { EXAMPLE_RELOADING_MESSAGE_TYPE } from '@ag-website-shared/components/loading-logo/messages';
import AgLoadingLogo from '@ag-website-shared/images/inline-svgs/ag-grid-logomark-not-loading.svg?react';
import {
    type UseIntersectionObserverParams,
    useIntersectionObserver,
} from '@ag-website-shared/utils/hooks/useIntersectionObserver';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FunctionComponent } from 'react';

interface Props {
    pageName: string;
    exampleName: string;
}

/**
 * An example only becomes visible once it reports back with an `init` message, so one that never
 * sends it must not leave its iFrame hidden indefinitely.
 */
const REVEAL_FALLBACK_TIMEOUT_MS = 15_000;

export const LoadingLogo: FunctionComponent<Props> = ({ pageName, exampleName }) => {
    const loadingLogoRef = useRef<HTMLDivElement>(null);
    const [hide, setHide] = useState<boolean>(false);
    const loadingIFrameId = getLoadingIFrameId({ pageName, exampleName });
    const intersectionObserverOnChange = useCallback<UseIntersectionObserverParams['onChange']>(
        ({ isIntersecting, disconnect }) => {
            if (hide) {
                disconnect();
                return;
            }

            // Only animate if logo is in viewport
            if (isIntersecting) {
                loadingLogoRef.current?.querySelector('svg')?.classList.add('loading');
            } else {
                loadingLogoRef.current?.querySelector('svg')?.classList.remove('loading');
            }
        },
        [hide]
    );

    useIntersectionObserver({
        elementRef: loadingLogoRef,
        onChange: intersectionObserverOnChange,
    });

    useEffect(() => {
        let revealFallbackTimeout: ReturnType<typeof setTimeout> | undefined;

        const eachIFrame = (callback: (iframe: HTMLIFrameElement) => void) => {
            document.querySelectorAll<HTMLIFrameElement>('#' + loadingIFrameId).forEach(callback);
        };

        const showExample = () => {
            clearTimeout(revealFallbackTimeout);
            setHide(true);

            eachIFrame((iframe) => {
                iframe.style.visibility = 'visible';
                if (document.documentElement.dataset['darkMode'] === 'true' && iframe.contentDocument) {
                    iframe.contentDocument.documentElement.dataset['darkMode'] = 'true';
                }
            });
        };

        const showLoadingLogo = () => {
            clearTimeout(revealFallbackTimeout);
            setHide(false);
            eachIFrame((iframe) => {
                iframe.style.visibility = 'hidden';
            });

            revealFallbackTimeout = setTimeout(showExample, REVEAL_FALLBACK_TIMEOUT_MS);
        };

        const onMessage = ({ data }: MessageEvent) => {
            if (data?.type === EXAMPLE_RELOADING_MESSAGE_TYPE) {
                if (data.loadingIFrameId === loadingIFrameId) {
                    showLoadingLogo();
                }
                return;
            }

            const isExample = pageName === data?.pageName && exampleName === data?.exampleName;
            if (!isExample) return;

            if (data?.type === 'init') {
                showExample();
            }
        };

        window.addEventListener('message', onMessage);

        return () => {
            window.removeEventListener('message', onMessage);
            clearTimeout(revealFallbackTimeout);
        };
    }, []);

    return (
        !hide && (
            <div ref={loadingLogoRef}>
                <AgLoadingLogo />
            </div>
        )
    );
};
