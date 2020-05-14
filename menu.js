
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.start();

let tabsIds = [];
let elementsDisplayed = false;
let searchModeActivated = false;
let videoModeActivated = false;
let menuId;

function setMenuId() {
chrome.tabs.getAllInWindow(tabs => {
  tabs.map(tab => {
    if(tab.title === "Voice for Youtube") {
      menuId = tab.id;
    } 
  })
});
}
setMenuId();
   recognition.addEventListener('result', event => {
    let finalTranscript = '';
    let lastWord = '';
     for (let i = event.resultIndex; i < event.results.length; ++i) {
       if (event.results[i].isFinal) {
         finalTranscript = event.results[i][0].transcript.toLowerCase();
         lastWord = finalTranscript.split(" ");
         lastWord = lastWord[lastWord.length - 1];
         
       }
     }
    console.log(finalTranscript);
    
     if(finalTranscript.includes("new tab") || finalTranscript.includes("open tab") || finalTranscript.includes("open tap")) { 
      chrome.tabs.create({url: "https://google.com", active: true});
     }

     else if (finalTranscript.includes("menu")) {
      chrome.tabs.update(menuId, {"active": true}, (tab) => { });
     }

     else if (!elementsDisplayed && finalTranscript.includes("go to tab")) {
      
      chrome.tabs.getAllInWindow(tabs => {
        chrome.tabs.update(tabs[parseInt(lastWord) - 1].id, {"active": true}, (tab) => { });
       
    });
     } 

     else if (finalTranscript.includes("close tab") || finalTranscript.includes("exit tab")) {
      chrome.tabs.getAllInWindow(tabs => {
        chrome.tabs.remove(tabs[tabs.length - 1].id)
      });
     } 

     else if (finalTranscript.includes("remove all left")) {
      removeTabsEitherSide(lastWord);
    }

    else if (finalTranscript.includes("remove all right")) {
      removeTabsEitherSide(lastWord);
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
     && !finalTranscript.includes("scroll left")
     && !finalTranscript.includes("scroll right")
     && (typeof parseInt(finalTranscript) === 'number')) {
 
       sendNumberMessageToContent(parseInt(finalTranscript))
     }

     else if (finalTranscript.includes("scroll down")) {
       sendScrollDownMessageToContent();
     }

     else if (finalTranscript.includes("scroll up")) {
      sendScrollUpMessageToContent();
    }

    else if (finalTranscript.includes("scroll right")) {
      sendScrollRightMessageToContent();
    }

    else if (finalTranscript.includes("scroll left")) {
      sendScrollLeftMessageToContent();
    }

    else if (finalTranscript.includes("video")) {
      if(!searchModeActivated) {
      sendVideoMessageToContent();
      }
    }
    else if(videoModeActivated) {
      
        sendVideoCommandToContent(finalTranscript)
      
    }
   });
 
 recognition.addEventListener('end', recognition.start);

 listenForChangeAfterSelectCommand();

 // functions start


 function removeTabsEitherSide(direction) {
  let pivot;
 chrome.tabs.getAllInWindow(tabs => {
  tabs.map((tab, index) => {
   if (tab.id === menuId) {
     pivot = index;
   }
   })
   switch(direction) {
     case "left":
   tabs.map((tab, index) => {
     index < pivot && chrome.tabs.remove(tab.id);
   })
      break;
    case "right":
     tabs.map((tab, index) => {
       index > pivot && chrome.tabs.remove(tab.id);
     })
     break;
     default :
     return;
     break;
   }
 });

}

 function sendVideoMessageToContent() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[tabs.length - 1].id,{action: "video mode"}, (response) => {
      console.warn("this is the response", response)
      if(response.action === "video mode active") {
        videoModeActivated = true;
      }
      else {
        videoModeActivated = false;
      }
      });     
 });
 }

 function sendVideoCommandToContent(lastWord) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[tabs.length - 1].id,{action: lastWord}, (response) => {
      
      });     
 });
 }

 function sendScrollLeftMessageToContent() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[tabs.length - 1].id,{action: "scroll left"}, (response) => {
      console.log(response);
      });     
 });
 }

 function sendScrollRightMessageToContent() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[tabs.length - 1].id,{action: "scroll right"}, (response) => {
      console.log(response);
      });     
 });
 }

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
        elementsDisplayed = false;
        });
      }
        });
})
  }