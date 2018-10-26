// This is a node.js program
const fsPromises = require('fs').promises
const path = require('path')
const lrc = require('../js/lrc')

async function main() {
  const dir = path.join(__dirname, '../lrc')
  const filenames = await fsPromises.readdir(dir, {encoding: 'utf-8'})

  const titles = {}

  for (let i = 0; i< filenames.length; i++) {
    const filename = filenames[i]
    const fullname = path.join(__dirname, `../lrc/${filename}`)
    const content = await fsPromises.readFile(fullname, {encoding: 'utf-8'})
    const rawLines = content.split('\n')
    const [, , titleEn] = rawLines[0].match(lrc.titleRegex)
    titles[filename.split('.')[0]] = titleEn.trim()
  }

  console.log(JSON.stringify(titles))
}

main()