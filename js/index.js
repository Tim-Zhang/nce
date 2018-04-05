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
      this.showChinese = !['0', 'false'].includes(q.chinese)
      this.showSubtitle = !['0', 'false'].includes(q.subtitle)

      const lrc = new LRC(`/lrc/${this.id}.lrc`)
      await lrc.run()
      this.title = lrc.title
      this.lines = lrc.lines.map(line => Object.assign({
        current: false,
        answer: '',
        diff: '',
        placeholder: this.getPlaceholder(line),
      }, line))

      this.loading = false
    },

    onLineKeydown(line, event) {
      // Hotkey: meta + ?
      if (event.metaKey && event.which === 191) {
        this.setPlaceHolder(-1)
        this.$refs.audio.currentTime = line.start
        this.stopTime = line.end
        this.$refs.audio.play()
      }
    },

    onLineFocus(idx) {
      lastFocusIdx = idx
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
      Helper.setLessionIdInUrl(this.id)
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
      console.log(currentTime)
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
    id: 'changeLesson'
  },

  computed: {
    videoLink() {
      return Helper.getVideoLink(this.id)
    }
  },
})

