import { useEffect, useRef } from 'react';

export type MockInputProps = {
  kind: 'checkbox' | 'toggle-button' | 'radio-button' | 'text';
  state?: 'unchecked' | 'checked' | 'indeterminate';
  focussed?: boolean;
  disabled?: boolean;
  invalid?: boolean;
};

const typeByKind: Record<MockInputProps['kind'], string | undefined> = {
  checkbox: 'checkbox',
  'radio-button': 'checkbox',
  'toggle-button': 'checkbox',
  text: 'text',
};

export const MockInput = ({ kind, state, focussed, disabled, invalid }: MockInputProps) => {
  const checked = state === 'checked';
  const indeterminate = state === 'indeterminate';
  const type = typeByKind[kind];

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
        focussed && 'ag-builder-preview-focus',
        disabled && 'ag-disabled',
      ]
        .filter(Boolean)
        .join('  ')}
      role="presentation"
    >
      <input
        ref={inputRef}
        className={[
          'ag-input-field-input',
          `ag-${kind}-input`,
          focussed && 'ag-builder-preview-focus',
        ]
          .filter(Boolean)
          .join('  ')}
        type={typeByKind[kind]}
        checked={type === 'checkbox' ? state === 'checked' : undefined}
        disabled={disabled}
        tabIndex={-1}
        onChange={() => undefined}
        required={invalid}
      />
    </div>
  );
};
