export class Downloader {
    static download(fileName, content) {
        const win = document.defaultView || window;
        if (!win) {
            console.warn('AG Grid: There is no `window` associated with the current `document`');
            return;
        }
        const element = document.createElement('a');
        // @ts-ignore
        const url = win.URL.createObjectURL(content);
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
        win.setTimeout(() => {
            // @ts-ignore
            win.URL.revokeObjectURL(url);
        }, 0);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jc3ZFeHBvcnQvZG93bmxvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLE9BQU8sVUFBVTtJQUNaLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBZ0IsRUFBRSxPQUFhO1FBQ2xELE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDO1FBRTNDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDTixPQUFPLENBQUMsSUFBSSxDQUFDLHNFQUFzRSxDQUFDLENBQUM7WUFDckYsT0FBTztTQUNWO1FBRUQsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QyxhQUFhO1FBQ2IsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0MsT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEMsT0FBTyxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDM0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQy9CLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRW5DLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFO1lBQzFDLE9BQU8sRUFBRSxLQUFLO1lBQ2QsVUFBVSxFQUFFLElBQUk7WUFDaEIsSUFBSSxFQUFFLEdBQUc7U0FDWixDQUFDLENBQUMsQ0FBQztRQUVKLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRW5DLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ2hCLGFBQWE7WUFDYixHQUFHLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDVixDQUFDO0NBQ0oifQ==