import { useAtom, useAtomValue } from 'jotai';
import { ParamMeta } from '../ag-grid-community-themes/metadata';
import { paramToVariableName } from '../ag-grid-community-themes/theme-utils';
import { PersistentAtom, atomWithJSONStorage } from './JSONStorage';
import { allPartModels } from './PartModel';
import { Store } from './store';
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

  hasValue = (store: Store) => store.get(this.valueAtom) != null;

  get variableName(): string {
    return paramToVariableName(this.property);
  }
}

export const useParamAtom = <T = any>(model: ParamModel) =>
  useAtom(model.valueAtom as PersistentAtom<T>);
export const useParam = (model: ParamModel) => useAtomValue(model.valueAtom);

export const allParamModels = memoize(() =>
  allPartModels()
    .flatMap((part) => part.params)
    .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase())),
);
