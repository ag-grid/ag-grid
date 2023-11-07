import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import '@ag-grid-community/styles/ag-theme-balham.css';
import '@ag-grid-community/styles/ag-theme-material.css';
import { TrashCan } from '@carbon/icons-react';
import styled from '@emotion/styled';
import { useParentTheme } from 'atoms/parentTheme';
import { useRenderedCss } from 'atoms/renderedCss';
import { useResetVariableDefaults } from 'atoms/variableDefaults';
import { Inspector } from 'components/inspector/Inspector';
import { memo, useLayoutEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { CopyButton } from './CopyButton';
import { GridPreview } from './GridPreview';
import { IconButton } from './IconButton';
import { ParentThemeMenu } from './ParentThemeMenu';

export const RootContainer = memo(() => {
  const parentTheme = useParentTheme();
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
      <DefaultsElement className={parentTheme.name} id="theme-builder-defaults-computation" />
      <Container>
        {hasRenderedStyles && (
          <>
            <TopRow>
              <ParentThemeMenu />
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
            </TopRow>
            <Columns>
              <LeftColumn>
                <Inspector />
              </LeftColumn>
              <RightColumn>
                <GridPreview />
              </RightColumn>
            </Columns>
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
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px;

  .tooltip {
    max-width: 400px;
  }
`;

const DefaultsElement = styled('div')`
  position: absolute;
  transform: translateY(-10);
`;

const TopRow = styled('div')`
  display: flex;
  justify-content: space-between;
`;

const Columns = styled('div')`
  display: flex;
  flex: 1;

  .tooltip {
    max-width: 400px;
  }
`;

const LeftColumn = styled('div')`
  display: flex;
  flex-direction: column;
  flex: 1.5;
  min-width: 200px;
  max-width: 400px;
  margin-right: 20px;
  gap: 20px;
`;

const RightColumn = styled('div')`
  flex: 2.5;
  overflow-x: auto;
`;
