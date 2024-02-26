import { atom, useAtom } from 'jotai';
import { ParamTypes, Part, allParts } from '../ag-grid-community-themes';
import { PartMeta, PresetMeta, allPartsMeta } from '../ag-grid-community-themes/metadata';
import { PersistentAtom, atomWithJSONStorage } from './JSONStorage';
import { ParamModel } from './ParamModel';
import { logErrorMessageOnce, memoize, titleCase } from './utils';

export type ParamValueMap = Readonly<Partial<ParamTypes>>;

export class PartModel {
  readonly partId: string;
  readonly label: string;
  readonly presets: readonly PresetModel[] | undefined;
  readonly defaultPreset: PresetModel | undefined;
  readonly paramDefaults: ParamValueMap;
  readonly themePart: Part;

  readonly params: readonly ParamModel[];

  readonly enabledAtom: PersistentAtom<boolean>;
  readonly presetAtom: PersistentAtom<string | null>;

  constructor(partMeta: PartMeta) {
    this.partId = partMeta.partId;
    this.label = titleCase(this.partId);
    if (partMeta.presets) {
      this.presets = partMeta.presets?.map((preset) => new PresetModel(this, preset));
      this.defaultPreset = this.presets[partMeta.presets.findIndex((preset) => preset.isDefault)];
    }
    this.paramDefaults = Object.fromEntries(
      partMeta.params?.map((param) => [param.property, param.defaultValue]) || [],
    );
    this.params = partMeta.params?.map((param) => new ParamModel(param)) || [];

    this.enabledAtom = this.alwaysPresent
      ? constantAtom(true, `Can't disable part ${this.partId}`)
      : atomWithJSONStorage<boolean>(`part.enabled.${this.partId}`, true);

    this.themePart = allParts.find((part) => part.partId === this.partId)!;

    const presetParam = this.params.find((param) => param.meta.type === 'preset');
    if (presetParam) {
      this.presetAtom = presetParam?.valueAtom;
    } else {
      this.presetAtom = constantAtom(null, `Can't set a preset for part ${this.partId}`);
    }
  }

  get alwaysPresent(): boolean {
    return this.partId === 'core' || this.partId === 'colors';
  }
}

export const usePartEnabledAtom = (part: PartModel) => useAtom(part.enabledAtom);
export const usePartPresetAtom = (part: PartModel) => useAtom(part.presetAtom);

const constantAtom = <T>(value: T, message: string) =>
  atom(
    () => value,
    () => logErrorMessageOnce(message),
  );

export class PresetModel {
  readonly type = 'preset' as const;
  readonly presetId: string;
  readonly label: string;
  readonly paramValueOverrides: ParamValueMap;

  constructor(
    readonly part: PartModel,
    presetMeta: PresetMeta,
  ) {
    this.presetId = presetMeta.presetId;
    this.label = titleCase(this.presetId);
    this.paramValueOverrides = presetMeta.paramValues;
  }

  getFullPartParamValues(): ParamValueMap {
    return Object.assign(
      {},
      corePartModel().paramDefaults,
      this.part.paramDefaults,
      this.paramValueOverrides,
    );
  }
}

export const allPartModels = memoize(() => allPartsMeta.map((partMeta) => new PartModel(partMeta)));

const corePartModel = memoize(() => allPartModels().find((part) => part.partId === 'core')!);
