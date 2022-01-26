(function () {
    var COUNTRY_CODES = {
        Ireland: "ie",
        Spain: "es",
        "United Kingdom": "gb",
        France: "fr",
        Germany: "de",
        Sweden: "se",
        Italy: "it",
        Greece: "gr",
        Iceland: "is",
        Portugal: "pt",
        Malta: "mt",
        Norway: "no",
        Brazil: "br",
        Argentina: "ar",
        Colombia: "co",
        Peru: "pe",
        Venezuela: "ve",
        Uruguay: "uy"
    };

    var IT_SKILLS = ["android", "css", "html5", "mac", "windows"];
    var IT_SKILLS_NAMES = ["Android", "CSS", "HTML 5", "Mac", "Windows"];

    var docEl = document.documentElement;
    var isSmall = docEl.clientHeight <= 415 || docEl.clientWidth < 768;
    var isTall = docEl.clientHeight >= 570;

    function createIcon(cls) {
        var iconEl = document.createElement('i');
        iconEl.classList.add('fas');
        iconEl.classList.add(cls);
        iconEl.style.width = '13px';
        iconEl.style.height = '13px';
        iconEl.style.marginRight = '5px';

        return iconEl;
    }

    function ContactInfoRenderer() { }

    ContactInfoRenderer.prototype.init = function (params) {
        var wrapperEl = document.createElement('div');
        wrapperEl.style.lineHeight = 'normal';
        wrapperEl.style.padding = '10px 0';

        var nameEl = document.createElement('p');
        var landlineEl = document.createElement('p');
        landlineEl.appendChild(createIcon('fa-phone'));
        landlineEl.style.marginBottom = '10px';

        var mobileEl = document.createElement('p');
        mobileEl.appendChild(createIcon('fa-mobile-alt'));
        mobileEl.style.marginBottom = '5px';

        var name = params.data.name;
        var landline = params.data.landline;
        var mobile = params.data.mobile;

        nameEl.style.fontWeight = 'bold';
        nameEl.innerHTML = name;

        var landlineText = document.createTextNode(landline);
        landlineEl.appendChild(landlineText);

        var mobileText = document.createTextNode(mobile);
        mobileEl.appendChild(mobileText);

        wrapperEl.appendChild(nameEl);
        wrapperEl.appendChild(landlineEl);
        wrapperEl.appendChild(mobileEl);

        this.eGui = wrapperEl;
    };

    ContactInfoRenderer.prototype.getGui = function () {
        return this.eGui;
    };

    var columnDefsMobile = [
        {
            headerName: 'Contact Info',
            cellRendererComp: ContactInfoRenderer,
            field: 'name',
            sort: 'asc',
            autoHeight: true,
            width: 200
        },
        {
            headerName: "Skills",
            width: 100,
            sortable: false,
            cellRendererComp: skillsCellRenderer,
            suppressSizeToFit: true
        },
        {
            headerName: "Proficiency",
            field: "proficiency",
            filterComp: "number",
            width: 150,
            cellRendererCompParams: {
                sparklineOptions: {
                    type: 'bar',
                    valueAxisDomain: [0, 100],
                    axis: {
                        strokeWidth: 0
                    },
                    formatter: barSparklineFormatter,
                    label: {
                        enabled: true,
                        color: 'black',
                        fontSize: 10,
                        fontWeight: 'bold',
                        placement: 'insideBase',
                        formatter: (params) => `${params.value}%`
                    },
                    tooltip: {
                        enabled: false
                    }
                },
            },
            cellStyle: {
                padding: '0 2px'
            }
        },
        {
            headerName: "Country",
            field: "country",
            width: 150,
            cellRendererComp: countryCellRenderer,
            cellStyle: {
                display: 'flex',
                alignItems: 'center'
            }
        }
    ];

    var columnDefs = [
        {
            headerName: "",
            width: 70,
            checkboxSelection: true,
            sortable: false,
            suppressMenu: true
        },
        {
            headerName: "Employee",
            children: [
                {
                    headerName: "Name",
                    field: "name",
                    width: 150
                },
                {
                    headerName: "Country",
                    field: "country",
                    width: 150,
                    cellRendererComp: countryCellRenderer,
                    filterCompParams: { cellRenderer: countryCellRenderer, cellHeight: 20 }
                }
            ]
        },
        {
            headerName: "IT Skills",
            children: [
                {
                    headerName: "Skills",
                    width: 130,
                    sortable: false,
                    cellRendererComp: skillsCellRenderer,
                    filterComp: SkillFilter
                },
                {
                    headerName: "Proficiency",
                    field: "proficiency",
                    filter: "number",
                    width: 150,
                    cellRendererComp: 'agSparklineCellRenderer',
                    cellRendererCompParams: {
                        sparklineOptions: {
                            type: 'bar',
                            valueAxisDomain: [0, 100],
                            axis: {
                                strokeWidth: 0
                            },
                            formatter: barSparklineFormatter,
                            label: {
                                enabled: true,
                                color: 'black',
                                fontSize: 10,
                                fontWeight: 'bold',
                                placement: 'insideBase',
                                formatter: (params) => `${params.value}%`
                            },
                            tooltip: {
                                enabled: false
                            }
                        },
                    },
                    filter: ProficiencyFilter,
                    cellStyle: {
                        padding: '0 2px'
                    }
                }
            ]
        },
        {
            headerName: "Contact",
            children: [
                { headerName: "Mobile", field: "mobile", width: 180, filterComp: "agTextColumnFilter" },
                { headerName: "Land-line", field: "landline", width: 180, filterComp: "agTextColumnFilter" },
                { headerName: "Address", field: "address", width: 500, filterComp: "agTextColumnFilter" }
            ]
        }
    ];

    var gridOptions = {
        defaultColDef: {
            sortable: true,
            resizable: true,
            filter: true,
            minWidth: 80
        },
        columnDefs: isSmall ? columnDefsMobile : columnDefs,
        rowSelection: "multiple",
        enableRangeSelection: true,
        suppressRowClickSelection: true,
        animateRows: true,
        debug: true
    };

    var btBringGridBack;
    var btDestroyGrid;

    // wait for the document to be loaded, otherwise
    // AG Grid will not find the div in the document.
    var loadGrid = function () {
        btBringGridBack = document.querySelector("#btBringGridBack");
        btDestroyGrid = document.querySelector("#btDestroyGrid");

        // this example is also used in the website landing page, where
        // we don't display the buttons, so we check for the buttons existence
        if (btBringGridBack) {
            btBringGridBack.addEventListener("click", onBtBringGridBack);
            btDestroyGrid.addEventListener("click", onBtDestroyGrid);
        }

        onBtBringGridBack();
    };

    if (document.readyState === "complete") {
        loadGrid();
    } else {
        document.addEventListener("DOMContentLoaded", loadGrid());
    }

    function onBtBringGridBack() {
        var eGridDiv = document.querySelector("#bestHtml5Grid");
        if (isSmall) {
            eGridDiv.classList.add('small');
        }

        if (isTall) {
            eGridDiv.classList.add('tall');
        }

        new agGrid.Grid(eGridDiv, gridOptions);
        if (btBringGridBack) {
            btBringGridBack.disabled = true;
            btDestroyGrid.disabled = false;
        }
        // createRowData is available in data.js
        gridOptions.api.setRowData(createRowData());
    }

    function onBtDestroyGrid() {
        btBringGridBack.disabled = false;
        btDestroyGrid.disabled = true;
        gridOptions.api.destroy();
    }

    function skillsCellRenderer(params) {
        var wrapperEl = document.createElement('div');
        wrapperEl.style.whiteSpace = isSmall ? 'normal' : 'nowrap';

        if (!isSmall) {
            wrapperEl.style.overflow = 'hidden';
            wrapperEl.style.textOverflow = 'ellipsis';
        }

        var data = params.data;
        IT_SKILLS.forEach(function (skill) {
            var img;
            if (data && data.skills[skill]) {
                img = document.createElement('img');
                img.src = 'https://www.ag-grid.com/example-assets/skills/' + skill + '.png';
                img.style.width = '16px';
                img.style.margin = '2px';
                img.title = skill;
                img.alt = skill;

                wrapperEl.appendChild(img);
            }
        });
        return wrapperEl;
    }

    function countryCellRenderer(params) {
        if (params.value == null || params.value === "" || params.value === '(Select All)') {
            return params.value;
        }

        var flag = "<img border='0' width='15' height='10' style='margin-bottom: 2px' src='https://flags.fmcdn.net/data/flags/mini/" + COUNTRY_CODES[params.value] + ".png' alt='" + params.value + "' />";
        return flag + " " + params.value;
    }

    function barSparklineFormatter(params) {
        const { yValue } = params;
        return {
            fill: yValue < 20 ? 'rgb(245, 93, 81)' : yValue < 60 ? 'rgb(255, 179, 0)' : 'rgb(130, 210, 73)'
        }
    }

    var SKILL_TEMPLATE =
        '<label style="border: 1px solid lightgrey; margin: 4px; padding: 4px;">' +
        "  <span>" +
        '    <div style="text-align: center;">SKILL_NAME</div>' +
        "    <div>" +
        '      <input type="checkbox"/>' +
        '      <img src="https://www.ag-grid.com/example-assets/skills/SKILL.png" width="30px" alt="skill" />' +
        "    </div>" +
        "  </span>" +
        "</label>";

    var FILTER_TITLE = '<div style="text-align: center; background: lightgrey; width: 100%; display: block; border-bottom: 1px solid grey;">' + "<b>TITLE_NAME</b>" + "</div>";

    function SkillFilter() { }

    SkillFilter.prototype.init = function (params) {
        this.filterChangedCallback = params.filterChangedCallback;
        this.model = {
            android: false,
            css: false,
            html5: false,
            mac: false,
            windows: false
        };
    };

    SkillFilter.prototype.getModel = function () { };

    SkillFilter.prototype.setModel = function (model) { };

    SkillFilter.prototype.getGui = function () {
        var eGui = document.createElement("div");
        var eInstructions = document.createElement("div");
        eInstructions.innerHTML = FILTER_TITLE.replace("TITLE_NAME", "Custom Skills Filter");
        eGui.appendChild(eInstructions);

        var that = this;

        IT_SKILLS.forEach(function (skill, index) {
            var skillName = IT_SKILLS_NAMES[index];
            var eSpan = document.createElement("span");
            var html = SKILL_TEMPLATE.replace("SKILL_NAME", skillName).replace("SKILL", skill);
            eSpan.innerHTML = html;

            var eCheckbox = eSpan.querySelector("input");
            eCheckbox.addEventListener("click", function () {
                that.model[skill] = eCheckbox.checked;
                that.filterChangedCallback();
            });

            eGui.appendChild(eSpan);
        });

        return eGui;
    };

    SkillFilter.prototype.doesFilterPass = function (params) {
        var rowSkills = params.data.skills;
        var model = this.model;
        var passed = true;

        IT_SKILLS.forEach(function (skill) {
            if (model[skill]) {
                if (!rowSkills[skill]) {
                    passed = false;
                }
            }
        });

        return passed;
    };

    SkillFilter.prototype.isFilterActive = function () {
        var model = this.model;
        var somethingSelected = model.android || model.css || model.html5 || model.mac || model.windows;
        return somethingSelected;
    };

    var PROFICIENCY_TEMPLATE = '<label style="padding-left: 4px;">' + '<input type="radio" name="RANDOM"/>' + "PROFICIENCY_NAME" + "</label>";

    var PROFICIENCY_NONE = "none";
    var PROFICIENCY_ABOVE40 = "above40";
    var PROFICIENCY_ABOVE60 = "above60";
    var PROFICIENCY_ABOVE80 = "above80";

    var PROFICIENCY_NAMES = ["No Filter", "Above 40%", "Above 60%", "Above 80%"];
    var PROFICIENCY_VALUES = [PROFICIENCY_NONE, PROFICIENCY_ABOVE40, PROFICIENCY_ABOVE60, PROFICIENCY_ABOVE80];

    function ProficiencyFilter() { }

    ProficiencyFilter.prototype.init = function (params) {
        this.filterChangedCallback = params.filterChangedCallback;
        this.selected = PROFICIENCY_NONE;
        this.params = params;
    };

    ProficiencyFilter.prototype.getModel = function () { };

    ProficiencyFilter.prototype.setModel = function (model) { };

    ProficiencyFilter.prototype.getGui = function () {
        var eGui = document.createElement("div");
        var eInstructions = document.createElement("div");
        eInstructions.innerHTML = FILTER_TITLE.replace("TITLE_NAME", "Custom Proficiency Filter");
        eGui.appendChild(eInstructions);

        var random = "" + Math.random();

        var that = this;
        PROFICIENCY_NAMES.forEach(function (name, index) {
            var eFilter = document.createElement("div");
            var html = PROFICIENCY_TEMPLATE.replace("PROFICIENCY_NAME", name).replace("RANDOM", random);
            eFilter.innerHTML = html;
            var eRadio = eFilter.querySelector("input");
            if (index === 0) {
                eRadio.checked = true;
            }
            eGui.appendChild(eFilter);

            eRadio.addEventListener("click", function () {
                that.selected = PROFICIENCY_VALUES[index];
                that.filterChangedCallback();
            });
        });

        return eGui;
    };

    ProficiencyFilter.prototype.doesFilterPass = function (params) {
        var { api, colDef, column, columnApi, context } = this.params;
        var { node } = params;

        var value = this.params.valueGetter({
            api,
            colDef,
            column,
            columnApi,
            context,
            data: node.data,
            getValue: (field) => node.data[field],
            node,
        });
        
        var valueAsNumber = parseFloat(value);

        switch (this.selected) {
            case PROFICIENCY_ABOVE40:
                return valueAsNumber >= 40;
            case PROFICIENCY_ABOVE60:
                return valueAsNumber >= 60;
            case PROFICIENCY_ABOVE80:
                return valueAsNumber >= 80;
            default:
                return true;
        }
    };

    ProficiencyFilter.prototype.isFilterActive = function () {
        return this.selected !== PROFICIENCY_NONE;
    };
})();
