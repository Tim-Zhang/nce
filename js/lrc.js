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
    const [_, titleEn, titleCn] = rawLines[0].match(/lesson\s+\d+\s+([a-zA-Z!?.\s',]*)(.*)/i)
    this.title.en = titleEn.trim()
    this.title.cn = titleCn.trim()

    this.lines = rawLines.filter(line => line.trim()).slice(1).map(line => {
      const [m, s] = line.slice(1, 10).split(':').map(i => +i)
      const start = m * 60 + s
      const [en, cn] = line.slice(11).split('^').map(str => str.trim())
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