const { execSync } = require('child_process')

const getDryRunOutput = () =>
  execSync('npx standard-version --dry-run', { encoding: 'utf8' })

const extractVersion = (output) => {
  const match = output.match(/release v(\d+\.\d+\.\d+)/)
  return match ? match[1] : null
}

const printVersion = (version) => {
  if (!version) {
    console.error('Could not determine next version')
    process.exit(1)
  }
  console.log(version)
}

const main = () => {
  try {
    const output = getDryRunOutput()
    const version = extractVersion(output)
    printVersion(version)
  } catch (error) {
    console.error('Error running standard-version:', error.message)
    process.exit(1)
  }
}

main()