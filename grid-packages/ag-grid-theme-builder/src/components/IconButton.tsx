import styled from '@emotion/styled';
import { ComponentType } from 'react';

type IconButtonProps = {
  label: string;
  onClick: () => void;
  icon: ComponentType;
};

export const IconButton = ({ label, onClick, icon: IconComponent }: IconButtonProps) => {
  return (
    <Button onClick={onClick} className="button-secondary">
      <Label>
        <LabelText>{label}</LabelText>
        <IconComponent />
      </Label>
    </Button>
  );
};

const Button = styled('button')`
  display: flex;
  justify-content: center;
`;

const LabelText = styled('span')`
  margin-right: 10px;
`;

const Label = styled('div')`
  display: flex;
  align-items: center;
`;
