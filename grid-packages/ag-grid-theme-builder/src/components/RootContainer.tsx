import { styled } from '@mui/joy';
import { useAtomValue } from 'jotai';
import { memo } from 'react';
import { GridConfigDropdownButton } from '../features/grid-config/GridConfigDropdown';
import { ParamsEditor } from '../features/params-editor/ParamsEditor';
import { PartsEditor } from '../features/parts-editor/PartsEditor';
import { renderedThemeAtom } from '../model/rendered-theme';
import { CopyButton } from './CopyButton';
import { DiscardChangesButton } from './DiscardChangesButton';
import { GridPreview } from './GridPreview';

export const RootContainer = memo(() => {
  const theme = useAtomValue(renderedThemeAtom);
  return (
    <Container>
      <Grid>
        <Header>
          <GridConfigDropdownButton />
          <Spacer />
          <CopyButton getText={() => theme.css}>Copy CSS</CopyButton>
          <DiscardChangesButton />
        </Header>
        <Menu>
          <PartsEditor />
          <ParamsEditor />
        </Menu>
        <Main>
          <GridPreview />
        </Main>
      </Grid>
    </Container>
  );
});

const Container = styled('div')`
  position: absolute;
  inset: 12px;
`;

const Grid = styled('div')`
  height: 100%;
  display: grid;
  grid-template-areas:
    'header header'
    'menu main';
  grid-template-columns: 400px auto;
  grid-template-rows: min-content auto;
  gap: 20px;

  font-family: 'IBM Plex Sans', sans-serif;

  .tooltip {
    max-width: 400px;
  }
`;

const Header = styled('div')`
  grid-area: header;
  display: flex;
  gap: 16px;
`;

const Spacer = styled('div')`
  flex-grow: 1;
`;

const Menu = styled('div')`
  grid-area: menu;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Main = styled('div')`
  grid-area: main;
`;
