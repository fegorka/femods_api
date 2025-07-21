const fs = require('fs')

const readPackageJson = (path = 'package.json') => {
  const content = fs.readFileSync(path, 'utf8')
  return JSON.parse(content)
}

const getVersion = (pkg) => pkg.version

const printVersion = (version) => {
  if (!version) {
    console.error('Version not found in package.json')
    process.exit(1)
  }
  console.log(version)
}

const main = () => {
  try {
    const pkg = readPackageJson()
    const version = getVersion(pkg)
    printVersion(version)
  } catch (error) {
    console.error('Error reading version:', error.message)
    process.exit(1)
  }
}

main()
