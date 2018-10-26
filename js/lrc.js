const titleRegex = /---\s?(lesson\s+\d+\s+)?([a-zA-Z!?.\s',-]*)(.*)/i
class LRC {
  constructor(src) {
    this.title = {}
    this.src = src
    this.raw = null
    this.lines = []
  }

  async load(src = this.src) {
    this.raw = await fetch(src).then(response => {
      return response.text()
    })
    return this.raw
  }

  parse() {
    const rawLines = this.raw.split('\n')

    const [, , titleEn, titleCn] = rawLines[0].match(titleRegex)
    this.title.en = titleEn.trim()
    this.title.cn = titleCn.trim()

    this.lines = rawLines.filter(line => line.trim()).slice(1).map(line => {
      const timeEndPos = line.indexOf(']')
      const [m, s] = line.slice(1, timeEndPos).split(':').map(i => +i)
      const start = Number((m * 60 + s).toFixed(3))
      const [en, cn] = line.slice(timeEndPos + 1).split('^').map(str => str.trim())
      return {start, en, cn}
    })

    this.lines.forEach((line, idx) => {
      const nextLine = this.lines[idx + 1]
      if (!nextLine) return
      line.end = nextLine.start - 0.1
    })
  }

  async run() {
    await this.load()
    this.parse()
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports.titleRegex = titleRegex