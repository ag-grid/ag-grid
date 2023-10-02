import { Help, Reset } from '@carbon/icons-react';
import styled from '@emotion/styled';
import { ReactNode } from 'react';

export type ControlRowProps = {
  label: string;
  help?: string | null;
  error?: string | null;
  onReset?: () => void;
  onEdit?: () => void;
  children: ReactNode;
};

export const Control = ({ label, children, error, help, onEdit, onReset }: ControlRowProps) => {
  return (
    <Row className={error ? 'is-error' : ''}>
      <Label>{label}</Label>
      <RightCol>
        <InputsRow>
          <Inputs>{children}</Inputs>
          {onEdit && (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
              }}
            >
              edit
            </a>
          )}
          {onReset && (
            <RemoveOverrideIcon
              data-tooltip-content="Reset to theme default"
              data-tooltip-delay="1000"
              onClick={() => onReset()}
            />
          )}
          {help && <DocIcon data-tooltip-content={help} />}
        </InputsRow>
        {error && <Error>{error}</Error>}
      </RightCol>
    </Row>
  );
};

const Row = styled('div')`
  gap: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  min-height: 40px;
`;

const Label = styled('div')`
  display: flex;
  align-items: center;
  height: 40px;
  flex: 1;
  padding-right: 10px;
`;

const RightCol = styled('div')`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const InputsRow = styled('div')`
  display: flex;
  min-height: 40px;
  align-items: center;
  gap: 5px;
  width: 100%;
`;

const Inputs = styled('div')`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-right: auto;
`;

const Error = styled('div')`
  width: 100%;
  font-size: 0.8em;
  margin-top: 8px;
  color: var(--input-error-color);
`;

const DocIcon = styled(Help)`
  cursor: pointer;
`;

const RemoveOverrideIcon = styled(Reset)`
  cursor: pointer;
`;
