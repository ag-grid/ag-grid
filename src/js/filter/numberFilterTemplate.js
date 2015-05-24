var template = [
    '<div>',
    '<div>',
    '<select class="ag-filter-select" id="filterType">',
    '<option value="1">[EQUALS]</option>',
    '<option value="2">[LESS THAN]</option>',
    '<option value="3">[GREATER THAN]</option>',
    '</select>',
    '</div>',
    '<div>',
    '<input class="ag-filter-filter" id="filterText" type="text" placeholder="[FILTER...]"/>',
    '</div>',
    '</div>',
].join('');

module.exports = template;
