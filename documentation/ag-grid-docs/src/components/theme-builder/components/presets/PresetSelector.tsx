import { getChangedModelItemCount } from '@components/theme-builder/model/changed-model-items';
import styled from '@emotion/styled';
import { useStore } from 'jotai';
import { type CSSProperties, type RefObject, memo, useCallback, useMemo, useRef, useState } from 'react';

import { type Theme, colorSchemeLight, themeQuartz } from 'ag-grid-community';

import { ResetChangesModal } from '../general/ResetChangesModal';
import { PresetRender } from './PresetRender';
import { type Preset, allPresets, applyPreset } from './presets';

export const PresetSelector = memo(() => {
    const scrollerRef = useRef<HTMLDivElement>(null);

    return (
        <Scroller ref={scrollerRef}>
            <Horizontal>
                {allPresets.map((preset, i) => (
                    <SelectButton key={i} preset={preset} scrollerRef={scrollerRef} themeName={`Preset ${i + 1}`} />
                ))}
            </Horizontal>
        </Scroller>
    );
});

type SelectButtonProps = {
    preset: Preset;
    scrollerRef: RefObject<HTMLDivElement>;
    themeName: string;
};

const SelectButton = ({ preset, scrollerRef, themeName }: SelectButtonProps) => {
    const [showDialog, setShowDialog] = useState(false);
    const wrapperRef = useRef<HTMLButtonElement>(null);

    const theme = useMemo(() => {
        let built: Theme = themeQuartz.withPart(colorSchemeLight);
        if (preset.params) {
            built = built.withParams(preset.params);
        }
        for (const part of preset.parts || []) {
            built = built.withPart(part);
        }
        return built;
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
    }, [store, preset, scrollerRef]);

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
                style={{ '--page-background-color': preset.pageBackgroundColor } as CSSProperties}
                aria-label={themeName}
            >
                <PresetRender theme={theme} />
            </SelectButtonWrapper>

            {showDialog && (
                <ResetChangesModal showDialog={showDialog} setShowDialog={setShowDialog} onSuccess={selectNewPreset} />
            )}
        </>
    );
};

const SelectButtonWrapper = styled('button')`
    border: solid 2px transparent !important;
    background: none !important;
    display: inline-block;
    text-align: left;
    margin: 0 12px 8px 0;
    padding: 0;
    scroll-snap-align: center;

    // Higher z index than blur container z index
    &:first-of-type,
    &:last-of-type {
        z-index: 3;
    }

    &:focus-visible {
        outline: none;
        box-shadow: none;
        border-color: blue !important;
    }
`;

const Horizontal = styled('div')`
    display: flex;
    height: 100%;
    isolation: isolate;
`;

const Scroller = styled('div')`
    --scroller-height: 192px;

    width: 100%;
    min-height: var(--scroller-height);
    overflow-x: auto;
    padding-bottom: 6px;
    z-index: 0; // z-index:0 prevents a Safari rendering bug where scrollbars appear over tooltips
    scroll-snap-type: x mandatory;

    // Blur beginning and end
    &:before,
    &:after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        height: calc(var(--scroller-height) - 14px);
        pointer-events: none;
        z-index: 2;
    }

    &:before {
        width: 100px;
        left: 10px;
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
        background: linear-gradient(
            to left,
            var(--color-bg-primary),
            color-mix(in srgb, var(--color-bg-primary), transparent 33%) 50%,
            transparent
        );
    }
`;
