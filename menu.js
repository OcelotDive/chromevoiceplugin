const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false;
recognition.start();

let tabsIdsWithElementsDisplayed = [];
let elementsAreDisplayed = false;
let searchModeActivated = false;
let menuId;

function setMenuId() {
  chrome.tabs.getAllInWindow((tabs) => {
    tabs.map((tab) => {
      if (tab.title === "Voice for Youtube") {
        menuId = tab.id;
      }
    });
  });
}
setMenuId();

addExistingVideosToSavedListOnStart();

recognition.addEventListener("result", (event) => {
  let finalTranscript = "";
  let lastWord = "";
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      finalTranscript = event.results[i][0].transcript.toLowerCase();
      lastWord = finalTranscript.split(" ");
      lastWord = lastWord[lastWord.length - 1];
    }
  }
  console.log(finalTranscript);

  if (
    finalTranscript.includes("new tab") ||
    finalTranscript.includes("open tab") ||
    finalTranscript.includes("open tap")
  ) {
    chrome.tabs.create({ url: "https://google.com", active: true });
  } else if (finalTranscript.includes("menu")) {
    chrome.tabs.update(menuId, { active: true }, (tab) => {});
  } else if (finalTranscript.includes("go to tab")) {
    alert(lastWord);
    chrome.tabs.getAllInWindow((tabs) => {
      chrome.tabs.update(
        tabs[parseInt(lastWord) - 1].id,
        { active: true },
        (tab) => {}
      );
    });
  } else if (
    finalTranscript.includes("close tab") ||
    finalTranscript.includes("exit tab")
  ) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.remove(tabs[tabs.length - 1].id);
    });
    elementsAreDisplayed = false;
    searchModeActivated = false;
  } else if (finalTranscript.includes("remove all left")) {
    removeTabsEitherSide(lastWord);
  } else if (finalTranscript.includes("remove all right")) {
    removeTabsEitherSide(lastWord);
  } else if (finalTranscript.includes("refresh")) {
    sendRefreshMessageToContent();
  } else if (finalTranscript.includes("elements") && !searchModeActivated) {
    sendSelectElementMessageToContent();
    elementsAreDisplayed = true;
  } else if (finalTranscript.includes("cancel")) {
    sendExitElementMessageToContent();
    sendExitSearchMessageToContent();
    elementsAreDisplayed = false;
    searchModeActivated = false;
  } else if (finalTranscript.includes("search")) {
    sendSearchMessageToContent();
    elementsAreDisplayed = false;
    sendExitElementMessageToContent();
  } else if (searchModeActivated && finalTranscript) {
    sendSearchQueryToContent(finalTranscript);
  } else if (
    elementsAreDisplayed &&
    !finalTranscript.includes("scroll") &&
    // && !finalTranscript.includes("video")
    typeof parseInt(lastWord) === "number"
  ) {
    sendNumberMessageToContent(parseInt(finalTranscript));
  } else if (finalTranscript.includes("scroll")) {
    sendScrollDownMessageToContent(lastWord);
  } else if (typeof finalTranscript === "string") {
    sendCheckVideoCommandToContent(finalTranscript);
  }
  sendTranscriptToDisplayInContent(finalTranscript);
});

recognition.addEventListener("end", recognition.start);

listenForChangeAfterSelectCommand();

// functions start

function sendTranscriptToDisplayInContent(finalTranscript) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[tabs.length - 1].id,
      {
        action: "transcript to display",
        transcript: finalTranscript
        
      },
      (response) => {}
    );
  });
}

function removeTabsEitherSide(direction) {
  let pivot;
  chrome.tabs.getAllInWindow((tabs) => {
    tabs.map((tab, index) => {
      if (tab.id === menuId) {
        pivot = index;
      }
    });
    switch (direction) {
      case "left":
        tabs.map((tab, index) => {
          index < pivot && chrome.tabs.remove(tab.id);
        });
        break;
      case "right":
        tabs.map((tab, index) => {
          index > pivot && chrome.tabs.remove(tab.id);
        });
        break;
      default:
        return;
        break;
    }
  });
}

function sendRefreshMessageToContent() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[tabs.length - 1].id,
      { action: "refresh" },
      (response) => {}
    );
  });
}

function sendCheckVideoCommandToContent(finalTranscript) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[tabs.length - 1].id,
      { action: "check if video command", transcript: finalTranscript },
      (response) => {
        if(!response.video) {
          return;
        }
        if (response.video) {
          console.log(window.localStorage);
          addNewVideoToSavedList(response.video);
        }
      }
    );
  });
}

removeVideoOnClick();

