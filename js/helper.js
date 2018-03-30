window.Helper = {
  getParameterByName(name, url) {
    if (!url) url = window.location.href
    name = name.replace(/[\[\]]/g, "\\$&")
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url)
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



  getLessionIdFromUrl(lessons) {
    const defaultId = 201
    const lastId = localStorage.getItem('lastLessonId')
    let hash = +(location.hash && location.hash.slice(1))
    if (isNaN(hash) || !lessons.includes(hash)) hash = lastId || defaultId
    return hash
  },

  setLessionIdInUrl(id) {
    localStorage.setItem('lastLessonId', id)
    location.hash = id
  },

  initLessons() {
    const book1 = Array(143).fill().map((_, i) => i + 1).filter(i => !!(i % 2)).map(i => {
      let repeat = 2 - i.toString().length
      repeat < 0 && (repeat = 0)
      let prefix = '1' + '0'.repeat(repeat)
      return Number(prefix + i)
    })

    const book2 = Array(96).fill().map((_, i) => 200 + i + 1)
    const book3 = Array(60).fill().map((_, i) => 300 + i + 1)
    const book4 = Array(45).fill().map((_, i) => 400 + i + 1)

    return [].concat(book1, book2, book3, book4)
  }
}