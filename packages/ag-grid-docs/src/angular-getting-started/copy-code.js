function copyCode(event) {
  var text = event.target.parentElement.querySelector('code').innerText;
  let tempTextArea = document.createElement('textarea');
  tempTextArea.style.cssText = 'position: absolute; top: -9999px; left: -9999px';
  tempTextArea.innerText = text;
  document.body.appendChild(tempTextArea)
  tempTextArea.select();
  document.execCommand('copy');
  setTimeout(() => {
    tempTextArea.remove();
  }, 0);
}