const puppeteer = require('puppeteer')
const fs = require('fs')

const monitorCafeUrl = '카페경로'
const id = '아이디'
const pw = '비번'

let last
const nameMap = []

const getTime = () => {
  let date = new Date()

  let hour = date.getHours()
  hour = (hour < 10 ? '0' : '') + hour

  let min = date.getMinutes()
  min = (min < 10 ? '0' : '') + min

  let sec = date.getSeconds()
  sec = (sec < 10 ? '0' : '') + sec

  return hour + ':' + min + ':' + sec
}

const Logger = {

}

Logger.info = function (message) {
  console.log('\x1b[1m\x1b[36m' + getTime() + '\x1b[37m [INFO] ' + message + '\x1b[0m')
  fs.writeFileSync('./log.txt', fs.readFileSync('./log.txt').toString() + '\n' + getTime() + ' ' + message)
}

  ; (async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://nid.naver.com/nidlogin.login');
    await page.evaluate((id, pw) => {
      document.getElementById("id").value = id
      document.getElementById("pw").value = pw
      document.getElementById("frmNIDLogin").submit()
    }, id, pw)

    page.on('load', async () => {
      if (page.url().startsWith('https://www.naver.com')) {
        await page.goto(monitorCafeUrl)
      }
      if (page.url().startsWith(monitorCafeUrl)) {
        setInterval(async () => {
          await page.evaluate(() => {
            nanoajax.ajax({
              url : oLinkedMember._sServerDomain + "/addAndList.nhn?r=linkedMember&cafeKey=" + oLinkedMember._sCafeKey + "&ncmc4=" + oLinkedMember._sNcmc4,
              method : 'GET',
              withCredentials : true,
              cors : true
            }, console.log);
          })
        }, 500)
      }
    })

    page.on('console', e => {
      const json = e.text.split(" ")
      if (json[0] !== '200') return
      json.splice(0, 1)
      json.splice(json.length - 1, 1)
      if (json[0] == '<!DOCTYPE') return
      const data = JSON.parse(json.join(" ")).l
      const refinedData = []
      for (const i in data) {
        refinedData.push(data[i].m)
        nameMap[data[i].m] = data[i].n
      }
      if (last) {
        for (const i in last) {
          if (refinedData.indexOf(last[i]) == -1) {
            Logger.info(`${nameMap[last[i]]}(${last[i]}) 님이 로그아웃 하셨습니다.`)
          }
        }
  
        for (const i in refinedData) {
          if (last.indexOf(refinedData[i]) == -1) {
            Logger.info(`${nameMap[refinedData[i]]}(${refinedData[i]}) 님이 로그인 하셨습니다.`)
          }
        }
      } else {
        const list = []
        for (const i in refinedData) {
          list.push(`${nameMap[refinedData[i]]}(${refinedData[i]})`)
        }
        Logger.info(`실행 완료. 현재 유저 리스트: \n${list.join(',\n')}`)
      }

      last = refinedData

    })

  })()