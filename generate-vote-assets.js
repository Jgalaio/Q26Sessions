const fs = require('fs')
const path = require('path')

const TOTAL_CODES = 20000 // muda aqui

const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomBlock(length = 4) {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

function generateCode(index) {
  return `PS-${randomBlock(4)}-${String(index).padStart(6, '0')}`
}

const used = new Set()
const codes = []
const csvRows = ['code,is_used,voted_dj_slug,voted_at']

for (let i = 1; i <= TOTAL_CODES; i++) {
  let code
  do {
    code = generateCode(i)
  } while (used.has(code))

  used.add(code)
  codes.push(code)
  csvRows.push(`${code},false,,`)
}

// caminhos absolutos
const projectRoot = process.cwd()
const dataDir = path.join(projectRoot, 'data')
const jsonPath = path.join(dataDir, 'codes.json')
const csvPath = path.join(projectRoot, 'vote_codes.csv')

try {
  // garantir pasta /data
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
    console.log(`Pasta criada: ${dataDir}`)
  }

  // escrever JSON
  fs.writeFileSync(jsonPath, JSON.stringify(codes, null, 2), 'utf8')

  // escrever CSV
  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8')

  console.log('-----------------------------------')
  console.log('Ficheiros criados com sucesso:')
  console.log(`JSON: ${jsonPath}`)
  console.log(`CSV : ${csvPath}`)
  console.log(`Total de códigos: ${TOTAL_CODES}`)
  console.log('-----------------------------------')
} catch (error) {
  console.error('ERRO AO CRIAR FICHEIROS:')
  console.error(error)
}