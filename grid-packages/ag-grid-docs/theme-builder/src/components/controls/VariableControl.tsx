import { useParentTheme } from 'atoms/parentTheme';
import { useRenderedVariable } from 'atoms/renderedTheme';
import { useVariableValueAtom } from 'atoms/values';
import { useVariableDescription } from 'atoms/variableDescriptions';
import { withErrorBoundary } from 'components/ErrorBoundary';
import { Control } from 'components/controls/Control';
import { Feature } from 'model/features';
import { kebabCaseToTitleCase } from 'model/utils';
import { defaultValueForType } from 'model/values';
import { getVariableDefault } from 'model/variableDefaults';
import { getVariableInfoOrThrow } from 'model/variables';
import { ReactElement, memo, useState } from 'react';
import { DefaultValue } from './DefaultValue';
import { ColorInput } from './inputs/ColorInput';
import { DimensionInput } from './inputs/DimensionInput';

export type VariableControlProps = {
  variableName: string;
  feature: Feature;
};

const VariableControl = ({ variableName, feature }: VariableControlProps): JSX.Element => {
  const parentTheme = useParentTheme();
  const [value, setValue] = useVariableValueAtom(variableName);
  const renderedValue = useRenderedVariable(variableName);
  const info = getVariableInfoOrThrow(variableName);
  const description = useVariableDescription(variableName);

  const [error, setError] = useState<string | null>(null);
  const [shouldFocus, setShouldFocus] = useState(false);

  if (info.hideEditor) return <></>;

  const label = kebabCaseToTitleCase(variableName, feature.commonVariablePrefix || '--ag-');

  const renderDefault = () => {
    const defaultValue =
      renderedValue ||
      getVariableDefault(parentTheme.name, variableName) ||
      defaultValueForType(info.type);
    return (
      <Control
        label={label}
        help={description}
        onEdit={() => {
          setShouldFocus(true);
          setValue(defaultValue);
        }}
      >
        <DefaultValue value={defaultValue} />
      </Control>
    );
  };

  if (!value) {
    return renderDefault();
  }

  const renderInput = (): ReactElement => {
    const mismatchError = `${value.type} value provided for ${info.type} variable (${variableName})`;
    switch (value.type) {
      case 'color':
        if (info.type !== 'color') throw new Error(mismatchError);
        return (
          <ColorInput
            value={value}
            info={info}
            error={error}
            onErrorChange={setError}
            onValueChange={setValue}
            initialFocus={shouldFocus}
          />
        );
      case 'dimension':
        if (info.type !== 'dimension') throw new Error(mismatchError);
        return (
          <DimensionInput
            value={value}
            info={info}
            error={error}
            onErrorChange={setError}
            onValueChange={setValue}
            initialFocus={shouldFocus}
          />
        );
      case 'border':
        if (info.type !== 'border') throw new Error(mismatchError);
        return <div>TODO: border control</div>;
    }
  };

  return (
    <Control
      label={label}
      error={error}
      help={description}
      onReset={() => {
        setValue(null);
      }}
    >
      {renderInput()}
    </Control>
  );
};

const VariableControlWrapped = memo(withErrorBoundary(VariableControl));
export { VariableControlWrapped as VariableControl };
