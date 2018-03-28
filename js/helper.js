export default {
  getParameterByName(name, url) {
    if (!url) url = window.location.href
    name = name.replace(/[\[\]]/g, "\\$&")
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url)
        console.log(results)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, " "))
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
  },

  updateQueryString(key, value, url) {
    if (!url) url = window.location.href
    var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
        hash

    if (re.test(url)) {
        if (typeof value !== 'undefined' && value !== null)
            return url.replace(re, '$1' + key + "=" + value + '$2$3')
        else {
            hash = url.split('#')
            url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '')
            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                url += '#' + hash[1]
            return url
        }
    }
    else {
        if (typeof value !== 'undefined' && value !== null) {
            var separator = url.indexOf('?') !== -1 ? '&' : '?'
            hash = url.split('#')
            url = hash[0] + separator + key + '=' + value
            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                url += '#' + hash[1]
            return url
        }
        else
            return url
    }
  },



  getLessionIdFromUrl() {
    let hash = +(location.hash && location.hash.slice(1))
    if (isNaN(hash) || hash < 201 || hash > 296) hash = 201
    return hash
  },

  setLessionIdInUrl(id) {
    location.hash = id
  },
}