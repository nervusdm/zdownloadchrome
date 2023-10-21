document.addEventListener('DOMContentLoaded', function () {





    
  const externalUrlInput = document.getElementById('externalUrl');
  const saveButton = document.getElementById('saveButton');
  const downloadButton = document.getElementById('downloadButton');
  const filesListDiv = document.getElementById('filesList'); 
  const refreshButton = document.getElementById('refreshButton');
  const total_size_infoDiv = document.getElementById('total_size_info');
  const uploadButton  = document.getElementById('uploadButton');
  let urlServ='';




  // Chargement de l'URL externe actuelle depuis le stockage local
  chrome.storage.local.get(['externalUrl'], function (result) {
    if (result.externalUrl) {
      externalUrlInput.value = result.externalUrl;
      urlServ=result.externalUrl;
      listFiles();
    }
  });

listFiles = function() {
    fetch(urlServ + '&action=list')
    .then(response => response.json())
    .then(data => {
        filesListDiv.innerHTML = "";
        total_size_infoDiv.innerHTML = "(" + data.totalSize + ")";
        data.files.forEach(file => {
            const fileDiv = document.createElement('div');
            fileDiv.innerHTML = "<a href='" + urlServ + "&action=download&file=" + file.filename + "'>" + file.size + " " + file.filename 
            
            
            + "</a>"
            + "<button class='btn btn-danger btn-xs deleteFile' data-file=\"" + file.filename + "\">X</button>" ;

            fileDiv.classList.add('fileLink');
            filesListDiv.appendChild(fileDiv);
        });
    });
}
deleteFile = function(filename) {
    console.log('Try to delete ' + filename);
    fetch(urlServ + '&action=delete&file=' + filename)
    .then(response => response.json())
    .then(data => {
        listFiles();
    });
}   

  // Enregistrement de l'URL externe
  saveButton.addEventListener('click', function () {
    const externalUrl = externalUrlInput.value;
    chrome.storage.local.set({ 'externalUrl': externalUrl });
    showToast('URL saved', 'success');
  });

    // Téléchargement de l'URL externe
    downloadButton.addEventListener('click', function () {
        const externalUrl = externalUrlInput.value;
        if (externalUrl) {
            const downloadUrls = document.getElementById('downloadUrls').value;
          const selectedText = downloadUrls;
          const urlWithText = externalUrl.replace('{{notre_texte}}', encodeURIComponent(selectedText));
            var urls = {urls: selectedText.split("\n")};

            console.log(urls);
            fetch(urlWithText +"&action=urls", {
                method: 'POST',
                body: JSON.stringify(urls),
            }).then(function (response) {
                listFiles();
                showToast("Download started", "info");

                return response.json();
            }).then(function (data) {

            });

        }


    });


  //.deleteFile
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('deleteFile')) {
            deleteFile(e.target.dataset.file);
        }
    });

  // Upload input type file (id files) to server
  uploadButton.addEventListener('click', function () {
    var formData = new FormData();
    //look all files in input files
    for(var i = 0; i < document.getElementById('files').files.length; i++) {
      file = document.getElementById('files').files[i];
      formData.append('file'+i, file);
    }


 
    fetch(urlServ + '&action=upload', {
      method: 'POST',
      body: formData
    }).then(function (response) {
      showToast("Upload started", "info");
      listFiles();

      return response.json();
    }).then(function (data) {

    });
  });
    

  refreshButton.addEventListener('click', function () {
    listFiles();
    showToast('Files refreshed', 'info');

  });

  chrome.runtime.sendMessage({ action: "getSelectedText" }, function (response) {
    if (response && response.selectedText) {
        // Affichez les données dans le textarea
        var textarea = document.getElementById('downloadUrls');
        textarea.value = response.selectedText.replace(" ", "\n");
        //click 
        downloadButton.click();
    }
});



alive = function() {
    fetch(urlServ + '&action=alive')
    .then(response => response.json())
    .then(data => {
        if (data.alive) {
            document.getElementById('alive').innerHTML = "<i class='fa fa-check'></i> ZServ is running (" + data.cpuUsage + ")";
            //remove color
            document.getElementById('alive').style.color = '';
        } else {
            document.getElementById('alive').innerHTML = "<i class='fa fa-power-off'></i> ZServ is not running";
        }
    }).catch(function() {
        document.getElementById('alive').innerHTML = "<i class='fa fa-power-off'></i> ZServ is not running";
        // in red
        document.getElementById('alive').style.color = 'red';
    })
    
    ;
}

setInterval(alive, 1000);

});




const toaster = document.createElement('div');
toaster.classList.add('toaster');

function showToast(message, type = 'info', duration = 3000) {
  const toastContent = document.createElement('div');
  toastContent.classList.add('toast-content', type);
  toastContent.textContent = message;

  toaster.appendChild(toastContent);
  document.body.appendChild(toaster);

  setTimeout(() => {
    toaster.removeChild(toastContent);
    if (toaster.childElementCount === 0) {
      document.body.removeChild(toaster);
    }
  }, duration);
}
