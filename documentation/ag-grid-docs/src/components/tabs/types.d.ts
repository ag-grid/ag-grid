export interface TabData {
    id: string;
    label: string;
}

type CodesandboxHeaderLink = {
    type: 'codesandbox';
    href: string;
};
export type TabHeaderLink = CodesandboxHeaderLink;
