chrome.browserAction.onClicked.addListener(function(){chrome.windows.create({url:"uploader.html",width:640,height:400,focused:!0,type:"popup"})}),chrome.webRequest.onBeforeSendHeaders.addListener(function(e){console.debug("headers",e);var r=e.requestHeaders,t=r.filter(function(e){return"Origin"===e.name?!0:!1})[0].value.search(/^chrome\-extension:\/\//)>-1;if(t){r.forEach();for(var o=0;o<r.length;o++)switch(r[o]){case"Origin":r[o].value="http://tieba.baidu.com"}}return{requestHeaders:r}},{urls:["http://upload.tieba.baidu.com/upload/pic*"]},["blocking","requestHeaders"]);