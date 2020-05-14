
//let lastScrollPos = 0;
let displayLabels = false;





//repeat listen on scroll
 

//listen for elements
chrome.runtime.onMessage.addListener((request,sender,sendResponse) => { 
 if (request.action === 'select') { 
   addElementLabelsToPage();
  sendResponse('elementsAdded');
  listenForScrollWhenLabelsOn();
 }
  });

// listen for exit select
chrome.runtime.onMessage.addListener((request,sender,sendResponse) => {
  if(request.action === 'exit select') {
   removeElementLabelsFromPage();
    sendResponse("exit elements");
  }
});

// listen for number
chrome.runtime.onMessage.addListener((request,sender,sendResponse) => {
   //last change
  if(request.action === 'number') {
   listenForNumber(request.spokenNumber);
  } 
    
});

// listener for search command
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  if(request.action === "search") {
    const input = document.querySelector("form input[type='text'");
    input.value = '';
    input.classList.add("highlightedOnSearchRequest");
  sendResponse({action: "search mode"});
  getSearchInput();
  }
  
});

// listen for scroll

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.action === "scroll left") {
    scroll(-300, 0);
  }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.action === "scroll right") {
    scroll(300, 0);
  }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.action === "scroll down") {
    scroll(0, 600);
  }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.action === "scroll up") {
    scroll(0, -600);
  }
})

//video mode
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.warn(request)
  if(request.action === "video mode") {
     let video = document.querySelector('video');
     
       if(video !== undefined) {
      sendResponse({action: "video mode active"});
       }
       else {
         sendResponse({action: "no video"})
       } 
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.warn(request)
  let trimRequest = request.action.split(" ").map(e => e.trim()).filter(e => e !== "").join(" ")
   .replace(/one/, "60")
   .replace(/five/, "300")
   .replace(/ten/, "600")
   .replace(/thirty/, "30")
   .replace(/1/, "60")
   .replace(/5/, "300")
   .replace(/10/, "600");

  const timeReg = /\b30\b|\b60\b|\b300\b|\b600\b/;   
  console.log(trimRequest)
  let video = document.querySelector("video");

  if(trimRequest.includes("pause")) {
    console.log(request.action)
    video.pause();
  }

  else if(trimRequest.includes("play")) {
    console.log(request.action)
    video.play();
  }
  
  else if(trimRequest.includes("forward")) {
 
    if(timeReg.test(trimRequest)) {
  let timeMatch = trimRequest.match(timeReg);
  console.log(timeMatch)
    video.currentTime += parseInt(timeMatch[0]);
    }
  }

  else if(trimRequest.includes("rewind")) {
  
     if(timeReg.test(trimRequest)) {
   let timeMatch = trimRequest.match(timeReg);
   console.log(timeMatch)
     video.currentTime -= parseInt(timeMatch[0]);
     }
   }

});



// functions

function scroll(x,y) {
  window.scrollBy(x,y);
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
    input.classList.remove("highlightedOnSearchRequest");

  }
  sendResponse("query received");
});
}


function listenForNumber(spokenNumber) {
  let numberLabels = Array.from(document.querySelectorAll('.numberLabel'));
  numberLabels.map((element, index) => {
    index === spokenNumber && element.parentNode.click();
  })
}

function addElementLabelsToPage() {
  displayLabels = true;
  let elementsList = Array.from(document.querySelectorAll("a, input, .tab-content"));

    elementsList.map((item, index, array) => {
      let numberLabel = document.createElement("label");
      numberLabel.className += "numberLabel animated infinite pulse";
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
         addElementLabelsToPage();
      });
    }
    else {
      removeElementLabelsFromPage();
    }
  });
  }

function removeElementLabelsFromPage() {
  displayLabels = false;
  let numberLabels = Array.from(document.querySelectorAll('.numberLabel'));
    numberLabels.forEach(element => {
      element.parentNode.removeChild(element);
    });
}