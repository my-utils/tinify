const process = require('child_process')

function runShell(shell) {
  console.log(`正在执行shell操作: ${shell}`)
  return new Promise((resolve, reject) => {
    process.exec(shell, function (error, stdout, stderr) {
      if (error) {
        console.log(`执行错误: ${error.message}`)
        reject(error.message)
        return
      }
      if (stderr) {
        // console.log(`执行存在异常: ${stderr}`);
        // reject(stderr)
        // return;
      }
      console.log(`执行成功: ${stdout}`)
      resolve(stdout)
    })
  })
}
async function start() {
  await runShell('standard-version')
  await runShell('git push --follow-tags origin master')
  await runShell('npm publish')
}
start()
