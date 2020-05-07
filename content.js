
//listen for select
chrome.runtime.onMessage.addListener( function(request,sender,sendResponse)

{
  
  if(request.action === 'select') {
    let body = Array.from(document.querySelectorAll("body *"));
 
    let filteredBody = body.filter(element => element.localName === 'a'
      || element.localName === 'input');
    console.log(filteredBody)
    filteredBody.map((item, index, array) => {
      let numberLabel = document.createElement("label");
      numberLabel.className += "numberLabel animated infinite pulse";
      numberLabel.innerHTML = index.toString();
      item.prepend(numberLabel);
      sendResponse({rep: "elementsSelected"});
  })
   }
   
  else {
    return
  }
});

// listen for exit select
chrome.runtime.onMessage.addListener( function(request,sender,sendResponse)
{ 
  if(request.action === 'exit select') {
    let numberLabels = Array.from(document.querySelectorAll('.numberLabel'));
    numberLabels.forEach(element => {
      element.parentNode.removeChild(element);
    });
    sendResponse("exit elements")
   } 
  else {
    return
  }
});

// listen for number
chrome.runtime.onMessage.addListener( function(request,sender,sendResponse)
{ 
  if(request.action === 'number') {
    let numberLabels = Array.from(document.querySelectorAll('.numberLabel'));
    numberLabels.map((element, index) => {
     
      index === request.spokenNumber ? element.parentNode.click() : null;
    })
    sendResponse("display number")
   } 
  else {
    return
  }
});





