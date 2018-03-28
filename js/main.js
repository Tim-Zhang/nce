import LRC from './lrc.js'
import Helper from './helper.js'

var app = new Vue({
  el: '#app',
  template: '#main',
  data: {
    id: 201,
    message: 'Hello Vue!',
    title: {},
    inputs: [],
    lines: [],
    loading: true,
    pause: 0,
    mounted: false,

    showChinese: true,
    showSubtitle: true,
  },
  methods: {
    async init() {
      this.loading = true

      const q = Helper.parseQueryString()
      this.id = q.id || '201'
      this.showChinese = !['0', 'false'].includes(q.chinese)
      this.showSubtitle = !['0', 'false'].includes(q.subtitle)
      const lrc = new LRC(`http://gh.jiecao.pw/nce-resource/lrc/${this.id}.lrc`)
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
    lineKeydown(line, event) {
      if (event.metaKey && event.which === 191) {
        this.setPlaceHolder(-1)
        this.$refs.audio.currentTime = line.start
        this.pause = line.end
        this.$refs.audio.play()
      }
    },
    getPlaceholder(line, en) {
      if (en) return this.showSubtitle ? line.en : ''
      return this.showChinese ? line.cn : ''
    },
    setPlaceHolder(currentTime) {
      this.lines.forEach(line => {
        line.placeholder = this.getPlaceholder(line)
        line.current = false
        if (line.start <= currentTime && line.end >= currentTime) {
          line.placeholder = this.getPlaceholder(line, true)
          line.current = true
        }
      })
    },
    listen() {
      this.pause = Infinity
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
    },
    pause() {
      this.pause = 0
      this.$refs.audio.pause()
    },
    next(event) {
      try {
        event.target.parentElement.nextElementSibling.children[0].focus()
      } catch (e) {
        this.submit()
      }
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
      this.lines.forEach(line => {
        line.diff = ''
      })
    },
  },
  async created() {
    await this.init()
    document.addEventListener('keydown', (e) => {
      if ((e.shiftKey || e.ctrlKey || e.metaKey) && e.which === 13) {
        this.submit()
      } else if (e.which === 27) {
        this.restore()
      }
    })
  },
  mounted() {
    this.mounted = true
    const audio = this.$refs.audio
    audio.addEventListener('timeupdate', () => {
      const currentTime = audio.currentTime
      if (this.pause === 0) this.setPlaceHolder(currentTime)
      if (this.pause && currentTime >= this.pause) audio.pause()
    })

    audio.addEventListener('pause', () => {
      this.pause = 0
      this.setPlaceHolder(-1)
    })
  }
})

