document.getElementById("readPage").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: "getPageContent" }, (response) => {
        if (response && response.content) {
          alert("页面内容: \n" + response.content);
        } else {
          alert("无法读取页面内容！");
        }
      });
    });
  });
  
  document.getElementById("saveFile").addEventListener("click", () => {
    const content = document.getElementById("fileContent").value;
    if (content) {
      chrome.runtime.sendMessage(
        { type: "saveFile", content: content, filename: "output.txt" },
        (response) => {
          if (response.status === "success") {
            alert("文件保存成功！");
          } else {
            alert("文件保存失败！");
          }
        }
      );
    } else {
      alert("请输入要保存的内容！");
    }
  });
  

  