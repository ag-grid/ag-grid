import type { Part } from '@ag-grid-community/theming';
import * as themes from '@ag-grid-community/theming';
import { atom, useAtom } from 'jotai';

import type { PersistentAtom } from './JSONStorage';
import { atomWithJSONStorage } from './JSONStorage';
import { memoize, titleCase } from './utils';

const partsByGroup: Record<string, Part<any>[] | undefined> = {
    colorScheme: [
        themes.colorSchemeLightCold,
        themes.colorSchemeLightNeutral,
        themes.colorSchemeLightWarm,
        themes.colorSchemeDarkBlue,
        themes.colorSchemeDarkNeutral,
        themes.colorSchemeDarkWarm,
    ],
    iconSet: [
        themes.iconSetAlpine,
        themes.iconSetMaterial,
        themes.iconSetQuartzLight,
        themes.iconSetQuartzRegular,
        themes.iconSetQuartzBold,
    ],
    tabStyle: [themes.tabStyleQuartz, themes.tabStyleAlpine, themes.tabStyleMaterial, themes.tabStyleRolodex],
    inputStyle: [themes.inputStyleBordered, themes.inputStyleUnderlined],
};

export const getPartsByGroup = (group: string) => partsByGroup[group];

const featureModels: Record<string, GroupModel> = {};

const partDocs: Record<string, string | undefined> = {
    tabStyle: 'The appearance of tabs in chart settings and legacy column menu',
    inputStyle: 'The appearance of text input fields',
};

const defaultPartIds = new Set(themes.themeQuartz.dependencies.map((dep) => dep.id));

export class GroupModel {
    readonly label: string;
    readonly docs: string | null;
    readonly parts: PartModel[];
    readonly defaultPart: PartModel;
    readonly selectedPartAtom: PersistentAtom<PartModel>;

    private constructor(readonly groupId: string) {
        this.label = titleCase(groupId);
        this.docs = partDocs[groupId] || null;
        const parts = partsByGroup[groupId];
        if (!parts) throw new Error(`Invalid groupId "${groupId}"`);
        this.parts = parts.map((part) => new PartModel(this, part));
        this.defaultPart = this.parts.find((v) => defaultPartIds.has(v.id)) || this.parts[0];
        this.selectedPartAtom = createSelectedPartAtom(this);
    }

    static for(partID: string) {
        return featureModels[partID] || (featureModels[partID] = new GroupModel(partID));
    }
}

export const useSelectedPart = (group: GroupModel) => useAtom(group.selectedPartAtom);

const createSelectedPartAtom = (group: GroupModel) => {
    const backingAtom = atomWithJSONStorage<string | null>(`selected-part.${group.groupId}`, null);
    return atom(
        (get) => {
            const variantId = get(backingAtom);
            return group.parts.find((v) => v.id === variantId) || group.defaultPart;
        },
        (_get, set, newVariant: PartModel) => set(backingAtom, newVariant.id)
    );
};

export class PartModel {
    readonly label: string;
    readonly id: string;
    readonly variant: string;

    constructor(
        readonly group: GroupModel,
        readonly part: Part<any>
    ) {
        this.label = titleCase(part.variant);
        this.variant = part.variant;
        this.id = part.id;
    }
}

const allPartIds = ['colorScheme', 'iconSet', 'tabStyle', 'inputStyle'];

export const allGroupModels = memoize(() => allPartIds.map((partId) => GroupModel.for(partId)));
