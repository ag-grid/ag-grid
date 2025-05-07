import { getLoadingIFrameId } from '@ag-website-shared/components/loading-logo/getElementId';
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
        window.addEventListener('message', ({ data }) => {
            const isExample = pageName === data?.pageName && exampleName === data?.exampleName;
            if (!isExample) return;

            if (data?.type === 'init') {
                setHide(true);

                document.querySelectorAll('#' + loadingIFrameId).forEach((iframe) => {
                    iframe.style.visibility = 'visible';
                    if (document.documentElement.dataset['darkMode'] === 'true') {
                        iframe.contentDocument.documentElement.dataset.darkMode = true;
                    }
                });
            }
        });
    }, []);

    return (
        !hide && (
            <div ref={loadingLogoRef}>
                <AgLoadingLogo />
            </div>
        )
    );
};
