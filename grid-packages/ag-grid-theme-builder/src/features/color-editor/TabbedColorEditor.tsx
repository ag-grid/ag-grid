import { Eyedropper, Percentage, SettingsAdjust } from '@carbon/icons-react';
import { Tab, TabList, TabPanel, Tabs, styled } from '@mui/joy';
import { useState } from 'react';
import { EyedropperColorEditor } from './EyedropperColorEditor';
import { InputColorEditor } from './InputColorEditor';
import { VarColor } from './VarColor';
import { VarColorEditor } from './VarColorEditor';
import { UncontrolledColorEditorProps } from './color-editor-utils';

export const TabbedColorEditor = (props: UncontrolledColorEditorProps) => {
  const [tab, setTab] = useState<string | number | null>(() =>
    VarColor.parseCss(props.initialValue) ? 'var' : 'input',
  );

  const showVarTab = !props.preventTransparency && !props.preventVariables;

  return (
    <Container variant="outlined" value={tab} onChange={(_, newTab) => setTab(newTab)}>
      <TabList>
        <Tab value="input">
          <SettingsAdjust />
        </Tab>
        {showVarTab && (
          <Tab value="var">
            <Percentage />
          </Tab>
        )}
        <Tab value="eyedropper">
          <Eyedropper />
        </Tab>
      </TabList>
      <TabPanel value="input">
        <InputColorEditor {...props} />
      </TabPanel>
      {showVarTab && (
        <TabPanel value="var">
          <VarColorEditor {...props} />
        </TabPanel>
      )}
      <TabPanel value="eyedropper">
        <EyedropperColorEditor {...props} />
      </TabPanel>
    </Container>
  );
};

const Container = styled(Tabs)`
  width: 300px;
  border-radius: 8px;
  overflow: hidden;
`;
