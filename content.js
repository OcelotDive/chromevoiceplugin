
//let lastScrollPos = 0;
let displayLabels = false;

function displayModeLabel(mode) {
const tabMain = document.createElement('div')
tabMain.classList.add("modeTabMain_tvr");
tabMain.innerHTML = mode;
const body = document.querySelector("body");
body.append(tabMain);
}

//repeat listen on scroll
 

//listen for elements
chrome.runtime.onMessage.addListener((request,sender,sendResponse) => { 
 if (request.action === 'select') { 
   addElementLabelsToPage();
  sendResponse('elementsAdded');
  listenForScrollWhenLabelsOn();
 }
  });

// listen for exit elements
chrome.runtime.onMessage.addListener((request,sender,sendResponse) => {
  if(request.action === 'exit elements') {
   removeElementLabelsFromPage();
    sendResponse("exit elements");
  }
});
// listen for exit search
chrome.runtime.onMessage.addListener((request,sender,sendResponse) => {
  if(request.action === 'exit search') {
   clearSearch();
    sendResponse("exit search");
  }
});

// listen for number
chrome.runtime.onMessage.addListener((request,sender,sendResponse) => {
   //last change
  if(request.action === 'number') {
   listenForNumber(request.spokenNumber);
  } 
    
});

function clearSearch() {
  
  const input = document.querySelector("form input[type='text'");
    input.value = '';
    input.classList.remove("highlightedOnSearchRequest_tvr");
    
}

// listener for search command
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  if(request.action === "search") {
    const input = document.querySelector("form input[type='text'");
    input.value = '';
    input.classList.add("highlightedOnSearchRequest_tvr");
  sendResponse({action: "search mode"});
  getSearchInput();
  }
  
});

// listen for scroll

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.action === "scroll left") {
    scroll(-300, 0);
  }
  else if  (request.action === "scroll right") {
    scroll(300, 0);
  }
  else if (request.action === "scroll down") {
    scroll(0, 600);
  }
  else if (request.action === "scroll up") {
    scroll(0, -600);
  }

})


//video mode
/*chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.warn(request)
  if(request.action === "video mode") {
    displayModeLabel("Video Mode");
     let video = document.querySelector('video');
     
       if(video !== undefined) {
      sendResponse({action: "video mode active"});
       }
       else {
         sendResponse({action: "no video"})
       } 
  }
});*/
// if video mode on
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.action === "check if video command") {
  let trimRequest = request.transcript.split(" ").map(e => e.trim()).filter(e => e !== "").join(" ")
   .replace(/one/, "60")
   .replace(/five/, "300")
   .replace(/ten/, "600")
   .replace(/thirty/, "30")
   .replace(/1/, "60")
   .replace(/5/, "300")
   .replace(/10/, "600");
console.log(trimRequest)
  
 let  video = document.querySelector("video");
 
   // https://www.youtube.com/embed/1GPYnoG_nkE?feature=oembed
   // https://www.youtube.com/watch?v=1GPYnoG_nkE&feature=emb_title
  const timeReg = /\b30\b|\b60\b|\b300\b|\b600\b/;   
  
  if(trimRequest.includes("pause")) {
    video.pause();
  }

  else if(trimRequest.includes("mute")) {
   
      video.muted = true;
    
   
  }

  else if(trimRequest.trim().includes("sound")) {
    let currentVol = video.volume;
    
    video.muted = false;
   
    
  }

  else if(trimRequest.includes("volume up")) {
    
   video.volume >= 0.75 ? video.volume = 1 : video.volume += 0.25;
  }

  else if(trimRequest.includes("volume down")) {
    console.log(request.action)
    video.volume <= 0.25 ? video.volume = 0 : video.volume -= 0.25;
  }

  else if(trimRequest.includes("play")) {
    console.log(request.action)
    if(video === undefined || video === null) {
      testForIframesInsteadOfVideo()
    }
    else {
    video.play();
    }
  }
  
  else if(trimRequest.includes("forward")) {
    if(timeReg.test(trimRequest)) {
  let timeMatch = trimRequest.match(timeReg);
    video.currentTime += parseInt(timeMatch[0]);
    }
  }

  else if(trimRequest.includes("rewind")) {
     if(timeReg.test(trimRequest)) {
   let timeMatch = trimRequest.match(timeReg);
     video.currentTime -= parseInt(timeMatch[0]);
     }
   }
  }
});



// functions

function testForIframesInsteadOfVideo() {
  let iframes = Array.from(document.querySelectorAll("iframe"));
     if(iframes.length > 0) {
       iframes.forEach(iframe => {
         console.log(iframe)
         if(iframe.src.includes('youtube.com')) {
        let newSrc = iframe.src.substring(0, iframe.src.indexOf('?')).replace('embed/', 'watch?v=');
        console.log("newSrc", newSrc)
       window.open(newSrc, '_blank');
         }
       })
     }
   }

function scroll(x,y) {
  window.scrollBy(x,y);
}

function getSearchInput() {
displayModeLabel("Search Mode");
  const input = document.querySelector("form input[type='text'");
  const form = document.querySelector("form");
  console.warn(input);
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  if(request.action === "query") {
    input.value = request.searchQuery;
    form.submit();
    input.value = '';
    input.classList.remove("highlightedOnSearchRequest_tvr");

  }
  sendResponse("query received");
});
}


function listenForNumber(spokenNumber) {
  let numberLabels = Array.from(document.querySelectorAll('.numberLabel_tvr'));
  numberLabels.map((element, index) => {
    index === spokenNumber && element.parentNode.click();
  })
}

function addElementLabelsToPage(displayModeBool) {
  if(displayModeBool !== false) {
  displayModeLabel("Elements Mode");
  }
  displayLabels = true;
  let elementsList = Array.from(document.querySelectorAll("a, input, .tab-content"));

    elementsList.map((item, index, array) => {
      let numberLabel = document.createElement("label");
      numberLabel.className += "numberLabel_tvr animated infinite pulse";
      numberLabel.innerHTML = index.toString();
      item.prepend(numberLabel);    
  })
}

function listenForScrollWhenLabelsOn() {
  window.addEventListener('scroll', function(e) {
   // lastScrollPos = window.scrollY;
      if(displayLabels) {
      window.requestAnimationFrame(function() {
         removeElementLabelsFromPage();
         addElementLabelsToPage(false);
      });
    }
    else {
      removeElementLabelsFromPage();
    }
  });
  }

function removeElementLabelsFromPage() {
  displayLabels = false;
  let numberLabels = Array.from(document.querySelectorAll('.numberLabel_tvr'));
    numberLabels.forEach(element => {
      element.parentNode.removeChild(element);
    });
}