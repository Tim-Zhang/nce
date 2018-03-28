export default {
  getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
        console.log(results)
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },

  parseQueryString() {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")) },
        query  = window.location.search.substring(1)

    const urlParams = {}
    while (match = search.exec(query)) {
      const key = decode(match[1])
      if (!urlParams[key]) {
        urlParams[key] = decode(match[2])
      } else {
        urlParams[key] = [].concat(urlParams[key], decode(match[2]))
      }
    }

    return urlParams
  }
}