let micIsListening = false;
const menuUrl = "chrome-extension://cjbcmhbgienoafecphjcfgopachopbna/menu.html";

chrome.browserAction.onClicked.addListener(function(activeTab) { 
    chrome.tabs.create({'url': chrome.extension.getURL('menu.html')}, function(tab) { }); });






/*chrome.runtime.onMessage.addListener( function(request,sender,sendResponse)
{
   
    

})
*/

