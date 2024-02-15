import { useAtom, useAtomValue } from 'jotai';
import { ParamMeta } from '../ag-grid-community-themes/metadata';
import { PersistentAtom, atomWithJSONStorage } from './JSONStorage';
import { allPartModels } from './PartModel';
import { memoize, titleCase } from './utils';

export class ParamModel {
  readonly type: ParamMeta['type'];
  readonly property: string;
  readonly label: string;
  readonly valueAtom: PersistentAtom<any>;

  constructor(paramMeta: ParamMeta) {
    this.type = paramMeta.type;
    this.property = paramMeta.property;
    this.label = titleCase(paramMeta.property);
    this.valueAtom = atomWithJSONStorage(`param.${paramMeta.property}`, undefined);
  }
}

export const useParamAtom = (model: ParamModel) => useAtom(model.valueAtom);
export const useParam = (model: ParamModel) => useAtomValue(model.valueAtom);

export const allParamModels = memoize(() => allPartModels().flatMap((part) => part.params));
