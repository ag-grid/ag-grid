import styled from '@emotion/styled';

import { useRenderedTheme } from '../../model/rendered-theme';
import { EditorPanel } from '../editors/EditorPanel';
import { GridConfigDropdownButton } from '../grid-config/GridConfigDropdown';
import { PresetSelector } from '../presets/PresetSelector';
import { DownloadThemeButton } from './Download';
import { GridPreview } from './GridPreview';

export const RootContainer = () => {
    useRenderedTheme();
    return (
        <Container>
            <Menu>
                <EditorScroller>
                    <EditorPanel />
                </EditorScroller>
                <MenuBottom>
                    <DownloadThemeButton />
                    <Spacer />
                    <GridConfigDropdownButton />
                </MenuBottom>
            </Menu>
            <Main>
                <PresetSelector />
                <GridPreview />
            </Main>
        </Container>
    );
};

const Container = styled('div')`
    width: 100%;
    height: calc(100vh - var(--header-nav-height) - 32px);
    min-height: 600px;
    margin-top: 16px;
    display: flex;

    font-family: -apple-system, BlinkMacSystemFont, 'IBM Plex Sans', sans-serif;

    .tooltip {
        max-width: 400px;
    }

    @media screen and (max-width: 800px) {
        display: none;
    }
`;

const EditorScroller = styled('div')`
    position: absolute;
    inset: 0 0 48px 0;
    overflow-y: auto;
`;

const Spacer = styled('div')`
    flex-grow: 1;
`;

const Menu = styled('div')`
    min-width: 300px;
    flex: 0;
    position: relative;
`;

const MenuBottom = styled('div')`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    gap: 20px;
    padding-right: 20px;

    &:after {
        content: '';
        display: block;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 12px;
        margin-top: -12px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, var(--color-bg-primary) 100%);
    }
`;

const Main = styled('div')`
    flex-grow: 1;
    min-width: 0;
    grid-area: main;
    padding-left: 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    gap: 20px;
`;
