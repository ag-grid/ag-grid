(function() {
  function getButtonHtml(icon, text) {
    return '<span class="copy-code-button__text">' + text + '</span><i class="' + icon + '"></i>';
  }

  function resetButton(button) {
    button.innerHTML = getButtonHtml('far fa-copy', 'Copy code');
    button.className = 'btn copy-code-button';
  }

  function copyCode() {
    var button = document.activeElement;
    button.innerHTML = getButtonHtml('fa fa-check', 'Copied!');
    button.classList.add('copy-code-button--success');

    setTimeout(function() {
      resetButton(button);
    }, 3000);

    // Copy to Clipboard
    try {
      var text = button.parentElement.querySelector('code').textContent;
      var tempTextArea = document.createElement('textarea');
      tempTextArea.style.cssText = 'position: absolute; top: -9999px; left: -9999px';
      tempTextArea.textContent = text;
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand('copy');

      setTimeout(function() {
        tempTextArea.remove();
      }, 0);
    } catch (err) {
      console.error(err);
    }
  }

  var snippets = document.getElementsByTagName('snippet');

  for (var i = 0; i < snippets.length; i++) {
    var snippet = snippets[i];
    var button = document.createElement('button');

    resetButton(button);

    button.onclick = copyCode;

    var wrapper = document.createElement('div');
    wrapper.style.setProperty('position', 'relative');

    snippet.parentNode.insertBefore(wrapper, snippet);

    wrapper.appendChild(button);
    wrapper.appendChild(snippet);
  }
})();
