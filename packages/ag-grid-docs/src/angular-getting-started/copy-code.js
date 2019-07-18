function copyCode(event) {
  var text = event.target.parentElement.querySelector('code').textContent;
  let tempTextArea = document.createElement('textarea');
  tempTextArea.style.cssText = 'position: absolute; top: -9999px; left: -9999px';
  tempTextArea.textContent = text;
  document.body.appendChild(tempTextArea)
  tempTextArea.select();
  document.execCommand('copy');
  setTimeout(() => {
    tempTextArea.remove();
  }, 0);


  console.log(this)
}



