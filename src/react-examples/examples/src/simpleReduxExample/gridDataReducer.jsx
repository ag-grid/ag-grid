export default (state = {rowData: [], rowSelection: []}, action) => {
    switch (action.type) {
        case 'ROW_DATA_CHANGED':
            return {
                ...state,
                rowData: action.rowData,
            };
        case 'ROW_SELECTION_CHANGED':
            return {
                ...state,
                rowSelection: action.rowSelection,
            };
        default:
            return state;
    }
};