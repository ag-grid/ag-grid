export type Framework = 'javascript' | 'react' | 'angular' | 'vue';

export type InternalFramework =
    | 'vanilla'
    | 'typescript'
    | 'reactFunctional'
    | 'reactFunctionalTs'
    | 'angular'
    | 'vue'
    | 'vue3';

export interface FooterItem {
    title: string;
    links: {
        name: string;
        url: string;
        newTab?: boolean;
        iconName: string;
    }[];
}
