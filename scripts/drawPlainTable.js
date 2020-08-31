let drawPlainTable = function (_cross_table) {
  
  let colVarList = []
  let rowVarList = []
  
  _cross_table.find('thead tr.x-vars-tr th').each((i, ele) => {
    colVarList.push(ele.innerText)
  })
  
  _cross_table.find('tbody > tr.num-tr').each((i, ele) => {
    //console.log(ele)
    rowVarList.push($(ele).attr('y_var'))
  })
  
  let data = []
  let tbody = _cross_table.find('tbody')
  rowVarList.forEach(varRow => {
    colVarList.forEach(varCol => {
      let num = Number(tbody.find(`tr.num-tr[y_var="${varRow}"] td[x_var="${varCol}"]`).text())
      let exp = Number(_cross_table.find(`tr.exp-tr[y_var="${varRow}"] td[x_var="${varCol}"]`).text())
       
      let residual = Number(tbody.find(`tr.residual-tr[y_var="${varRow}"] td[x_var="${varCol}"]`).text())
      let stdResidual = Number(tbody.find(`tr.std-residual-tr[y_var="${varRow}"] td[x_var="${varCol}"]`).text())
      let adjResidual = Number(tbody.find(`tr.adj-residual-tr[y_var="${varRow}"] td[x_var="${varCol}"]`).text())
      
      data.push({
        varRow,
        varCol,
        vars: varRow + '-' + varCol,
        num,
        exp,
        residual,
        stdResidual,
        adjResidual
      })
    })
  })
  
  // ----------------------------------
  
  let outputTable = $(`<div class="cross-table">
    交叉表
  <button type="button" class="copy-table ui button mini">複製表格</button>
  <table border="1" cellpadding="0" cellspacing="0">
    <thead>
      <tr class="x-var-tr">
        <th>列變項</th>
        <th>行變項</th>
        <th>列行變項</th>
        <th>個數</th>
        <th>期望個數</th>
        <th>殘差</th>
        <th>標準化殘差</th>
        <th>調整後殘差</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table></div>`)
  
    let outputTbody = outputTable.find('tbody')
    data.forEach(d => {
      let tr = $('<tr></tr>')
      
      Object.keys(d).forEach(key => {
        tr.append(`<td>${d[key]}</td>`)
      })
      
      if (d.adjResidual >= 1.96) {
        tr.find('td').addClass('sig')
      }
      else if (d.adjResidual <= -1.96) {
        tr.find('td').addClass('sig neg')
      }
      
      outputTbody.append(tr)
    })
    
    outputTable.find('.copy-table').click(() => {
      let line = [
        ["列變項",
        "行變項",
        "列行變項",
        "個數",
        "期望個數",
        "殘差",
        "標準化殘差",
        "調整後殘差"].join('\t')
      ]
      
      data.forEach(d => {
        line.push(Object.keys(d).map(k => d[k]).join('\t'))
      })
      
      let text = line.join('\n')
      copyPlainText(text)
    })
    
    $(".file-process-framework #preview_html").append(outputTable)
}