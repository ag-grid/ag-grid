export interface IAfterGuiAttachedParams {
    container: 'columnMenu' | 'contextMenu' | 'toolPanel';
    hidePopup?: () => void;
}