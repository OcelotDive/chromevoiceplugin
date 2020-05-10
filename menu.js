
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.start();

let tabsIds = [];
let elementsDisplayed = false;
let searchModeActivated = false;

   recognition.addEventListener('result', event => {
    let finalTranscript = '';
     for (let i = event.resultIndex; i < event.results.length; ++i) {
       if (event.results[i].isFinal) {
         finalTranscript = event.results[i][0].transcript.toLowerCase();
       }
     }
    console.log(finalTranscript);
    
     if(finalTranscript.includes("new tab") || finalTranscript.includes("open tab") || finalTranscript.includes("open tap")) { 
      chrome.tabs.create({url: "https://google.com", active: true});
      

     }

     else if (finalTranscript.includes("close tab") || finalTranscript.includes("exit tab")) {
      chrome.tabs.getAllInWindow(tabs => {
        chrome.tabs.remove(tabs[tabs.length - 1].id)
      });
     } 
     else if (finalTranscript.includes("elements")) {
      sendSelectElementMessageToContent();
      elementsDisplayed = true;  
     }

     else if (finalTranscript.includes("clear")) {
      sendExitElementMessageToContent();
      elementsDisplayed = false;
     }

     else if (finalTranscript.includes("search")) {
       sendSearchMessageToContent();
      
     }

     else if (searchModeActivated && finalTranscript) {
      sendSearchQueryToContent(finalTranscript);
     }
     
     else if (elementsDisplayed && !finalTranscript.includes("scroll down")
     && !finalTranscript.includes("scroll up")  
     && (typeof parseInt(finalTranscript) === 'number')) {
 
       sendNumberMessageToContent(parseInt(finalTranscript))
     }

     else if (finalTranscript.includes("scroll down")) {
       sendScrollDownMessageToContent();
     }

     else if (finalTranscript.includes("scroll up")) {
      sendScrollUpMessageToContent();
    }
   });
 
 recognition.addEventListener('end', recognition.start);

 listenForChangeAfterSelectCommand();

 // functions start

 function sendScrollUpMessageToContent() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[tabs.length - 1].id,{action: "scroll up"}, (response) => {
      console.log(response);
      });     
 });
 }
 function sendScrollDownMessageToContent() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[tabs.length - 1].id,{action: "scroll down"}, (response) => {
      console.log(response);
      });     
 });
 }

 function sendNumberMessageToContent(spokenNumber) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[tabs.length - 1].id,{action: "number", spokenNumber: spokenNumber}, (response) => {
      console.log(response);
      });     
 });
 }


 function sendSearchMessageToContent() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      chrome.tabs.sendMessage(tabs[tabs.length - 1].id,{action: "search"}, (response) => {
          searchModeActivated = true;
       console.log(response);
      
    });
});
 }

 function sendSearchQueryToContent(query) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[tabs.length - 1].id,{action: "query", searchQuery: query}, (response) => {
      if(response) {
        searchModeActivated = false;
      }
      console.log(response)
    });
  });
 }

 function sendExitElementMessageToContent() {
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    if(tabsIds.includes(tabs[tabs.length-1].id)) {
      chrome.tabs.sendMessage(tabs[tabs.length - 1].id,{action: "exit select"}, (response) => {
  
      tabsIds = tabsIds.filter(element => element != tabs[tabs.length-1].id);
      console.log(response)
      });
    }
  });
}


  function sendSelectElementMessageToContent() {
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      
      if(tabsIds.includes(tabs[tabs.length-1].id)) {
        return
      }
      else {
        tabsIds.push(tabs[tabs.length -1].id);
        chrome.tabs.sendMessage(tabs[tabs.length - 1].id,{action: "select"}, (response) => {
          console.log(response)
        
        });  
      }
    });
  }

  function listenForChangeAfterSelectCommand() {
    
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      if(tabsIds.includes(tabs[tabs.length-1].id)) {
        chrome.tabs.sendMessage(tabs[tabs.length - 1].id,{action: "exit select"}, (response) => {
        tabsIds = tabsIds.filter(element => element != tabs[tabs.length-1].id);
        console.log(response)
        });
      }
        });
})
  }