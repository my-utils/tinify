#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const tinify = require('tinify')
const ora = require('ora')

const keys = [
  'rv72TV007SJ82jpJCjsPhR5jk0RgNPdn',
  'vwX92xFzfDw2DVnypFPL1bhNjWbJtk4j',
  'fm4p58DwV7CP85Gf4fQtMqfJNDn9TJZP',
  'jV2zGQJK2w35Flp9FB6b6lmvSb8C32lX', // 同亮的key
  'tpfFgX56LJSqTvWF4klmLyKPQx9rG1tK', // 传发的key
  'wv1hd49KQmB07rPPXlDbXt1kkLZdJS63', // 随机邮箱
  'KFkBLJ3y03h1MNvckYlFjrSYPxY14SJq', // 随机邮箱
  'Lm89ywfXnkXgp80crnB0BK9VMDw2gTyX' // 传发的邮箱
]

const CWD_PATH = process.cwd()
const USER_PATH = process.argv[2] || './'
const size = process.argv[3] || '1024'
const IMG_PATH = path.join(CWD_PATH, USER_PATH)
const extList = ['.png', '.jpg', '.jpeg']
const discardDirList = ['node_modules', 'dist']

function findFilePath(dirPath) {
  const files = fs.readdirSync(dirPath)
  if (files.length === 0) {
    throw new Error('没有可用的文件')
  }
  const dirList = files
    .filter((i) => !/^\./.test(i) && !discardDirList.includes(i))
    .filter((i) => fs.statSync(path.join(dirPath, i)).isDirectory())
  let list = files
    .filter((i) => extList.includes(path.extname(i)) && fs.statSync(path.join(dirPath, i)).isFile())
    .map((i) => path.join(dirPath, i))
  if (dirList && dirList.length > 0) {
    dirList.forEach((i) => {
      const children = findFilePath(path.join(dirPath, i))
      if (children && children.length > 0) {
        list = list.concat(children)
      }
    })
  }
  return list
}

// 解析目录
function readdir(dirPath) {
  const spinner = ora('目录解析中...').start()
  try {
    const list = findFilePath(dirPath)
    console.log('文件列表', list)
    console.log('文件列表总条数', list.length)
    if (list.length === 0) {
      throw new Error('没有可用的图片文件,当前仅支持对 .png .jpg 的文件进行压缩')
    }
    spinner.succeed(`目录解析成功,共${list.length}个文件需要压缩`)
    return list
  } catch (error) {
    spinner.fail(`目录解析失败`)
    throw new Error(error.message)
  }
}

// 压缩图片
function compress(filePath) {
  const stats = fs.statSync(filePath)
  if (Number(stats.size) < Number(size)) {
    console.log(`文件大小:【${stats.size}】<忽略大小【${size}】,自动忽略`)
    return true
  }
  const file = path.basename(filePath)
  const spinner = ora(`${file}压缩中...`).start()

  return new Promise((resolve) => {
    tinify.key = keys[parseInt(Math.random() * 3)]
    tinify
      .fromFile(filePath)
      .toFile(filePath)
      .then((res) => {
        spinner.succeed(`${file}压缩完成`)
        resolve()
      })
      .catch((err) => {
        spinner.fail(`${file}压缩失败`)
        console.log(err)
        resolve()
      })
  })
}

// 检查当前目录或者文件是否存在
function check(path) {
  const spinner = ora('检查目录中').start()
  try {
    const result = fs.statSync(path)
    spinner.succeed('检查完成')
    return result
  } catch (error) {
    spinner.fail('目录不可用')
    throw new Error(path + ' 路径异常')
  }
}

async function start() {
  try {
    const checkResult = check(IMG_PATH)
    if (checkResult.isDirectory()) {
      console.log('当前是目录')
      const files = readdir(IMG_PATH)

      for (let i = 0; i < files.length; i++) {
        try {
          await compress(files[i])
        } catch (error) {
          console.log('error', error)
        }
      }
    } else {
      if (!extList.includes(path.extname(IMG_PATH))) {
        console.log('这不是一个图片文件,当前仅支持对 .png .jpg 的文件进行压缩')
        return
      }
      compress(IMG_PATH)
    }
  } catch (error) {
    console.log(error.message)
  }
}

start()
