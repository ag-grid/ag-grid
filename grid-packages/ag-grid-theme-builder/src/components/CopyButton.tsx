import { Checkmark, Copy } from '@carbon/icons-react';
import { Button, styled } from '@mui/joy';
import { useState } from 'react';
import { logErrorMessage } from '../model/utils';

type CopyButtonProps = {
  children: string;
  getText: () => string;
};

export const CopyButton = ({ children, getText }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const copiedClass = copied ? 'is-copied' : '';

  return (
    <StyledButton
      className={copiedClass}
      onClick={() =>
        void (async () => {
          try {
            if (navigator.clipboard) {
              await navigator.clipboard.writeText(getText());
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
              return;
            }
          } catch (e) {
            logErrorMessage('Failed to copy', e);
          }
          setCopied(false);
          alert('ERROR: could not copy CSS, ensure that you are using a recent web browser.');
        })()
      }
    >
      <CopiedLabel className={copiedClass}>
        <LabelText>Copied!</LabelText>
        <Checkmark />
      </CopiedLabel>
      <DefaultLabel className={copiedClass}>
        <LabelText>{children}</LabelText>
        <Copy />
      </DefaultLabel>
    </StyledButton>
  );
};

const StyledButton = styled(Button)`
  transition: background-color 0.4s;
  position: relative;
  display: flex;
  justify-content: center;

  &.is-copied {
    background-color: rgb(51, 165, 53);
  }
`;

const LabelText = styled('span')`
  margin-right: 10px;
`;

const DefaultLabel = styled('div')`
  display: flex;
  align-items: center;
  opacity: 1;
  &.is-copied {
    opacity: 0;
  }
`;

const CopiedLabel = styled(DefaultLabel)`
  position: absolute;
  opacity: 0;
  &.is-copied {
    opacity: 1;
  }
`;
