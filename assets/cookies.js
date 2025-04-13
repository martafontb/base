window.getCookie = (cookieName) => {
  var match = document.cookie.match(RegExp('(?:^|;\\s*)' + cookieName + '=([^;]*)')); 
  return match ? match[1] : null;
}

window.setCookie = (cookieName, value, expiryDays) => {
  var expires = "";
  if (expiryDays) {
    var date = new Date();
    date.setTime(date.getTime() + (expiryDays*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = cookieName + "=" + (value || "")  + expires + "; path=/";
}

window.deleteCookie = (cookieName) => {
  document.cookie = cookieName +"=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

// https://hackernoon.com/why-localstorage-still-crashes-your-website-in-2023
window.storageAvailable = (type = 'localStorage') => {
  let storage;
  try {
    storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === 'QuotaExceededError' ||
          // Firefox
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}

// https://www.sohamkamani.com/javascript/localstorage-with-ttl-expiry
window.setStorageItem = (key, value, days) => {
  if(!window.storageAvailable()) return;
  const milliseconds = days * 24 * 60 * 60 * 1000;
	const now = new Date()
	const item = {
		value: value,
		expiry: now.getTime() + milliseconds,
	}
	localStorage.setItem(key, JSON.stringify(item))
}

window.expireStorageItem = (key) => {
  if(!window.storageAvailable()) return;
	const itemStr = localStorage.getItem(key)
	if (!itemStr) {
		return null
	}
	const item = JSON.parse(itemStr)
	const now = new Date()
	if (now.getTime() > item.expiry) {
		localStorage && localStorage.removeItem(key)
		return null
	}
	return item.value
}

window.expireStorageItems = () => {
  if(!window.storageAvailable()) return;
  const items = { ...localStorage };
  Object.keys(items).forEach(key => {
    const item = localStorage && localStorage.getItem(key);
    if(!item || !key.includes('milamend_')) {
      return;
    }
    item.includes("\"expiry\"") && window.expireStorageItem(key);
  })
}

expireStorageItems();