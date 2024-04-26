import { corePart, paramValueToCss } from '@ag-grid-community/theming';
import { getChangedModelItemCount } from '@components/theme-builder/model/changed-model-items';
import styled from '@emotion/styled';
import { useStore } from 'jotai';
import { type RefObject, memo, useCallback, useEffect, useRef, useState } from 'react';

import { ResetChangesModal } from '../general/ResetChangesModal';
import { PresetRender } from './PresetRender';
import { type Preset, allPresets, applyPreset } from './presets';

export const PresetSelector = memo(() => {
    const scrollerRef = useRef<HTMLDivElement>(null);

    return (
        <Scroller ref={scrollerRef}>
            <Horizontal>
                {allPresets.map((preset, i) => (
                    <SelectButton key={i} preset={preset} scrollerRef={scrollerRef} />
                ))}
            </Horizontal>
        </Scroller>
    );
});

type SelectButtonProps = {
    preset: Preset;
    scrollerRef: RefObject<HTMLDivElement>;
};

const SelectButton = ({ preset, scrollerRef }: SelectButtonProps) => {
    const [showDialog, setShowDialog] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (wrapper) {
            const params = { ...corePart.defaults, ...preset.params };
            for (const [key, value] of Object.entries(params)) {
                let rendered = paramValueToCss(key, value);
                if (typeof rendered === 'string') {
                    wrapper.style.setProperty(paramToVariableName(key), rendered);
                }
            }
            wrapper.style.setProperty('--page-background-color', preset.pageBackgroundColor);
        }
    }, [preset]);

    const store = useStore();
    const selectNewPreset = useCallback(() => {
        applyPreset(store, preset);

        // Scroll to the snap center position
        const wrapper = wrapperRef.current;
        if (wrapper) {
            const scrollLeft = wrapper.offsetLeft - wrapper.clientWidth / 2;
            scrollerRef.current?.scrollTo({
                left: scrollLeft,
                behavior: 'smooth',
            });
        }
    }, [store, preset, wrapperRef.current, scrollerRef.current]);

    return (
        <>
            <SelectButtonWrapper
                ref={wrapperRef}
                onClick={() => {
                    if (getChangedModelItemCount(store) > 1) {
                        setShowDialog(true);
                        return;
                    }
                    selectNewPreset();
                }}
            >
                <PresetRender />
            </SelectButtonWrapper>

            <ResetChangesModal showDialog={showDialog} setShowDialog={setShowDialog} onSuccess={selectNewPreset} />
        </>
    );
};

const SelectButtonWrapper = styled('div')`
    display: inline-block;
    margin-right: 12px;
    scroll-snap-align: center;
    margin-bottom: 8px;

    // Higher z index than blur container z index
    &:first-of-type,
    &:last-of-type {
        z-index: 2;
    }
`;

const Horizontal = styled('div')`
    display: flex;
    height: 100%;
`;

const Scroller = styled('div')`
    width: 100%;
    min-height: 160px;
    overflow-x: auto;
    padding-bottom: 6px;
    z-index: 0;
    scroll-snap-type: x mandatory;

    // Blur beginning and end
    &:before,
    &:after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        height: 142px;
        pointer-events: none;
        z-index: 1;
    }

    &:before {
        width: 100px;
        left: 10px;
        height: 100%;
        background: linear-gradient(
            to right,
            var(--color-bg-primary),
            color-mix(in srgb, var(--color-bg-primary), transparent 88%) 80%,
            transparent
        );
    }

    &:after {
        width: 128px;
        right: 0;
        height: 100%;
        background: linear-gradient(
            to left,
            var(--color-bg-primary),
            color-mix(in srgb, var(--color-bg-primary), transparent 33%) 50%,
            transparent
        );
    }
`;
//  👆 z-index is required to prevent a Safari rendering bug where scrollbars appear over tooltips

const paramToVariableName = (param: string) => `--ag-${kebabCase(param)}`;
const kebabCase = (str: string) => str.replace(/[A-Z]/g, (m) => `-${m}`).toLowerCase();
