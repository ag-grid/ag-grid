import { useEffect, useRef } from 'react';

type MockInputProps = {
  kind: 'checkbox' | 'toggle-button';
  state: 'unchecked' | 'checked' | 'indeterminate';
  focus?: boolean;
  disabled?: boolean;
};

export const MockInput = ({ kind, state, focus, disabled }: MockInputProps) => {
  const checked = state === 'checked';
  const indeterminate = state === 'indeterminate';

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  return (
    <div
      className={[
        'ag-wrapper ag-input-wrapper',
        `ag-${kind}-input-wrapper`,
        checked && 'ag-checked',
        indeterminate && 'ag-indeterminate',
        focus && 'ag-builder-preview-focus',
        disabled && 'ag-disabled',
      ]
        .filter(Boolean)
        .join('  ')}
      role="presentation"
    >
      <input
        ref={inputRef}
        className={`ag-input-field-input ag-${kind}-input`}
        type="checkbox"
        checked={state === 'checked'}
        disabled={disabled}
        readOnly
      />
    </div>
  );
};
