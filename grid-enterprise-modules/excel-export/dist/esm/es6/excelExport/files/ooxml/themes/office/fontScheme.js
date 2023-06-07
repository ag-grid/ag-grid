import { _ } from '@ag-grid-community/core';
const getFont = (props) => {
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
const fontScheme = {
    getTemplate() {
        const { utf8_encode } = _;
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
                        getFont(['font', utf8_encode('游ゴシック Light'), 'Jpan']),
                        getFont(['font', utf8_encode('맑은 고딕'), 'Hang']),
                        getFont(['font', utf8_encode('等线 Light'), 'Hans']),
                        getFont(['font', utf8_encode('新細明體'), 'Hant']),
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
                }, {
                    name: 'a:minorFont',
                    children: [
                        getFont(['latin', 'Calibri', undefined, '020F0502020204030204']),
                        getFont(['ea', '']),
                        getFont(['cs', '']),
                        getFont(['font', utf8_encode('游ゴシック'), 'Jpan']),
                        getFont(['font', utf8_encode('맑은 고딕'), 'Hang']),
                        getFont(['font', utf8_encode('等线'), 'Hans']),
                        getFont(['font', utf8_encode('新細明體'), 'Hant']),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9udFNjaGVtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC90aGVtZXMvb2ZmaWNlL2ZvbnRTY2hlbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFrQyxDQUFDLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUU1RSxNQUFNLE9BQU8sR0FBRyxDQUFDLEtBQXlDLEVBQWMsRUFBRTtJQUN0RSxNQUFNLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQy9DLE9BQU87UUFDSCxJQUFJLEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDakIsVUFBVSxFQUFFO1lBQ1IsTUFBTSxFQUFFO2dCQUNKLE1BQU07Z0JBQ04sUUFBUTtnQkFDUixNQUFNO2FBQ1Q7U0FDSjtLQUNKLENBQUM7QUFDTixDQUFDLENBQUM7QUFFRixNQUFNLFVBQVUsR0FBdUI7SUFDbkMsV0FBVztRQUNQLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILElBQUksRUFBRSxjQUFjO1lBQ3BCLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ0osSUFBSSxFQUFFLFFBQVE7aUJBQ2pCO2FBQ0o7WUFDRCxRQUFRLEVBQUUsQ0FBQztvQkFDUCxJQUFJLEVBQUUsYUFBYTtvQkFDbkIsUUFBUSxFQUFFO3dCQUNOLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLHNCQUFzQixDQUFDLENBQUM7d0JBQ3RFLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQzt3QkFDbkIsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO3dCQUNuQixPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLGFBQWEs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