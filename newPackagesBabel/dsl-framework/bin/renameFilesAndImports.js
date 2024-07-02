const fs = require('fs')
const path = require('path')

function renameFilesAndImports(oldExt, newExt, startDir) {
  const files = []

  function recurseDir(dir) {
    const items = fs.readdirSync(dir)
    items.forEach(item => {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        recurseDir(fullPath)
      } else if (fullPath.endsWith(`.${oldExt}`)) {
        files.push(fullPath)
      }
    })
  }

  function renameFileAndUpdateImports(file) {
    const newFile = file.replace(new RegExp(`\\.${oldExt}$`), `.${newExt}`)
    let content = fs.readFileSync(file, 'utf8')

    // Update import statements
    const importRegex = new RegExp(`(import\\s.*?from\\s+['"])\\.\\/(.*?\\.${oldExt})(['"])`, 'g')
    content = content.replace(importRegex, (match, p1, p2, p3) => {
      return `${p1}./${p2.replace(`.${oldExt}`, `.${newExt}`)}${p3}`
    })

    // Write the updated content to the new file and delete the old file
    fs.writeFileSync(newFile, content, 'utf8')
    fs.unlinkSync(file)
    console.log(`Renamed: ${file} -> ${newFile}`)
  }

  recurseDir(startDir)
  files.forEach(renameFileAndUpdateImports)
}

if (require.main === module) {
  const [oldExt, newExt, startDir] = process.argv.slice(2)
  if (!oldExt || !newExt || !startDir) {
    console.error('Usage: node script.js <oldExt> <newExt> <startDir>')
    process.exit(1)
  }
  renameFilesAndImports(oldExt, newExt, startDir)
}

module.exports = renameFilesAndImports
