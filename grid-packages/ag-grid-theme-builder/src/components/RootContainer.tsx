import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import '@ag-grid-community/styles/ag-theme-balham.css';
import '@ag-grid-community/styles/ag-theme-material.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { TrashCan } from '@carbon/icons-react';
import styled from '@emotion/styled';
import { useColorScheme } from 'atoms/colorScheme';
import { useParentTheme } from 'atoms/parentTheme';
import { useRenderedCss } from 'atoms/renderedCss';
import { useResetVariableDefaults } from 'atoms/variableDefaults';
import { memo, useLayoutEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { ColorSchemeMenu } from './ColorSchemeMenu';
import { CopyButton } from './CopyButton';
import { GridPreview } from './GridPreview';
import { IconButton } from './IconButton';
import { ParentThemeMenu } from './ParentThemeMenu';
import { Inspector } from './inspector/Inspector';

export const RootContainer = memo(() => {
  const parentTheme = useParentTheme();
  const colorScheme = useColorScheme();
  const renderedCss = useRenderedCss();
  const resetVariableDefaults = useResetVariableDefaults();
  const [hasRenderedStyles, setHasRenderedStyles] = useState(false);

  useLayoutEffect(() => {
    setHasRenderedStyles(true);
    resetVariableDefaults();
  }, [renderedCss, resetVariableDefaults]);

  return (
    <>
      <style>{renderedCss}</style>
      <DefaultsElement
        className={`${parentTheme.name}-${colorScheme}`}
        id="theme-builder-defaults-computation"
      />
      <Container>
        {hasRenderedStyles && (
          <>
            <Header>
              <ParentThemeMenu />
              <ColorSchemeMenu />
              <IconButton
                label="Discard changes"
                icon={TrashCan}
                onClick={() => {
                  if (confirm('Discard all of your theme customisations?')) {
                    localStorage.clear();
                    location.reload();
                  }
                }}
              />
              <CopyButton payload={renderedCss} label="Copy CSS" />
            </Header>
            <Menu>
              <Inspector />
            </Menu>
            <Main>
              <GridPreview />
            </Main>
            <Tooltip
              id="theme-builder-tooltip"
              className="tooltip"
              place="top"
              anchorSelect="[data-tooltip-content]"
            />
          </>
        )}
      </Container>
    </>
  );
});

const Container = styled('div')`
  height: 100%;
  display: grid;
  grid-template-areas:
    'header header'
    'menu main';
  grid-template-columns: 300px auto;
  grid-template-rows: min-content auto;
  gap: 20px;

  .tooltip {
    max-width: 400px;
  }
`;

const DefaultsElement = styled('div')`
  position: absolute;
  transform: translateY(-10);
`;

const Header = styled('div')`
  grid-area: header;
  display: flex;
  justify-content: space-between;
`;

const Menu = styled('div')`
  grid-area: menu;
  overflow: auto;
`;

const Main = styled('div')`
  grid-area: main;
`;
