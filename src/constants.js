define([], function() {
    var constants = {};

    constants.STEP_EVERYTHING = 0;
    constants.STEP_FILTER = 1;
    constants.STEP_SORT = 2;
    constants.STEP_MAP = 3;

    constants.ASC = "asc";
    constants.DESC = "desc";

    constants.ROW_BUFFER_SIZE = 5;

    constants.SORT_STYLE_SHOW = "display:inline;";
    constants.SORT_STYLE_HIDE = "display:none;";

    constants.MIN_COL_WIDTH = 10;
    constants.DEFAULT_COL_WIDTH = 200;

    return constants;
});