var popupWindow=function(){var o;return function(){null==o?chrome.windows.create({url:"main.html",width:640,height:400,focused:!0,type:"popup"},function(n){o=n.id}):chrome.windows.update(o,{focused:!0})}}();chrome.browserAction.onClicked.addListener(popupWindow);