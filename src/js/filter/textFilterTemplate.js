var template = [
    '<div>',
    '<div>',
    '<select class="ag-filter-select" id="filterType">',
    '<option value="1">[CONTAINS]</option>',
    '<option value="2">[EQUALS]</option>',
    '<option value="3">[STARTS WITH]</option>',
    '<option value="4">[ENDS WITH]</option>',
    '</select>',
    '</div>',
    '<div>',
    '<input class="ag-filter-filter" id="filterText" type="text" placeholder="[FILTER...]"/>',
    '</div>',
    '</div>',
].join('');

module.exports = template;
