import {ExcelOOXMLTemplate} from 'ag-grid-community';

const stylesheetFactory: ExcelOOXMLTemplate = {
    getTemplate() {

        return {
            name: 'styleSheet',
            properties: {
                rawMap: {
                    xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
                }
            },
            children: [{
                name: 'fonts',
                properties: {
                    rawMap: {
                        count: 1
                    }
                },
                children: [{
                    name: 'font',
                    children: [{
                        name: 'sz',
                        properties: {
                            rawMap: {
                                val: '12'
                            }
                        }
                    },{
                        name: 'color',
                        properties: {
                            rawMap: {
                                theme: '1'
                            }
                        }
                    },{
                        name: 'name',
                        properties: {
                            rawMap: {
                                val: 'Calibri'
                            }
                        }
                    },{
                        name: 'family',
                        properties: {
                            rawMap: {
                                val: '2'
                            }
                        }
                    },{
                        name: 'scheme',
                        properties: {
                            rawMap: {
                                val: 'minor'
                            }
                        }
                    }]
                }]
            },{
                name: 'fills',
                properties: {
                    rawMap: {
                        count: 2
                    }
                },
                children: [{
                    name: 'fill',
                    children: [{
                        name: 'patternFill',
                        properties: {
                            rawMap: {
                                patternType: 'none'
                            }
                        }
                    }]
                },{
                    name: 'fill',
                    children: [{
                        name: 'patternFill',
                        properties: {
                            rawMap: {
                                patternType: 'gray125'
                            }
                        }
                    }]
                }]
            },{
                name: 'borders',
                properties: {
                    rawMap: {
                        count: 1
                    }
                },
                children: [{
                    name: 'border',
                    children: [{
                        name: 'left'
                    },{
                        name: 'right'
                    },{
                        name: 'top'
                    },{
                        name: 'bottom'
                    },{
                        name: 'diagonal'
                    }]
                }]
            },{
                name: 'cellStyleXfs',
                properties: {
                    rawMap: {
                        count: 1
                    }
                },
                children: [{
                    name: 'xf',
                    properties: {
                        rawMap: {
                            borderId: 0,
                            fillId: 0,
                            fontId: 0,
                            numFmtId: 0
                        }
                    }
                }]
            },{
                name: 'cellXfs',
                properties: {
                    rawMap: {
                        count: 1
                    }
                },
                children: [{
                    name: 'xf',
                    properties: {
                        rawMap: {
                            borderId: 0,
                            fillId: 0,
                            fontId: 0,
                            numFmtId: 0,
                            xfId: 0
                        }
                    }
                }]
            },{
                name: 'cellStyles',
                properties: {
                    rawMap: {
                        count: 1
                    }
                },
                children: [{
                    name: 'cellStyle',
                    properties: {
                        rawMap: {
                            builtinId: 0,
                            name: 'Normal',
                            xfId: 0
                        }
                    }
                }]
            }]
        };
    }
};

export default stylesheetFactory;