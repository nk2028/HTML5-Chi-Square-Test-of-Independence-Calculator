let DATA_PERSIST_DATA_KEY = 'chi-data-persist-data'
let DATA_PERSIST_SETTING_KEY = 'chi-data-persist-setting'

let initDataFromPersisten = () => {
  let data = localStorage.getItem(DATA_PERSIST_DATA_KEY)
  if (typeof(data) !== 'string') {
    return false
  }
  setTimeout(() => {
    //console.log(data)
    $('#input_data').val(data).change()
  }, 0)
}

let initSettingFromPersisten = () => {
  let setting = localStorage.getItem(DATA_PERSIST_SETTING_KEY)
  if (setting === null) {
    return false
  }
  
  setting = JSON.parse(setting)
  
  Object.keys(setting).forEach(id => {
    let value = setting[id]
    
    let ele = $('#' + id)
    if (ele.prop('type') === 'checkbox') {
      ele.prop('checked', value)
    }
    else {
      ele.val(value)
    }
  })
  
}

let setDataToPersistenTimer
let setDataToPersisten = (data) => {
  if (typeof(data) !== 'string') {
    return false
  }
  
  if (setDataToPersistenTimer) {
    clearTimeout(setDataToPersistenTimer)
  }
  setDataToPersistenTimer = setTimeout(() => {
    localStorage.setItem(DATA_PERSIST_DATA_KEY, data)
  }, 1000)
  
}

let setSettingToPersistenTimer
let setSettingToPersisten = () => {
  clearTimeout(setSettingToPersistenTimer)
  let setting = {}
  
  $('.data-persist-setting').each((i, ele) => {
    let id = ele.id
    
    let value
    if (ele.type === 'checkbox') {
      value = ele.checked
    }
    else {
      value = ele.value
    }
    
    setting[id] = value
  })
  //console.trace(setting)
  //if (typeof(setting) !== 'object') {
  //  return false
  //}
  
  setting = JSON.stringify(setting)
  
  setSettingToPersistenTimer = setTimeout(() => {
    localStorage.setItem(DATA_PERSIST_SETTING_KEY, setting)
  }, 1000)
}