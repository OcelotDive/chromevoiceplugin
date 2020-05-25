
//let lastScrollPos = 0;
let displayLabels = false;






function displayTranscriptLabel(transcript) {

const tabMain = document.createElement('div');
const transcriptParagraph = document.createElement('p');
const imageContainer = document.createElement('div');
const image = document.createElement('img');
const imagePath = chrome.runtime.getURL('./assets/hearing.png');

image.src = imagePath;

tabMain.classList.add("modeTabMain_tvr");
imageContainer.classList.add('hearingImageContainer_tvr')
image.classList.add('hearingImage_tvr');
transcriptParagraph.classList.add('transcriptParagraph_tvr');

imageContainer.appendChild(image);
transcriptParagraph.innerHTML = transcript;
tabMain.appendChild(transcriptParagraph)
tabMain.appendChild(imageContainer);

const body = document.querySelector("body");
body.append(tabMain);

setTimeout(()=> {
  body.removeChild(tabMain);
}, 3500);

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

// refresh 
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.action === "refresh") {
    window.location.reload();
  }
});

// listen for scroll
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.action === "scroll left") {
    scrollIncrement(-300, 0);
  }
  else if  (request.action === "scroll right") {
    scrollIncrement(300, 0);
  }
  else if (request.action === "scroll down") {
    scrollIncrement(0, 600);
  }
  else if (request.action === "scroll up") {
    scrollIncrement(0, -600);
  }
  else if (request.action === "scroll top") {
    scrollTopBottom(0, 0);
  }
  else if (request.action === "scroll bottom") {
    scrollTopBottom(0,  document.body.scrollHeight);
  }

})

// check for video command
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.warn(request.transcript)
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
   // ytp-ad-overlay-container
  const timeReg = /\b30\b|\b60\b|\b300\b|\b600\b/;   

  if(trimRequest.includes("remove ad")) {
    const ad = document.querySelector(".ytp-ad-overlay-container"), 
    adParent = ad.parentElement;
     if(ad && adParent != "undefined"){
    adParent.removeChild(ad);
     }
  }

  if(trimRequest.includes("skip")) {
    video.currentTime += 60;
  }

  if(trimRequest.includes("restart")) {
    const evt = new KeyboardEvent('keydown', {'keyCode':48, 'which':48});
  document.dispatchEvent (evt);
  }

  if(trimRequest.includes("captions")) {
    const evt = new KeyboardEvent('keydown', {'keyCode':67, 'which':67});
  document.dispatchEvent (evt);
  }

 
  
  if(trimRequest.includes("cinema mode")) {
  const evt = new KeyboardEvent('keydown', {'keyCode':84, 'which':84});
  document.dispatchEvent (evt);

   
  }

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

// receive transcript to display
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.action === "transcript to display") {
    displayTranscriptLabel(request.transcript);
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

function scrollIncrement(x,y) {
  window.scrollBy(x,y);
}

function scrollTopBottom(x,y) {
  window.scrollTo(x,y);
}

function getSearchInput() {
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