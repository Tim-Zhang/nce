let lastFocusIdx = 0

var app = new Vue({
  el: '#app',
  template: '#main',
  data: {
    id: 0,
    title: {},
    lines: [],
    loading: true,
    stopTime: 0,
    lessons: Helper.initLessons(),

    showChinese: true,
    showSubtitle: true,
  },
  methods: {
    setId() {
      this.id = Helper.getLessionIdFromUrl(this.lessons)
    },

    async load() {
      this.loading = true

      const q = Helper.parseQueryString()
      this.uk = ['1', 'true'].includes(q.uk)
      this.showChinese = !['0', 'false'].includes(q.chinese)
      this.showSubtitle = !['0', 'false'].includes(q.subtitle)
      this.showResultDefault = ['1', 'true'].includes(q.submit) || q.scene === 'result'
      this.showInputDefault = ['1', 'true'].includes(q.restore) || q.scene === 'input'

      const lrcDir = this.uk ? 'lrc-uk' : 'lrc'
      const lrc = new LRC(`/${lrcDir}/${this.id}.lrc`)

      try {
        await lrc.run()
      } catch (e) {
        return alert(e.message)
      }

      this.title = lrc.title
      Helper.setTitle(`${this.id} ${this.title.en}`)
      this.lines = lrc.lines.map(line => Object.assign({
        current: false,
        answer: '',
        diff: '',
        placeholder: this.getPlaceholder(line),
      }, line))

      if (this.showResultDefault || (Helper.isMobile() && Helper.tooSmall() && !this.showInputDefault)) {
        this.submit()
      }
      this.loading = false
    },

    onLineKeydown(line, event) {
      // Hotkey: meta + ?
      const hotkeyMetaQuestion = event.metaKey && event.which === 191
      // Hotkey: meta/ctrl + click
      const hotkeyCtrlClick = event.type === 'click' && (event.ctrlKey || event.metaKey)

      if (hotkeyMetaQuestion || hotkeyCtrlClick) {
        this.setPlaceHolder(-1)
        this.$refs.audio.currentTime = line.start
        this.stopTime = line.end
        this.$refs.audio.play()
      }
    },

    onLineFocus(idx) {
      lastFocusIdx = idx
    },

    onPaste(pasteIdx, e) {
      if (pasteIdx >= this.lines.length - 1) return

      const clipboardData = e.clipboardData || window.clipboardData
      pastedData = clipboardData.getData('Text')

      const data = pastedData.split('\n')
      if (data.length <= 1) return

      this.lines = this.lines.map((line, idx) => {
        if (idx >= pasteIdx) {
          line.answer = data[idx - pasteIdx]
        }

        return line
      })

      e.preventDefault()
    },

    gotoPrevLine() {
      try {
        event.target.parentElement.previousElementSibling.children[0].focus()
      } catch (e) {}
    },

    gotoNextLine(event) {
      try {
        event.target.parentElement.nextElementSibling.children[0].focus()
      } catch (e) {
        this.submit()
      }
    },

    clear() {
      this.lines.forEach(line => line.answer = '')
    },

    changeLesson() {
      Helper.setTitle(this.id)
      Helper.setLessionIdInUrl(this.id)
    },

    shouldHighlight(d) {
      const trimedValue = d.value.trim()
      return d.added && trimedValue.length <= 1 || d.removed && trimedValue.length <= 1
    },

    submit() {
      let right = true
      this.lines.forEach(line => {
        line.diff = JsDiff.diffWords(line.answer, line.en)
        if (line.diff.length !== 1 || line.diff[0].added || line.diff[0].removed) right = false
      })
      if (right) {
        alert('Congratulations!')
      }
    },

    restore() {
      this.lines.forEach(line => line.diff = '')

      this.$nextTick(function () {
        this.$refs.line[lastFocusIdx].focus()
      })
    },

    getPlaceholder(line, en) {
      if (en) return this.showSubtitle ? line.en : ''
      return this.showChinese ? line.cn : ''
    },

    setPlaceHolder(currentTime) {
      this.lines.forEach(line => {
        line.placeholder = this.getPlaceholder(line)
        line.current = false
        if (line.start <= currentTime && (line.end >= currentTime || !line.end)) {
          line.placeholder = this.getPlaceholder(line, true)
          line.current = true
        }
      })
    },

    showHelp() {
      const msg = `Listen to the current line -> Win/Command + ?
Listen on the answer page -> Ctrl/Win/Command + Click
Submit -> Shift/Ctrl/Win/Command + Enter
Restore -> Esc
Clear all inputs -> Ctrl + l
Open the video -> Click the title`
      alert(msg)
    },
  },

  async created() {
    this.setId()
    await this.load()
    document.addEventListener('keydown', (e) => {
      if ((e.shiftKey || e.ctrlKey || e.metaKey) && e.which === 13) { // Hotkey: shift/ctrl/meta + enter
        this.submit()
      } else if (e.which === 27) { // Hotkey: esc
        this.restore()
      } else if (e.which === 76 && e.ctrlKey) { // Hotkey: ctrl + l
        this.clear()
      }
    })
  },

  mounted() {
    const audio = this.$refs.audio

    audio.addEventListener('timeupdate', () => {
      const currentTime = audio.currentTime
      if (this.stopTime === 0) this.setPlaceHolder(currentTime)
      if (this.stopTime && currentTime >= this.stopTime) audio.pause()
    })

    audio.addEventListener('pause', () => {
      this.stopTime = 0
      this.setPlaceHolder(-1)
    })

    window.addEventListener('hashchange', () => {
      this.setId()
      this.load()
    })
  },

  watch: {
    id: 'changeLesson',
  },

  computed: {
    videoLink() {
      if (this.id < 500 || this.id > 999) return Helper.getVideoLink(this.id)
    }
  },
})

