import { ImportExportButton } from '@ag-website-shared/components/theme-builder/ImportExportButton';
import { applyPreset } from '@ag-website-shared/theming/preset';
import { useRenderedTheme, useRenderedThemeInfo } from '@ag-website-shared/theming/rendered-theme';
import styled from '@emotion/styled';
import { useStore } from 'jotai';
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { Theme } from 'ag-grid-community';

import { EditorPanel } from './EditorPanel';
import { PresetSelector } from './PresetSelector';
import { PRESETS, type StudioPreset, toSharedPreset } from './presets';

interface Props {
    isDark: boolean;
    renderPreview: (theme: Theme, widgetBorderEnabled: boolean) => ReactNode;
}

export const RootContainer = ({ isDark, renderPreview }: Props) => {
    const store = useStore();
    const renderedTheme = useRenderedTheme();
    const previewTheme = useRenderedThemeInfo().theme;
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Widget borders are page-layout state opted into per preset (not a theme
    // param), so the host needs the flag to build the preview's initial state.
    const widgetBorderEnabled = !!PRESETS.find((p) => p.id === selectedId)?.widgetBorder;

    // Fill from the tool's actual top offset to the viewport bottom. The Studio
    // docs layout puts a sticky header - and sometimes an announcement banner -
    // above the island, so a fixed `100vh - header` overflows; measure instead.
    const containerRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<string>();
    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const update = () => setHeight(`${window.innerHeight - el.getBoundingClientRect().top}px`);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    // When the site's dark mode toggles, keep the chosen preset selected but
    // switch to its matching light/dark variant. Skipped on first render (no
    // preset picked yet) so it never clobbers the initial preset.
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (!selectedId) return;
        const preset = PRESETS.find((p) => p.id === selectedId);
        if (preset) {
            applyPreset(store, toSharedPreset(preset, isDark));
        }
    }, [isDark]);

    return (
        <Container ref={containerRef} style={height ? { height } : undefined}>
            <Menu className={renderedTheme._getParamsClassName()}>
                <SidebarHeader>Theme Builder</SidebarHeader>
                <EditorScroller>
                    <EditorPanel />
                </EditorScroller>
                <MenuBottom>
                    <ImportExportButton />
                </MenuBottom>
            </Menu>
            <Main>
                <PresetSelector
                    isDark={isDark}
                    selectedId={selectedId}
                    onSelect={(preset: StudioPreset) => setSelectedId(preset.id)}
                />
                <Preview>{renderPreview(previewTheme, widgetBorderEnabled)}</Preview>
            </Main>
        </Container>
    );
};

const Container = styled('div')`
    // Centre the tool within the page's content column - the Studio docs layout
    // does not add horizontal margins around the island, so the shell owns them.
    width: 100%;
    max-width: calc(var(--layout-max-width) + var(--layout-horizontal-margins) * 2);
    // Fill the space below the site header. --header-nav-height (64px) is the real
    // Studio header var; --layout-site-header-height is undefined here so it must
    // not be relied on (it would fall back to 50px and overflow the viewport).
    height: calc(100vh - var(--header-nav-height, 64px));
    margin: 0 auto;
    padding: 0 var(--layout-horizontal-margins);
    box-sizing: border-box;
    display: flex;
    overflow: hidden;
    user-select: none;
    cursor: default;

    font-family: -apple-system, BlinkMacSystemFont, 'IBM Plex Sans', sans-serif;

    @media screen and (max-width: 900px) {
        display: none;
    }
`;

const Menu = styled('div')`
    width: 300px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
`;

const EditorScroller = styled('div')`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    // z-index:0 prevents a Safari rendering bug where scrollbars appear over tooltips
    z-index: 0;
`;

// Fixed title above the scrolling editor list (not sticky-inside-scroll), so it
// never floats over the params. Top inset matches the preview column so the
// title and the preset row line up.
const SidebarHeader = styled('h2')`
    flex-shrink: 0;
    margin: 0;
    padding: 16px 10px 8px 6px;
    color: var(--color-fg-secondary);
    font-weight: var(--text-semibold);
    font-size: var(--text-fs-base);
`;

// Pinned at the base of the sidebar; padding matches the section content
// (6px left / 10px right) so the button lines up with the editors above it.
const MenuBottom = styled('div')`
    flex-shrink: 0;
    position: relative;
    padding: 12px 10px 16px 6px;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 12px;
        margin-top: -12px;
        pointer-events: none;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, var(--color-bg-primary) 100%);
    }
`;

const Main = styled('div')`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    position: relative;
    gap: 12px;
    // 16px left gap separates the preview from the sidebar; matches the sidebar
    // header's top inset so the preset row and the "Theme Builder" title align.
    padding: 16px 0 20px 16px;
`;

const Preview = styled('div')`
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-md, 8px);
    background: var(--color-bg-primary);

    // Force the AgStudio wrapper element to fill the preview pane.
    > div {
        flex: 1;
        min-height: 0;
        width: 100%;
        height: 100%;
    }
`;
