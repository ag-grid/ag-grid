var Downloader = /** @class */ (function () {
    function Downloader() {
    }
    Downloader.download = function (fileName, content) {
        var win = document.defaultView || window;
        if (!win) {
            console.warn('AG Grid: There is no `window` associated with the current `document`');
            return;
        }
        var element = document.createElement('a');
        // @ts-ignore
        var url = win.URL.createObjectURL(content);
        element.setAttribute('href', url);
        element.setAttribute('download', fileName);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.dispatchEvent(new MouseEvent('click', {
            bubbles: false,
            cancelable: true,
            view: win
        }));
        document.body.removeChild(element);
        win.setTimeout(function () {
            // @ts-ignore
            win.URL.revokeObjectURL(url);
        }, 0);
    };
    return Downloader;
}());
export { Downloader };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jc3ZFeHBvcnQvZG93bmxvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtJQUFBO0lBOEJBLENBQUM7SUE3QmlCLG1CQUFRLEdBQXRCLFVBQXVCLFFBQWdCLEVBQUUsT0FBYTtRQUNsRCxJQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQztRQUUzQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ04sT0FBTyxDQUFDLElBQUksQ0FBQyxzRUFBc0UsQ0FBQyxDQUFDO1lBQ3JGLE9BQU87U0FDVjtRQUVELElBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUMsYUFBYTtRQUNiLElBQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdDLE9BQU8sQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzNDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUMvQixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVuQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRTtZQUMxQyxPQUFPLEVBQUUsS0FBSztZQUNkLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLElBQUksRUFBRSxHQUFHO1NBQ1osQ0FBQyxDQUFDLENBQUM7UUFFSixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVuQyxHQUFHLENBQUMsVUFBVSxDQUFDO1lBQ1gsYUFBYTtZQUNiLEdBQUcsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNWLENBQUM7SUFDTCxpQkFBQztBQUFELENBQUMsQUE5QkQsSUE4QkMifQ==