var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { _ } from '@ag-grid-community/core';
var getFont = function (props) {
    var _a = __read(props, 4), type = _a[0], typeface = _a[1], script = _a[2], panose = _a[3];
    return {
        name: "a:" + type,
        properties: {
            rawMap: {
                script: script,
                typeface: typeface,
                panose: panose
            }
        }
    };
};
var fontScheme = {
    getTemplate: function () {
        var utf8_encode = _.utf8_encode;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9udFNjaGVtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC90aGVtZXMvb2ZmaWNlL2ZvbnRTY2hlbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBa0MsQ0FBQyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFNUUsSUFBTSxPQUFPLEdBQUcsVUFBQyxLQUF5QztJQUNoRCxJQUFBLEtBQUEsT0FBbUMsS0FBSyxJQUFBLEVBQXZDLElBQUksUUFBQSxFQUFFLFFBQVEsUUFBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLE1BQU0sUUFBUyxDQUFDO0lBQy9DLE9BQU87UUFDSCxJQUFJLEVBQUUsT0FBSyxJQUFNO1FBQ2pCLFVBQVUsRUFBRTtZQUNSLE1BQU0sRUFBRTtnQkFDSixNQUFNLFFBQUE7Z0JBQ04sUUFBUSxVQUFBO2dCQUNSLE1BQU0sUUFBQTthQUNUO1NBQ0o7S0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBRUYsSUFBTSxVQUFVLEdBQXVCO0lBQ25DLFdBQVc7UUFDQyxJQUFBLFdBQVcsR0FBSyxDQUFDLFlBQU4sQ0FBTztRQUMxQixPQUFPO1lBQ0gsSUFBSSxFQUFFLGNBQWM7WUFDcEIsVUFBVSxFQUFFO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixJQUFJLEVBQUUsUUFBUTtpQkFDakI7YUFDSjtZQUNELFFBQVEsRUFBRSxDQUFDO29CQUNQLElBQUksRUFBRSxhQUFhO29CQUNuQixRQUFRLEVBQUU7d0JBQ04sT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsc0JBQXNCLENBQUMsQ0FBQzt3QkFDdEUsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO3dCQUNuQixPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7d0JBQ25CLE9B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