import { useAtom, useAtomValue } from 'jotai';
import { atomWithJSONStorage } from './JSONStorage';
import type { PersistentAtom } from './JSONStorage';
import type { Store } from './store';
import { memoize, titleCase } from './utils';
import { corePart, getParamDocs, getParamType, getPartParams, type ParamType } from '@ag-grid-community/theming';

const paramModels: Record<string, ParamModel> = {};

export class ParamModel {
  readonly label: string;
  readonly docs: string;
  readonly type: ParamType;
  readonly valueAtom: PersistentAtom<any>;

  private constructor(readonly property: string) {
    this.label = titleCase(property);
    this.valueAtom = atomWithJSONStorage(`param.${property}`, undefined);
    this.docs = getParamDocs(property) || '';
    this.type = getParamType(property);
  }

  hasValue = (store: Store) => store.get(this.valueAtom) != null;

  static for(property: string) {
    return paramModels[property] || (paramModels[property] = new ParamModel(property));
  }
}

export const useParamAtom = <T = any>(model: ParamModel) =>
  useAtom(model.valueAtom as PersistentAtom<T>);

export const useParam = (model: ParamModel) => useAtomValue(model.valueAtom);

export const allParamModels = memoize(() =>
  getPartParams(corePart)
    .map((param) => ParamModel.for(param))
    .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase())),
);
