import { Checkmark, Copy } from '@carbon/icons-react';
import styled from '@emotion/styled';
import { useState } from 'react';

type CopyButtonProps = {
  label: string;
  payload: string;
};

export const CopyButton = ({ label, payload }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const copiedClass = copied ? 'is-copied' : '';

  return (
    <Button
      className={copiedClass}
      onClick={() =>
        void (async () => {
          try {
            if (navigator.clipboard) {
              await navigator.clipboard.writeText(payload);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
              return;
            }
          } catch {
            // ignore errors
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
        <LabelText>{label}</LabelText>
        <Copy />
      </DefaultLabel>
    </Button>
  );
};

const Button = styled('button')`
  transition: background-color 0.4s;
  position: relative;
  display: flex;
  justify-content: center;

  &.is-copied {
    background-color: var(--green-600) !important;
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
