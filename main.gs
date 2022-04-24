function mainWork() {
  if((new Date()).getDay() === 6 || (new Date()).getDay() === 0) return
  const params = {
    contentType: "application/json",
    muteHttpExceptions: true
  }
  const myLocationName = '新店區'
  const resp = UrlFetchApp.fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-D0047-071?Authorization=' + keys.opendataAuthorization + '&locationName=' + myLocationName, params);
  if(resp.getResponseCode() !== 200) lineNotify('天氣 API 異常，無法取得資料')
  const weatherResp = JSON.parse(resp.getContentText())
  const locationName = weatherResp.records.locations[0].location[0].locationName
  const poP12h = weatherResp.records.locations[0].location[0].weatherElement.filter(function(item){ return item.elementName === 'PoP12h'})
  const weatherDescription = weatherResp.records.locations[0].location[0].weatherElement.filter(function(item){ return item.elementName === 'WeatherDescription'})
  const poP12hFirstData = poP12h[0].time[0]
  const weatherDescriptionFirstData = weatherDescription[0].time[0]
  const remind = (Number(poP12hFirstData.elementValue[0].value) > 50) ? '降雨機率超過 50% ，建議穿雨衣/帶雨傘吧' : '降雨機率低於 50%，可以賭賭運氣囉';
  const lineMsg = `
今天日期: ${weatherDescriptionFirstData.startTime.split(' ')[0]}
地區: ${locationName}
詳細內容: ${weatherDescriptionFirstData.elementValue[0].value}
【小建議】: ${remind}
  `
  lineNotify(lineMsg, Number(poP12hFirstData.elementValue[0].value))
}

function lineNotify(msg, rainChance){
  UrlFetchApp.fetch('https://notify-api.line.me/api/notify', {
    'headers': {
      'Authorization': 'Bearer ' + keys.lineToken,
    },
    'method': 'post',
    'payload': {
      'message':msg,
      'stickerPackageId': '446',
      'stickerId': (rainChance > 50) ? '1994': '2027'
      }
    });
}