// This is a node.js program
const fsPromises = require('fs').promises
const path = require('path')

async function main() {
  console.log(__dirname)
  const dir = path.join(__dirname, '../lrc')
  const filenames = await fsPromises.readdir(dir, {encoding: 'utf-8'})

  const titles = {}

  for (let i = 0; i< filenames.length; i++) {
    const filename = filenames[i]
    const fullname = path.join(__dirname, `../lrc/${filename}`)
    const content = await fsPromises.readFile(fullname, {encoding: 'utf-8'})
    const rawLines = content.split('\n')
    const [_, titleEn, titleCn] = rawLines[0].match(/lesson\s+\d+\s+([a-zA-Z!?.\s',-]*)(.*)/i)
    titles[filename.split('.')[0]] = titleEn
  }

  console.log(JSON.stringify(titles))
}

main()