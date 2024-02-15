import { ColorParam } from '../../ag-grid-community-themes/metadata';
import { ParamModel, useParamAtom } from '../../model/ParamModel';
import { ColorEditor } from '../color-editor/ColorEditor';

export type ParamEditorProps = {
  param: ParamModel;
  meta: ColorParam;
};

export const ColorParamEditor = ({ param, meta }: ParamEditorProps) => {
  const [value, setValue] = useParamAtom(param);
  return (
    <ColorEditor
      value={value || null}
      onChange={setValue}
      preventTransparency={meta.preventTransparency}
      preventVariables={meta.preventVariables}
    />
  );
};
