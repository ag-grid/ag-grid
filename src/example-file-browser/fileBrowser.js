(function() {
    var rowData = [
        {
            folder: true,
            open: true,
            name: 'C:',
            children: [
                {folder: true,
                    name: 'Windows',
                    size: '',
                    type: 'File Folder',
                    dateModified: '27/02/2014 04:12',
                    children: [
                        {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'},
                        {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'},
                        {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}
                    ]
                },
                {folder: true,
                    name: 'Program Files',
                    size: '',
                    type: 'File Folder',
                    dateModified: '11/09/2013 02:11',
                    open: true,
                    children: [
                        {folder: true,
                            name: 'ASUS',
                            size: '',
                            type: 'File Folder',
                            dateModified: '13/03/2014 1014',
                            children: [
                                {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'},
                                {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'},
                                {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}
                            ]
                        },
                        {folder: true,
                            name: 'Classic Shell', size: '', type: 'File Folder', dateModified: '13/03/2014 1014',
                            children: [
                                {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'},
                                {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'},
                                {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}
                            ]
                        },
                        {folder: true,
                            name: 'Common Files', size: '', type: 'File Folder', dateModified: '13/03/2014 1014',
                            children: [
                                {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'},
                                {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'},
                                {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}
                            ]
                        },
                        {folder: true,
                            name: 'DisplayLink Core Software', size: '', type: 'File Folder', dateModified: '13/03/2014 1014',
                            children: [
                                {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'},
                                {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'},
                                {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}
                            ]
                        },
                        {folder: true,
                            name: 'Intel', size: '', type: 'File Folder', dateModified: '13/03/2014 1014',
                            children: [
                                {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'},
                                {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'},
                                {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}
                            ]
                        },
                        {folder: true,
                            name: 'Internet Explorer', size: '', type: 'File Folder', dateModified: '13/03/2014 1014',
                            children: [
                                {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'},
                                {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'},
                                {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}
                            ]
                        },
                        {folder: true,
                            name: 'Intel Corporation', size: '', type: 'File Folder', dateModified: '13/03/2014 1014',
                            children: [
                                {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'},
                                {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'},
                                {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}
                            ]
                        },
                        {folder: true,
                            name: 'Java', size: '', type: 'File Folder', dateModified: '13/03/2014 1014',
                            open: true,
                            children: [
                                {folder: true,
                                    name: 'jdk1.8.0', size: '', type: 'File Folder', dateModified: '13/03/2014 1014',
                                    children: [
                                        {name: 'java.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'},
                                        {name: 'javac.exe', size: '1 kb', type: 'Application', dateModified: '27/11/2012 04:12'},
                                        {name: 'weblaunch.exe', size: '21 kb', type: 'Application', dateModified: '18/03/2014 00:56'}
                                    ]
                                },
                                {folder: true,
                                    name: 'jre1.8.0_31', size: '', type: 'File Folder', dateModified: '13/03/2014 1014',
                                    children: [
                                        {name: 'java.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'},
                                        {name: 'javac.exe', size: '1 kb', type: 'Application', dateModified: '27/11/2012 04:12'},
                                        {name: 'weblaunch.exe', size: '21 kb', type: 'Application', dateModified: '18/03/2014 00:56'}
                                    ]
                                },
                                {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'},
                                {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'},
                                {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}
                            ]
                        }
                    ]},
                {group: false, name: 'boot.ini', size: '16 kb', type: 'Boot File', dateModified: '27/11/2012 04:12'},
                {group: false, name: 'system.cfg', size: '13 kb', type: 'System File', dateModified: '18/03/2014 00:56'}
            ]
        },
        {
            folder: true,
            name: 'D:',
            children: [
                {name: 'Game of Thrones s05e01.avi', size: '1034 mb', type: 'Movie', dateModified: '13/03/2014 10:14'},
                {name: 'The Knick s01e01', size: '523 mb', type: 'Text Document', dateModified: '27/11/2012 04:12'},
                {name: 'musicbackup1.zip', size: '25 mb', type: 'Compressed Zip File', dateModified: '18/03/2014 00:56'},
                {name: 'musicbackup2.zip', size: '25 mb', type: 'Compressed Zip File', dateModified: '18/03/2014 00:56'}
            ]
        }
    ];

    var columnDefs = [
        {headerName: "Name", field: "name", width: 250,
            cellRenderer:'agGroupCellRenderer',
            cellRendererParams: {
                innerRenderer: innerCellRenderer,
                suppressCount: true
            }
        },
        {headerName: "Size", field: "size", width: 70, cellStyle: sizeCellStyle},
        {headerName: "Type", field: "type", width: 150},
        {headerName: "Date Modified", field: "dateModified", width: 150}
    ];

    var gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData,
        rowSelection: 'multiple',
        enableColResize: true,
        enableSorting: true,
        animateRows: true,
        rowHeight: 20,
        getNodeChildDetails: function(file) {
            if (file.folder) {
                return {
                    group: true,
                    children: file.children,
                    expanded: file.open
                };
            } else {
                return null;
            }
        },
        onRowClicked: rowClicked
    };

    function rowClicked(params) {
        var node = params.node;
        var path = node.data.name;
        while (node.parent) {
            node = node.parent;
            path = node.data.name + '\\' + path;
        }
        document.querySelector('#selectedFile').innerHTML = path;
    }

    function sizeCellStyle() {
        return {'text-align': 'right'};
    }

    function innerCellRenderer(params) {
        var image;
        if (params.node.group) {
            image = params.node.level === 0 ? 'disk' : 'folder';
        } else {
            image = 'file';
        }
        var imageFullUrl = '/example-file-browser/' + image + '.png';
        return '<img src="'+imageFullUrl+'" style="padding-left: 4px;" /> ' + params.data.name;
    }

    // setup the grid after the page has finished loading
    document.addEventListener('DOMContentLoaded', function() {
        var gridDiv = document.querySelector('#exampleFileBrowser');
        new agGrid.Grid(gridDiv, gridOptions);
    });

})();
