function copyCode(event) {
  // changing style of button 
  var button =  document.activeElement;
  button.innerHTML = "Copied!";

  setTimeout(function() {
    button.innerHTML = "Copy Code";
  }, 5000);

  // Copy to Clipboard
  try {
    var text = event.target.parentElement.querySelector('code').textContent;
    var tempTextArea = document.createElement('textarea');
    tempTextArea.style.cssText = 'position: absolute; top: -9999px; left: -9999px';
    tempTextArea.textContent = text;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');

    setTimeout(function() {
      tempTextArea.remove();
    }, 0);
  } catch(err) {
    console.error(err);
  }
}
