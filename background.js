//let micIsListening = false;
//const menuUrl = "chrome-extension://cjbcmhbgienoafecphjcfgopachopbna/menu.html";
//const menuUrl = "chrome-extension://flnndacekkegfkffgibgmlkdpfgcdgnl";

chrome.browserAction.onClicked.addListener(function (activeTab) {
  chrome.tabs.create({ url: chrome.extension.getURL("menu.html") }, function (
    tab
  ) {});
  document.cookie =
    "VISITOR_INFO1_LIVE=oKckVSqvaGw; path=/; domain=.youtube.com";
  window.location.reload();
});

/*chrome.runtime.onMessage.addListener( function(request,sender,sendResponse)
{
   
    

})
*/