function removeVideoOnClick() {
  const list = document.querySelector(".savedVideoList");
  const storage = window.localStorage;

  list.addEventListener("click", (event) => {
    if (event.target.className === "btn btn-warning") {
      const listItem = event.target.parentNode;

      const videoName = event.target.nextElementSibling.textContent;

      console.log(videoName);
      storage.removeItem(videoName);
      console.log(storage);
      listItem.parentNode.removeChild(listItem);
    }
  });
}

function addExistingVideosToSavedListOnStart() {
  const storage = window.localStorage;
  const videos = Object.values(storage).map(JSON.parse);

  videos.map((video) => {
    const list = document.querySelector(".savedVideoList");
    const videoListItem = document.createElement("li");
    videoListItem.className = "videoListItem";
    const videoLink = document.createElement("a");
    videoLink.href = video.url;
    videoLink.target = "_blank";

    videoLink.innerHTML = video.name;

    const removeVideoButton = document.createElement("div");
    removeVideoButton.className = "btn btn-warning";
    removeVideoButton.innerHTML = "X";
    videoListItem.appendChild(removeVideoButton);
    videoListItem.appendChild(videoLink);

    list.appendChild(videoListItem);
  });
}

function addNewVideoToSavedList(video) {
  const storage = window.localStorage;
  const list = document.querySelector(".savedVideoList");
  const videoListItem = document.createElement("li");
  const videoLink = document.createElement("a");
  videoLink.href = video.url;
  videoLink.target = "_blank";

  videoLink.innerHTML = video.name;

  const removeVideoButton = document.createElement("div");
  removeVideoButton.className = "btn btn-warning";
  removeVideoButton.innerHTML = "X";
  videoListItem.appendChild(removeVideoButton);
  videoListItem.appendChild(videoLink);
  videoListItem.appendChild(videoLink);
  list.appendChild(videoListItem);
  storage.setItem(video.name, JSON.stringify(video));
  console.warn(storage);
}

function sendScrollDownMessageToContent(word) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[tabs.length - 1].id,
      { action: "scroll " + word },
      (response) => {
        console.log(response);
      }
    );
  });
}

function sendNumberMessageToContent(spokenNumber) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[tabs.length - 1].id,
      { action: "number", spokenNumber: spokenNumber },
      (response) => {
        console.log(response);
      }
    );
  });
}

function sendSearchMessageToContent() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    console.log(tabs);
    chrome.tabs.sendMessage(
      tabs[tabs.length - 1].id,
      { action: "search" },
      (response) => {
        searchModeActivated = true;
        console.log(response);
      }
    );
  });
}

function sendSearchQueryToContent(query) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[tabs.length - 1].id,
      { action: "query", searchQuery: query },
      (response) => {
        if (response) {
          searchModeActivated = false;
        }
        console.log(response);
      }
    );
  });
}

function sendExitElementMessageToContent() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabsIdsWithElementsDisplayed.includes(tabs[tabs.length - 1].id)) {
      chrome.tabs.sendMessage(
        tabs[tabs.length - 1].id,
        { action: "exit elements" },
        (response) => {
          tabsIdsWithElementsDisplayed = tabsIdsWithElementsDisplayed.filter(
            (element) => element != tabs[tabs.length - 1].id
          );
          console.log(response);
        }
      );
    }
  });
}

function sendExitSearchMessageToContent() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[tabs.length - 1].id,
      { action: "exit search" },
      (response) => {
        console.log(response);
      }
    );
  });
}

function sendSelectElementMessageToContent() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabsIdsWithElementsDisplayed.includes(tabs[tabs.length - 1].id)) {
      return;
    } else {
      tabsIdsWithElementsDisplayed.push(tabs[tabs.length - 1].id);
      chrome.tabs.sendMessage(
        tabs[tabs.length - 1].id,
        { action: "select" },
        (response) => {
          console.log(response);
        }
      );
    }
  });
}

function listenForChangeAfterSelectCommand() {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabsIdsWithElementsDisplayed.includes(tabs[tabs.length - 1].id)) {
        chrome.tabs.sendMessage(
          tabs[tabs.length - 1].id,
          { action: "exit elements" },
          (response) => {
            tabsIdsWithElementsDisplayed = tabsIdsWithElementsDisplayed.filter(
              (element) => element != tabs[tabs.length - 1].id
            );
            console.log(response);
            elementsAreDisplayed = false;
            searchModeActivated = false;
          }
        );
      }
    });
  });
}

function listenForPageLoad() {
  chrome.tabs.onUpdated.addListener(function (tabId, info) {
    if (info.status === "complete") {
      chrome.tabs.sendMessage(
        tabs[tabs.length - 1].id,
        { action: "page load" },
        (response) => {}
      );
    }
  });
}
