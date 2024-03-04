class CustomButtonComponent {
    eGui
    eButton
    eventListener
  
    init(params) {
      this.eGui = document.createElement("div")
      let eButton = document.createElement("button")
      eButton.className = "btn-simple"
      eButton.innerText = "Launch!"
      this.eventListener = params.onClick;
      eButton.addEventListener("click", this.eventListener)
      this.eGui.appendChild(eButton)
    }
  
    getGui() {
      return this.eGui
    }
  
    refresh() {
      return true
    }
  
    destroy() {
      if (this.eButton) {
        this.eButton.removeEventListener("click", this.eventListener)
      }
    }
  }