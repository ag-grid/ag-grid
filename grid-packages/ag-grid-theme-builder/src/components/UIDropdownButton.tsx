import { ClickAwayListener, Popper } from '@mui/base';
import { Button, styled } from '@mui/joy';
import { ReactNode, useRef, useState } from 'react';

export type WidgetDropdownProps = {
  dropdownContent: ReactNode;
  children: ReactNode;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
  className?: string;
};

let idCounter = 0;
/**
 * A version of MUI's menu component that can contain interactive UI in the dropdown. It doesn't close until you click outside the dropdown.
 */
export const UIDropdownButton = (props: WidgetDropdownProps) => {
  const [popperId] = useState(() => String(++idCounter));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = !!anchorEl;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  return (
    <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
      <Container>
        <DropdownTriggerButton
          className={props.className}
          ref={buttonRef}
          variant="outlined"
          color="neutral"
          size="sm"
          onClick={() => {
            setAnchorEl(open ? null : buttonRef.current);
          }}
        >
          {props.startDecorator}
          {props.children}
          {props.endDecorator}
        </DropdownTriggerButton>
        <StyledPopper id={popperId} open={open} anchorEl={anchorEl} placement="auto-end">
          {open && (
            <DropdownArea ref={dropdownRef} sx={{ boxShadow: 10 }}>
              {props.dropdownContent}
            </DropdownArea>
          )}
        </StyledPopper>
      </Container>
    </ClickAwayListener>
  );
};

const Container = styled('div')`
  pointer-events: none;
`;

const DropdownTriggerButton = styled(Button)`
  font-weight: 500;
  pointer-events: all;
  gap: 8px;
`;

const StyledPopper = styled(Popper)`
  z-index: 1;
`;

const DropdownArea = styled('div')`
  pointer-events: all;
  margin-left: 4px;
`;
