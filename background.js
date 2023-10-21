chrome.contextMenus.create({
    id: 'zservdownloader',
    title: 'Downlaod with ZDownloadChrome',
    contexts: ['selection'],
  });
  
  chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === 'zservdownloader') {

        console.log(info.selectionText);
      // Récupération de l'URL externe depuis le stockage local
      chrome.storage.local.get(['externalUrl'], function (result) {
        const externalUrl = result.externalUrl;
        if (externalUrl) {
          const selectedText = info.selectionText;
          const urlWithText = externalUrl.replace('{{notre_texte}}', encodeURIComponent(selectedText));
            var urls = {urls: selectedText.split(" ")};
            console.log(urls);
            fetch(urlWithText, {
                method: 'POST',
                body: JSON.stringify(urls),
            }).then(function (response) {
                return response.json();
            }).then(function (data) {

            });

            //open the popup
            chrome.windows.create({
                url: 'popup.html',
                type: 'popup',
                width: 800,
                height: 600
            }, function (window) {
                //window is the newly opened window
                chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                    if (request.action === "getSelectedText") {
                        sendResponse({ selectedText: selectedText });
                    }
                });
                
       
            });



        }
      });
    }
  });
  