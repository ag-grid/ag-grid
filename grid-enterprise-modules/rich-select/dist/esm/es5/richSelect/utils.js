/**
 * cell renderers are used in a few places. they bind to dom slightly differently to other cell renderes as they
 * can return back strings (instead of html elemnt) in the getGui() method. common code placed here to handle that.
 * @param {AgPromise<ICellRendererComp>} cellRendererPromise
 * @param {HTMLElement} eTarget
 */
export function bindCellRendererToHtmlElement(cellRendererPromise, eTarget) {
    cellRendererPromise.then(function (cellRenderer) {
        var gui = cellRenderer.getGui();
        if (gui != null) {
            if (typeof gui === 'object') {
                eTarget.appendChild(gui);
            }
            else {
                eTarget.innerHTML = gui;
            }
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcmljaFNlbGVjdC91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQTs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSw2QkFBNkIsQ0FBQyxtQkFBaUQsRUFBRSxPQUFvQjtJQUNqSCxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsVUFBQSxZQUFZO1FBQ2pDLElBQU0sR0FBRyxHQUF5QixZQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFekQsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO1lBQ2IsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7Z0JBQ3pCLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDNUI7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7YUFDM0I7U0FDSjtJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyJ9