import { useAtom, useAtomValue } from 'jotai';
import { ParamMeta } from '../ag-grid-community-themes/metadata';
import { PersistentAtom, atomWithJSONStorage } from './JSONStorage';
import { allPartModels } from './PartModel';
import { memoize, titleCase } from './utils';

export class ParamModel {
  readonly property: string;
  readonly label: string;
  readonly valueAtom: PersistentAtom<any>;

  constructor(readonly meta: ParamMeta) {
    this.property = meta.property;
    this.label = titleCase(meta.property);
    this.valueAtom = atomWithJSONStorage(`param.${meta.property}`, undefined);
  }
}

export const useParamAtom = (model: ParamModel) => useAtom(model.valueAtom);
export const useParam = (model: ParamModel) => useAtomValue(model.valueAtom);

export const allParamModels = memoize(() => allPartModels().flatMap((part) => part.params));
