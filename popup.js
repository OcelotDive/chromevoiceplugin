

document.addEventListener('DOMContentLoaded', function() {
  const menuUrl = "chrome-extension://nfekfdojamhbooimjaeaplgokmfdjagg/menu.html";

  chrome.tabs.query({"active": true},tabs => {
    let x = tabs.filter(element => element.url === menuUrl);
    if( x.length === 0) {
      chrome.tabs.create({'url': menuUrl});
      window.close();
    }
    else {
      window.close();
    } 
  })
  }, false);

    