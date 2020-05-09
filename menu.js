
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.start();


let tabsIds = [];
let currentUrl = 'https://google.com/';
let elementsDisplayed = false;
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
      sendSelectElementMessageToContent()
      elementsDisplayed = true;  
     }

     else if (finalTranscript.includes("backtrack")) {
      sendExitElementMessageToContent()
      elementsDisplayed = false;
     }
     
     else if (elementsDisplayed && typeof parseInt(finalTranscript) === 'number') {
 
       sendNumberMessageToContent(parseInt(finalTranscript))
     }
   });
 
 recognition.addEventListener('end', recognition.start);

 listenForChangeAfterSelectCommand();

 // functions start

 function sendNumberMessageToContent(spokenNumber) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[tabs.length - 1].id,{action: "number", spokenNumber: spokenNumber}, (response) => {
      });     
 });
 }

 function sendExitElementMessageToContent() {
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    if(tabsIds.includes(tabs[tabs.length-1].id)) {
      chrome.tabs.sendMessage(tabs[tabs.length - 1].id,{action: "exit select"}, (response) => {
  
      tabsIds = tabsIds.filter(element => element != tabs[tabs.length-1].id);
      });
    }
    //may say something else later
    else {return}
  });
}


  function sendSelectElementMessageToContent() {
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      
      if(tabsIds.includes(tabs[tabs.length-1].id)) {
 
      }
      else {
        tabsIds.push(tabs[tabs.length -1].id);
        chrome.tabs.sendMessage(tabs[tabs.length - 1].id,{action: "select"}, (response) => {
          console.log(response)
        
        });
        
      }
    });
    return;
  }

  function listenForChangeAfterSelectCommand() {
    
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      if(tabsIds.includes(tabs[tabs.length-1].id)) {
        chrome.tabs.sendMessage(tabs[tabs.length - 1].id,{action: "exit select"}, (response) => {
        tabsIds = tabsIds.filter(element => element != tabs[tabs.length-1].id);
        });
      }
        });
      

   

})
  }