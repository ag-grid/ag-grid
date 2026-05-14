import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type {
    BeanCollection,
    HorizontalSection,
    HorizontalSectionMap,
    ICellRenderer,
    ICellRendererParams,
    IRowComp,
    RowCtrl,
    UserCompDetails,
} from 'ag-grid-community';

import { showJsComp } from '../jsComp';
import { isComponentStateless } from '../utils';

export interface FullWidthProxyMethods {
    showFullWidth: IRowComp['showFullWidth'];
    showEmbeddedFullWidth: IRowComp['showEmbeddedFullWidth'];
    getFullWidthCellRenderers: IRowComp['getFullWidthCellRenderers'];
    getFullWidthCellRendererParams: IRowComp['getFullWidthCellRendererParams'];
    getFullWidthCellRendererParamsForPinned: IRowComp['getFullWidthCellRendererParamsForPinned'];
    refreshFullWidth: IRowComp['refreshFullWidth'];
    refreshEmbeddedFullWidth: IRowComp['refreshEmbeddedFullWidth'];
}

export function useFullWidthRenderers(
    rowCtrl: RowCtrl,
    context: BeanCollection['context'],
    gos: BeanCollection['gos'],
    eGui: React.RefObject<HTMLDivElement | null>,
    ePinnedLeftCells: React.RefObject<HTMLDivElement | null>,
    eScrollingCells: React.RefObject<HTMLDivElement | null>,
    ePinnedRightCells: React.RefObject<HTMLDivElement | null>
): {
    proxyMethods: FullWidthProxyMethods;
    renderState: {
        fullWidthCompDetails: UserCompDetails | undefined;
        embeddedFullWidthCompDetails: HorizontalSectionMap<UserCompDetails> | undefined;
        showEmbeddedFullWidth: boolean;
        showFullWidthFramework: boolean;
        embeddedSectionHasContent: { left: boolean; center: boolean; right: boolean };
    };
    eFullWidthAnchor: React.RefObject<HTMLDivElement>;
    fullWidthCompRef: React.RefObject<ICellRenderer | undefined>;
    showFullWidthFrameworkJsx: () => React.ReactNode;
    showEmbeddedFrameworkSection: (section: HorizontalSection) => React.ReactNode;
} {
    const isFullWidth = rowCtrl.isFullWidth();

    const eFullWidthAnchor = useRef<HTMLDivElement>(null);
    const fullWidthCompRef = useRef<ICellRenderer>();
    const fullWidthEmbeddedLeftCompRef = useRef<ICellRenderer>();
    const fullWidthEmbeddedCenterCompRef = useRef<ICellRenderer>();
    const fullWidthEmbeddedRightCompRef = useRef<ICellRenderer>();
    const fullWidthParamsRef = useRef<ICellRendererParams>();
    const fullWidthEmbeddedLeftParamsRef = useRef<ICellRendererParams>();
    const fullWidthEmbeddedCenterParamsRef = useRef<ICellRendererParams>();
    const fullWidthEmbeddedRightParamsRef = useRef<ICellRendererParams>();

    const [fullWidthCompDetails, setFullWidthCompDetails] = useState<UserCompDetails>();
    const [embeddedFullWidthCompDetails, setEmbeddedFullWidthCompDetails] =
        useState<HorizontalSectionMap<UserCompDetails>>();
    const embeddedFullWidthCompDetailsRef = useRef<HorizontalSectionMap<UserCompDetails>>();
    const [embeddedSectionHasContent, setEmbeddedSectionHasContent] = useState(() => rowCtrl.embeddedSectionHasContent);

    const autoHeightSetup = useRef<boolean>(false);
    const [autoHeightSetupAttempt, setAutoHeightSetupAttempt] = useState<number>(0);

    useEffect(() => {
        if (autoHeightSetup.current || !fullWidthCompDetails || autoHeightSetupAttempt > 10) {
            return;
        }

        const eChild = eFullWidthAnchor.current?.firstChild as HTMLElement;
        if (eChild) {
            rowCtrl.setupDetailRowAutoHeight(eChild);
            autoHeightSetup.current = true;
        } else {
            setAutoHeightSetupAttempt((prev) => prev + 1);
        }
    }, [fullWidthCompDetails, autoHeightSetupAttempt]);

    const reactFullWidthCellRendererStateless = useMemo(() => {
        const res =
            fullWidthCompDetails?.componentFromFramework && isComponentStateless(fullWidthCompDetails.componentClass);
        return !!res;
    }, [fullWidthCompDetails]);

    const canRefreshFullWidthRef = useRef(false);
    useEffect(() => {
        canRefreshFullWidthRef.current =
            reactFullWidthCellRendererStateless && !!fullWidthCompDetails && !!gos.get('reactiveCustomComponents');
    }, [reactFullWidthCellRendererStateless, fullWidthCompDetails]);

    const showEmbeddedFullWidth = isFullWidth && !!embeddedFullWidthCompDetails;

    useLayoutEffect(
        () => showJsComp(fullWidthCompDetails, context, eFullWidthAnchor.current ?? eGui.current!, fullWidthCompRef),
        [fullWidthCompDetails]
    );
    useLayoutEffect(() => {
        if (!ePinnedLeftCells.current) {
            return;
        }
        return showJsComp(
            embeddedFullWidthCompDetails?.left,
            context,
            ePinnedLeftCells.current,
            fullWidthEmbeddedLeftCompRef
        );
    }, [embeddedFullWidthCompDetails?.left]);
    useLayoutEffect(() => {
        if (!eScrollingCells.current) {
            return;
        }
        return showJsComp(
            embeddedFullWidthCompDetails?.center,
            context,
            eScrollingCells.current,
            fullWidthEmbeddedCenterCompRef
        );
    }, [embeddedFullWidthCompDetails?.center]);
    useLayoutEffect(() => {
        if (!ePinnedRightCells.current) {
            return;
        }
        return showJsComp(
            embeddedFullWidthCompDetails?.right,
            context,
            ePinnedRightCells.current,
            fullWidthEmbeddedRightCompRef
        );
    }, [embeddedFullWidthCompDetails?.right]);
    useLayoutEffect(() => {
        if (!showEmbeddedFullWidth) {
            return;
        }
        const updateLaneVisibility = () => {
            const next = {
                left: !!ePinnedLeftCells.current?.firstElementChild,
                center: !!eScrollingCells.current?.firstElementChild,
                right: !!ePinnedRightCells.current?.firstElementChild,
            };
            rowCtrl.embeddedSectionHasContent = next;
            setEmbeddedSectionHasContent((prev) =>
                prev.left === next.left && prev.center === next.center && prev.right === next.right ? prev : next
            );
        };

        updateLaneVisibility();
        const observer = new MutationObserver(updateLaneVisibility);
        if (ePinnedLeftCells.current) {
            observer.observe(ePinnedLeftCells.current, { childList: true });
        }
        if (eScrollingCells.current) {
            observer.observe(eScrollingCells.current, { childList: true });
        }
        if (ePinnedRightCells.current) {
            observer.observe(ePinnedRightCells.current, { childList: true });
        }

        return () => observer.disconnect();
    }, [showEmbeddedFullWidth, embeddedFullWidthCompDetails]);

    const proxyMethods = useMemo<FullWidthProxyMethods>(
        () => ({
            showFullWidth: (compDetails) => {
                embeddedFullWidthCompDetailsRef.current = undefined;
                setEmbeddedFullWidthCompDetails(undefined);
                setEmbeddedSectionHasContent({ left: true, center: true, right: true });
                fullWidthParamsRef.current = compDetails.params;
                setFullWidthCompDetails(compDetails);
            },
            showEmbeddedFullWidth: (compDetails) => {
                setFullWidthCompDetails(undefined);
                setEmbeddedSectionHasContent({ left: true, center: true, right: true });
                fullWidthEmbeddedLeftParamsRef.current = compDetails.left.params;
                fullWidthEmbeddedCenterParamsRef.current = compDetails.center.params;
                fullWidthEmbeddedRightParamsRef.current = compDetails.right.params;
                embeddedFullWidthCompDetailsRef.current = compDetails;
                setEmbeddedFullWidthCompDetails(compDetails);
            },
            getFullWidthCellRenderers: () => {
                if (rowCtrl.isEmbeddedFullWidth) {
                    return [
                        fullWidthEmbeddedLeftCompRef.current,
                        fullWidthEmbeddedCenterCompRef.current,
                        fullWidthEmbeddedRightCompRef.current,
                    ].filter((r) => r != null);
                }
                return fullWidthCompRef.current ? [fullWidthCompRef.current] : [];
            },
            getFullWidthCellRendererParams: () =>
                fullWidthParamsRef.current ?? fullWidthEmbeddedCenterParamsRef.current,
            getFullWidthCellRendererParamsForPinned: (pinned) =>
                pinned === 'left'
                    ? fullWidthEmbeddedLeftParamsRef.current
                    : pinned === 'right'
                      ? fullWidthEmbeddedRightParamsRef.current
                      : fullWidthEmbeddedCenterParamsRef.current,
            refreshFullWidth: (getUpdatedParams) => {
                const fullWidthParams = getUpdatedParams();
                fullWidthParamsRef.current = fullWidthParams;
                if (canRefreshFullWidthRef.current) {
                    setFullWidthCompDetails((prevFullWidthCompDetails) => ({
                        ...prevFullWidthCompDetails!,
                        params: fullWidthParams,
                    }));
                    return true;
                } else {
                    if (!fullWidthCompRef.current || !fullWidthCompRef.current.refresh) {
                        return false;
                    }
                    return fullWidthCompRef.current.refresh(fullWidthParams);
                }
            },
            refreshEmbeddedFullWidth: (getUpdatedParams) => {
                const leftParams = getUpdatedParams('left');
                const centerParams = getUpdatedParams(null);
                const rightParams = getUpdatedParams('right');

                fullWidthEmbeddedLeftParamsRef.current = leftParams;
                fullWidthEmbeddedCenterParamsRef.current = centerParams;
                fullWidthEmbeddedRightParamsRef.current = rightParams;

                const leftRef = fullWidthEmbeddedLeftCompRef.current;
                const centerRef = fullWidthEmbeddedCenterCompRef.current;
                const rightRef = fullWidthEmbeddedRightCompRef.current;

                const currentDetails = embeddedFullWidthCompDetailsRef.current;
                let nextDetails: HorizontalSectionMap<UserCompDetails> | undefined;

                const refreshSection = (
                    section: HorizontalSection,
                    params: ICellRendererParams,
                    renderer: ICellRenderer | undefined,
                    hasContent: boolean
                ): boolean => {
                    const details = currentDetails?.[section];
                    const isStatelessFrameworkRenderer =
                        !!details?.componentFromFramework && isComponentStateless(details.componentClass);

                    if (isStatelessFrameworkRenderer) {
                        if (!gos.get('reactiveCustomComponents') || !currentDetails) {
                            return false;
                        }

                        nextDetails ??= { ...currentDetails };
                        nextDetails[section] = { ...details, params };
                        return true;
                    }

                    return renderer?.refresh?.(params) ?? !hasContent;
                };

                const leftRefreshed = refreshSection(
                    'left',
                    leftParams,
                    leftRef,
                    rowCtrl.embeddedSectionHasContent.left
                );
                const centerRefreshed = refreshSection('center', centerParams, centerRef, true);
                const rightRefreshed = refreshSection(
                    'right',
                    rightParams,
                    rightRef,
                    rowCtrl.embeddedSectionHasContent.right
                );

                if (nextDetails) {
                    embeddedFullWidthCompDetailsRef.current = nextDetails;
                    setEmbeddedFullWidthCompDetails(nextDetails);
                }

                return leftRefreshed && centerRefreshed && rightRefreshed;
            },
        }),
        []
    );

    const showFullWidthFrameworkJsx = useCallback(() => {
        const FullWidthComp = fullWidthCompDetails!.componentClass;
        return reactFullWidthCellRendererStateless ? (
            <FullWidthComp {...fullWidthCompDetails!.params} />
        ) : (
            <FullWidthComp {...fullWidthCompDetails!.params} ref={fullWidthCompRef} />
        );
    }, [fullWidthCompDetails, reactFullWidthCellRendererStateless]);

    const showEmbeddedFrameworkSection = useCallback(
        (section: HorizontalSection) => {
            const details = embeddedFullWidthCompDetails?.[section];
            if (!details?.componentFromFramework) {
                return null;
            }

            const FullWidthComp = details.componentClass;
            const compRef =
                section === 'left'
                    ? fullWidthEmbeddedLeftCompRef
                    : section === 'right'
                      ? fullWidthEmbeddedRightCompRef
                      : fullWidthEmbeddedCenterCompRef;
            const stateless = isComponentStateless(details.componentClass);
            return stateless ? (
                <FullWidthComp {...details.params} />
            ) : (
                <FullWidthComp {...details.params} ref={compRef} />
            );
        },
        [embeddedFullWidthCompDetails]
    );

    const showFullWidthFramework = isFullWidth && !!fullWidthCompDetails?.componentFromFramework;

    return {
        proxyMethods,
        renderState: {
            fullWidthCompDetails,
            embeddedFullWidthCompDetails,
            showEmbeddedFullWidth,
            showFullWidthFramework,
            embeddedSectionHasContent,
        },
        eFullWidthAnchor,
        fullWidthCompRef,
        showFullWidthFrameworkJsx,
        showEmbeddedFrameworkSection,
    };
}
