import { ExcelOOXMLTemplate } from '@ag-grid-community/core';

const watermarkVmlDrawing: ExcelOOXMLTemplate = {
    getTemplate() {
        // TODO - Smarter way to determine the watermark shape
        return {
            name: "xml",
            properties: {
                prefixedAttributes: [{
                    prefix: "xmlns:",
                    map: {
                        v: "urn:schemas-microsoft-com:vml",
                        o: "urn:schemas-microsoft-com:office:office",
                        x: "urn:schemas-microsoft-com:office:excel"
                    },
                }],
            },
            children: [
                {
                    name: "o:shapelayout",
                    properties: {
                        prefixedAttributes: [{
                            prefix: "v",
                            map: {
                                ext: "edit"
                            },
                        }],
                    },
                    children: [
                        {
                            name: "o:idmap",
                            properties: {
                                prefixedAttributes: [{
                                    prefix: "v",
                                    map: {
                                        ext: "edit",
                                        data: "1"
                                    },
                                }],
                            }
                        }
                    ]
                },
                {
                    name: "v:shapetype",
                    properties: {
                        prefixedAttributes: [{
                            prefix: "id",
                            map: {
                                _x0000_t75: ""
                            },
                        }],
                        rawMap: {
                            coordsize: "21600,21600",
                            o: "spt",
                            preferrelative: "t",
                            path: "m@4@5l@4@11@9@11@9@5xe",
                            filled: "f",
                            stroked: "f"
                        }
                    },
                    children: [
                        {
                            name: "v:stroke",
                            properties: {
                                rawMap: {
                                    joinstyle: "miter"
                                }
                            }
                        },
                        {
                            name: "v:formulas",
                            children: [
                                {
                                    name: "v:f",
                                    properties: {
                                        rawMap: {
                                            eqn: "if lineDrawn pixelLineWidth 0"
                                        }
                                    }
                                },
                                {
                                    name: "v:f",
                                    properties: {
                                        rawMap: {
                                            eqn: "sum @0 1 0"
                                        }
                                    }
                                },
                                {
                                    name: "v:f",
                                    properties: {
                                        rawMap: {
                                            eqn: "sum 0 0 @1"
                                        }
                                    }
                                },
                                {
                                    name: "v:f",
                                    properties: {
                                        rawMap: {
                                            eqn: "prod @2 1 2"
                                        }
                                    }
                                },
                                {
                                    name:
                                    "v:f",
                                    properties: {
                                        rawMap: {
                                            eqn: "prod @3 21600 pixelWidth"
                                        }
                                    }
                                },
{
                                    name: "v:f",
                                    properties: {
                                        rawMap: {
                                            eqn: "prod @3 21600 pixelHeight"
                                        }
                                    }
                                },
                                {
                                    name: "v:f",
                                    properties: {
                                        rawMap: {
                                            eqn: "sum @0 0 1"
                                        }
                                    }
                                },
                                {
                                    name: "v:f",
                                    properties: {
                                        rawMap: {
                                            eqn: "prod @6 1 2"
                                        }
                                    }
                                },
                                {
                                    name: "v:f",
                                    properties: {
                                        rawMap: {
                                            eqn: "prod @7 21600 pixelWidth"
                                        }
                                    }
                                },
                                {
                                    name: "v:f",
                                    properties: {
                                        rawMap: {
                                            eqn: "sum @8 21600 0"
                                        }
                                    }
                                },
                                {
                                    name: "v:f",
                                    properties: {
                                        rawMap: {
                                            eqn: "prod @7 21600 pixelHeight"
                                        }
                                    }
                                },
                                {
                                    name: "v:f",
                                    properties: {
                                        rawMap: {
                                            eqn: "sum @10 21600 0"
                                        }
                                    }
                                },
                            ],
                        },
                        {
                            name: "v:path",
                            properties: {
                                rawMap: {
                                    extrusionok: "f",
                                    gradientshapeok: "t",
                                    connecttype: "rect"
                                }
                            }
                        },
                        {
                            name: "o:lock",
                            properties: {
                                prefixedAttributes: [{
                                    prefix: "v",
                                    map: {
                                        ext: "edit",
                                        aspectratio: "t"
                                    },
                                }],
                            }
                        },
                    ],
                }
            ]
        }
    }
};

export default watermarkVmlDrawing;
