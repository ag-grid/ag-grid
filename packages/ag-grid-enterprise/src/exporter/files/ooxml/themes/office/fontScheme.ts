import {ExcelOOXMLTemplate, XmlElement} from 'ag-grid-community';

const getFont = (props: [string, string, string?, string?]): XmlElement => {
    const [type, typeface, script, panose] = props;
    return {
        name: `a:${type}`,
        properties: {
            rawMap: {
                script,
                typeface,
                panose
            }
        }
    };
};

const fontScheme: ExcelOOXMLTemplate = {
    getTemplate() {

        return {
            name: "a:fontScheme",
            properties: {
                rawMap: {
                    name: "Office"
                }
            },
            children: [{
                name: 'a:majorFont',
                children: [
                    getFont(['latin', 'Calibri Light', undefined, '020F0302020204030204']),
                    getFont(['ea', '']),
                    getFont(['cs', '']),
                    getFont(['font', '游ゴシック Light', 'Jpan']),
                    getFont(['font', '맑은 고딕', 'Hang']),
                    getFont(['font', '等线 Light', 'Hans']),
                    getFont(['font', '新細明體', 'Hant']),
                    getFont(['font', 'Times New Roman', 'Arab']),
                    getFont(['font', 'Times New Roman', 'Hebr']),
                    getFont(['font', 'Tahoma', 'Thai']),
                    getFont(['font', 'Nyala', 'Ethi']),
                    getFont(['font', 'Vrinda', 'Beng']),
                    getFont(['font', 'Shruti', 'Gujr']),
                    getFont(['font', 'MoolBoran', 'Khmr']),
                    getFont(['font', 'Tunga', 'Knda']),
                    getFont(['font', 'Raavi', 'Guru']),
                    getFont(['font', 'Euphemia', 'Cans']),
                    getFont(['font', 'Plantagenet Cherokee', 'Cher']),
                    getFont(['font', 'Microsoft Yi Baiti', 'Yiii']),
                    getFont(['font', 'Microsoft Himalaya', 'Tibt']),
                    getFont(['font', 'MV Boli', 'Thaa']),
                    getFont(['font', 'Mangal', 'Deva']),
                    getFont(['font', 'Gautami', 'Telu']),
                    getFont(['font', 'Latha', 'Taml']),
                    getFont(['font', 'Estrangelo Edessa', 'Syrc']),
                    getFont(['font', 'Kalinga', 'Orya']),
                    getFont(['font', 'Kartika', 'Mlym']),
                    getFont(['font', 'DokChampa', 'Laoo']),
                    getFont(['font', 'Iskoola Pota', 'Sinh']),
                    getFont(['font', 'Mongolian Baiti', 'Mong']),
                    getFont(['font', 'Times New Roman', 'Viet']),
                    getFont(['font', 'Microsoft Uighur', 'Uigh']),
                    getFont(['font', 'Sylfaen', 'Geor']),
                    getFont(['font', 'Arial', 'Armn']),
                    getFont(['font', 'Leelawadee UI', 'Bugi']),
                    getFont(['font', 'Microsoft JhengHei', 'Bopo']),
                    getFont(['font', 'Javanese Text', 'Java']),
                    getFont(['font', 'Segoe UI', 'Lisu']),
                    getFont(['font', 'Myanmar Text', 'Mymr']),
                    getFont(['font', 'Ebrima', 'Nkoo']),
                    getFont(['font', 'Nirmala UI', 'Olck']),
                    getFont(['font', 'Ebrima', 'Osma']),
                    getFont(['font', 'Phagspa', 'Phag']),
                    getFont(['font', 'Estrangelo Edessa', 'Syrn']),
                    getFont(['font', 'Estrangelo Edessa', 'Syrj']),
                    getFont(['font', 'Estrangelo Edessa', 'Syre']),
                    getFont(['font', 'Nirmala UI', 'Sora']),
                    getFont(['font', 'Microsoft Tai Le', 'Tale']),
                    getFont(['font', 'Microsoft New Tai Lue', 'Talu']),
                    getFont(['font', 'Ebrima', 'Tfng'])
                ]
            },{
                name: 'a:minorFont',
                children: [
                    getFont(['latin', 'Calibri', undefined, '020F0502020204030204']),
                    getFont(['ea', '']),
                    getFont(['cs', '']),
                    getFont(['font', '游ゴシック', 'Jpan']),
                    getFont(['font', '맑은 고딕', 'Hang']),
                    getFont(['font', '等线', 'Hans']),
                    getFont(['font', '新細明體', 'Hant']),
                    getFont(['font', 'Arial', 'Arab']),
                    getFont(['font', 'Arial', 'Hebr']),
                    getFont(['font', 'Tahoma', 'Thai']),
                    getFont(['font', 'Nyala', 'Ethi']),
                    getFont(['font', 'Vrinda', 'Beng']),
                    getFont(['font', 'Shruti', 'Gujr']),
                    getFont(['font', 'DaunPenh', 'Khmr']),
                    getFont(['font', 'Tunga', 'Knda']),
                    getFont(['font', 'Raavi', 'Guru']),
                    getFont(['font', 'Euphemia', 'Cans']),
                    getFont(['font', 'Plantagenet Cherokee', 'Cher']),
                    getFont(['font', 'Microsoft Yi Baiti', 'Yiii']),
                    getFont(['font', 'Microsoft Himalaya', 'Tibt']),
                    getFont(['font', 'MV Boli', 'Thaa']),
                    getFont(['font', 'Mangal', 'Deva']),
                    getFont(['font', 'Gautami', 'Telu']),
                    getFont(['font', 'Latha', 'Taml']),
                    getFont(['font', 'Estrangelo Edessa', 'Syrc']),
                    getFont(['font', 'Kalinga', 'Orya']),
                    getFont(['font', 'Kartika', 'Mlym']),
                    getFont(['font', 'DokChampa', 'Laoo']),
                    getFont(['font', 'Iskoola Pota', 'Sinh']),
                    getFont(['font', 'Mongolian Baiti', 'Mong']),
                    getFont(['font', 'Arial', 'Viet']),
                    getFont(['font', 'Microsoft Uighur', 'Uigh']),
                    getFont(['font', 'Sylfaen', 'Geor']),
                    getFont(['font', 'Arial', 'Armn']),
                    getFont(['font', 'Leelawadee UI', 'Bugi']),
                    getFont(['font', 'Microsoft JhengHei', 'Bopo']),
                    getFont(['font', 'Javanese Text', 'Java']),
                    getFont(['font', 'Segoe UI', 'Lisu']),
                    getFont(['font', 'Myanmar Text', 'Mymr']),
                    getFont(['font', 'Ebrima', 'Nkoo']),
                    getFont(['font', 'Nirmala UI', 'Olck']),
                    getFont(['font', 'Ebrima', 'Osma']),
                    getFont(['font', 'Phagspa', 'Phag']),
                    getFont(['font', 'Estrangelo Edessa', 'Syrn']),
                    getFont(['font', 'Estrangelo Edessa', 'Syrj']),
                    getFont(['font', 'Estrangelo Edessa', 'Syre']),
                    getFont(['font', 'Nirmala UI', 'Sora']),
                    getFont(['font', 'Microsoft Tai Le', 'Tale']),
                    getFont(['font', 'Microsoft New Tai Lue', 'Talu']),
                    getFont(['font', 'Ebrima', 'Tfng'])
                ]
            }]
        };
    }
};

export default fontScheme;