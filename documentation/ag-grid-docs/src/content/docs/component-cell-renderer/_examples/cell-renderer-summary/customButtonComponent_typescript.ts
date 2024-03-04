export class CustomButtonComponent {
    eGui!: HTMLDivElement
    eButton: any
    eventListener!: () => void
  
    init() {
      this.eGui = document.createElement("div")
      let eButton = document.createElement("button")
      eButton.className = "btn-simple"
      eButton.innerText = "Launch!"
      this.eventListener = () => alert("Mission Launched")
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