
//let lastScrollPos = 0;
let displayLabels = false;





//repeat listen on scroll
 

//listen for elements
chrome.runtime.onMessage.addListener((request,sender,sendResponse) => { 
  request.action === 'select' && addElementLabelsToPage();
  sendResponse('elementsAdded');
  listenForScrollWhenLabelsOn();
  });

// listen for exit select
chrome.runtime.onMessage.addListener((request,sender,sendResponse) => {
  request.action === 'exit select' && removeElementLabelsFromPage();
    sendResponse("exit elements");
});

// listen for number
chrome.runtime.onMessage.addListener((request,sender,sendResponse) => {
   //last change
  request.action === 'number' && listenForNumber(request.spokenNumber);
    
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
  if(request.action === "scroll down") {
    scroll(0, 600);
  }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.action === "scroll up") {
    scroll(0, -600);
  }
})


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
    input.classList.revove("highlightedOnSearchRequest");

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
         addElementLabelsToPage()
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