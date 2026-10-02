import { type Part, _asThemeImpl } from 'ag-stack';
import { atom, useAtom } from 'jotai';

import type { PersistentAtom } from './JSONStorage';
import { atomWithJSONStorage } from './JSONStorage';
import { getBaseTheme } from './base-theme';
import { memoize, titleCase } from './utils';

const getBaseThemeParts = memoize(() => new Set<Part>(_asThemeImpl(getBaseTheme()).parts));

export class FeatureModel {
    readonly label: string;
    readonly parts: PartModel[];
    readonly defaultPart: PartModel;
    readonly selectedPartAtom: PersistentAtom<PartModel>;

    constructor(
        readonly featureName: string,
        parts: Record<string, Part>,
        readonly docs: string | null = null
    ) {
        this.label = titleCase(featureName);
        this.parts = Object.entries(parts).map(([variant, part]) => new PartModel(this, variant, part));
        this.defaultPart = this.parts.find((pm) => getBaseThemeParts().has(pm.part))!;
        if (!this.defaultPart) {
            throw new Error(`The base theme's ${featureName} part is not among the options supplied for it`);
        }
        this.selectedPartAtom = createSelectedPartAtom(this);
    }

    static for(featureName: string) {
        const featureModel = allFeatureModels().find((feature) => feature.featureName === featureName);
        if (!featureModel) {
            throw new Error(`Invalid feature ${featureName}`);
        }
        return featureModel;
    }
}

export const useSelectedPart = (feature: FeatureModel) => useAtom(feature.selectedPartAtom);

const createSelectedPartAtom = (feature: FeatureModel) => {
    const backingAtom = atomWithJSONStorage<string | undefined>(`part.${feature.featureName}`, undefined);
    return atom(
        (get) => {
            const variantName = get(backingAtom);
            return feature.parts.find((v) => v.id === variantName) || feature.defaultPart;
        },
        (_get, set, newVariant: PartModel) =>
            set(backingAtom, newVariant.id === feature.defaultPart.id ? undefined : newVariant.id)
    );
};

export class PartModel {
    readonly label: string;
    readonly id: string;

    constructor(
        readonly feature: FeatureModel,
        readonly variantName: string,
        readonly part: Part<any>
    ) {
        this.label = titleCase(variantName);
        this.id = feature.featureName + '/' + variantName;
    }

    get exportName(): string {
        return this.feature.featureName + this.variantName[0].toUpperCase() + this.variantName.slice(1);
    }
}

let featureModelsSource: () => FeatureModel[] = () => [];

/**
 * Hosts supply the swappable-part features the builder exposes; a host whose
 * theme has no interchangeable parts supplies none. Constructing a FeatureModel
 * reads the base theme, so this is called lazily - and only once, since the
 * result is memoized.
 */
export const setFeatureModels = (source: () => FeatureModel[]) => {
    featureModelsSource = source;
};

export const allFeatureModels = memoize(() => featureModelsSource());
