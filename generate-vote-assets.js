/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs')
const path = require('path')

const TOTAL_CODES = 20000
const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomBlock(length = 4) {
  let result = ''

  for (let index = 0; index < length; index += 1) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }

  return result
}

function generateCode(index) {
  return `PS-${randomBlock(4)}-${String(index).padStart(6, '0')}`
}

const used = new Set()
const codes = []
const csvRows = ['code,used']

for (let index = 1; index <= TOTAL_CODES; index += 1) {
  let code

  do {
    code = generateCode(index)
  } while (used.has(code))

  used.add(code)
  codes.push(code)
  csvRows.push(`${code},false`)
}

const projectRoot = process.cwd()
const dataDir = path.join(projectRoot, 'data')
const jsonPath = path.join(dataDir, 'codes.json')
const csvPath = path.join(projectRoot, 'vote_codes.csv')

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  fs.writeFileSync(jsonPath, JSON.stringify(codes, null, 2), 'utf8')
  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8')

  console.log('-----------------------------------')
  console.log('Codigos gerados com sucesso!')
  console.log(`CSV: ${csvPath}`)
  console.log(`Total: ${TOTAL_CODES}`)
  console.log('-----------------------------------')
} catch (error) {
  console.error('ERRO:', error)
}
