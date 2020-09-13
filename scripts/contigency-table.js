var _DEBUG = {
    force_fisher: false,
    force_yates: false,
    force_sig_pass: false
};

_ct_json = {};

var _load_csv_to_ct_json = function (_csv) {
    if (_csv === undefined || _csv.trim() === "") {
        return;
    }
    
    _ct_json = {};
    
    // ,性別:男性,性別:女性
    // 錄取結果:通過,35,20
    // 錄取結果:不通過,45,40
    
    // ,性別:男性,性別:女性\n錄取結果:通過,35,20\n錄取結果:不通過,45,40
    
    if (_csv.indexOf('\t') > -1) {
      _csv = _csv.split('\t').join(',')
    }
    
    setDataToPersisten(_csv)
    
    var _lines = _csv.trim().split("\n");
    
    // -----------------------------
    // 偵測是否是ANOVA模式
    if (_lines[0].trim().split(",").length === 2) {
        _csv = _anova_data_to_contingency_table(_csv);
        _lines = _csv.trim().split("\n");
    }
    
    // ------------------------------
    
    // x var
    var _x_vars = _lines[0].trim().split(",");
    var _var_x_list = [];
    var _x_name = "行變項";
    for (var _i = 1; _i < _x_vars.length; _i++) {
        var _name = _x_vars[_i].trim();
        var _pos = _name.indexOf(":");
        if (_pos > -1) {
            _x_name = _name.substr(0, _pos).trim();
            _name = _name.substring(_pos+1, _name.length).trim();
        }
        _var_x_list.push(_name);
    };
    $("#variable_x_name").val(_x_name);
    
    // --------------------
    
    // y var
    var _y_name = "列變項";
    var _var_y_list = [];
    for (var _i = 1; _i < _lines.length; _i++) {
        var _fields = _lines[_i].trim().split(",");
        
        var _name = _fields[0];
        var _pos = _name.indexOf(":");
        if (_pos > -1) {
            _y_name = _name.substr(0, _pos).trim();
            _name = _name.substring(_pos+1, _name.length ).trim();
        }
        _var_y_list.push(_name);
    }
    $("#variable_y_name").val(_y_name);
    
    // --------------------
    for (var _i = 1; _i < _lines.length; _i++) {
        var _fields = _lines[_i].trim().split(",");
        var _y = _i-1;
        for (var _j = 1; _j < _fields.length; _j++) {
            var _x = _j-1;
            
            var _x_name = _var_x_list[_x];
            var _y_name = _var_y_list[_y];
            
            // ----------
            
            var _cell = _fields[_j].trim();
            if (isNaN(_cell)) {
                _cell = 0;
            }
            _cell = eval(_cell);
            
            // ----------
            
            if (typeof(_ct_json[_x_name]) !== "object") {
                _ct_json[_x_name] = {};
            }
            _ct_json[_x_name][_y_name] = _cell;
        }
    }
    
    /*
    if ($('#zero_adjust_row').prop('checked')) {
      //console.log(_ct_json)
      //console.log(_var_y_list)
      _var_y_list.forEach(varY => {
        let isEmpty = true
        for (let i = 0; i < _var_x_list.length; i++) {
          let varX = _var_x_list[i]
          if (_ct_json[varX][varY] > 0) {
            isEmpty = false
            break
          }
        }
        
        if (isEmpty === true) {
          //console.log('delete', varY)
          for (let i = 0; i < _var_x_list.length; i++) {
            let varX = _var_x_list[i]
            delete _ct_json[varX][varY]
          }
        }
      })
     
      let hasEmptyRow = true
      for (let i = 0; i < _var_y_list.length; i++) {
        let varY = _var_y_list[i]
        let isEmpty = true
        for (let i = 0; i < _var_x_list.length; i++) {
          let varX = _var_x_list[i]
          if (_ct_json[varX][varY] > 0) {
            isEmpty = false
            break
          }
        }
        
        if (isEmpty === true) {
          hasEmptyRow = true
          break
        }
      }
      
      if (hasEmptyRow === true) {
        for (let i = 0; i < _var_y_list.length; i++) {
          let varY = _var_y_list[i]
          for (let i = 0; i < _var_x_list.length; i++) {
            let varX = _var_x_list[i]
            _ct_json[varX][varY] = _ct_json[varX][varY] + 0.5
          }
        }
      }
    }
  */
    
    _draw_contingency_table_from_ct_json();
};

var _anova_data_to_contingency_table = function (_csv) {
    //console.log("ANOVA");
    // 這樣要重新建立檔案，並且進行分割
    
    var _lines = _csv.trim().split("\n");

    // 取得名稱
    var _names = _lines[0].trim().split(",");

    var _x_list = [];
    var _y_list = [];

    var _freq_count = {};
    for (var _i = 1; _i < _lines.length; _i++) {
        var _values = _lines[_i].trim().split(",");
        var _x = _values[0].trim();
        var _y = _values[1].trim();
        if (typeof(_freq_count[_x]) === "undefined") {
            _freq_count[_x] = {};
        }
        if (typeof(_freq_count[_x][_y]) === "undefined") {
            _freq_count[_x][_y] = 0;
        }
        _freq_count[_x][_y]++;

        if ($.inArray(_x, _x_list) === -1) {
            _x_list.push(_x);
        }
        if ($.inArray(_y, _y_list) === -1) {
            _y_list.push(_y);
        }
    }
    
    // 組合成新的csv
    _csv = [];
    var _line = [""];
    for (var _i = 0; _i < _y_list.length; _i++) {
        _line.push(_names[1] + ":" + _y_list[_i]);
    }
    _csv.push(_line.join(","));
    
    for (var _i = 0; _i < _x_list.length; _i++) {
        var _x_name = _names[0] + ":" + _x_list[_i];
        _line = [_x_name];
        
        for (var _j = 0; _j < _y_list.length; _j++) {
            var _y = _y_list[_j];
            var _x = _x_list[_i];
            var _freq = 0;
            if (typeof(_freq_count[_x]) !== "undefined" && typeof(_freq_count[_x][_y]) !== "undefined") {
                _freq = _freq_count[_x][_y];
            }
            _line.push(_freq);
        }
        _csv.push(_line.join(","));
    }
    
    _csv = _csv.join("\n");
    
    return _csv;
};

var _get_ct_json_from_ui = function () {
    _ct_json = {};
    var _table = $("#contingency_table");
    
    var _var_x_name = _table.find("#variable_x_name").val().trim();
    if (_var_x_name === "") {
        _var_x_name = "X";
    }
    var _var_y_name = _table.find("#variable_y_name").val().trim();
    if (_var_y_name === "") {
        _var_y_name = "Y";
    }
    
    // --------------------------
    
    var _var_x_list = [];
    _table.find(".variable_x").each(function (_i, _input) {
        var _name = _input.value.trim();
        if (_name === "") {
            _name = "X" + _i;
        }
        _var_x_list.push(_name);
    });
    
    var _var_y_list = [];
    _table.find(".variable_y").each(function (_i, _input) {
        var _name = _input.value.trim();
        if (_name === "") {
            _name = "Y" + _i;
        }
        _var_y_list.push(_name);
    });
    
    // --------------------------
    
    _table.find("tbody tr").each(function (_y, _y_tr) {
        $(_y_tr).find(".vairable_cell").each(function (_x, _cell) {
            var _cell_value = _cell.value.trim();
            if (isNaN(_cell_value)) {
                _cell_value = 0;
            }
            _cell_value = eval(_cell_value);
            
            var _x_attr = _var_x_list[_x];
            var _y_attr = _var_y_list[_y];
            
            if (typeof(_ct_json[_x_attr]) === "undefined") {
                _ct_json[_x_attr] = {};
            }
            _ct_json[_x_attr][_y_attr] = _cell_value;
        });
    });
    
    if ($('#remove_zero_row').prop('checked')) {
      //console.log(_ct_json)
      //console.log(_var_y_list)
      
      _var_y_list.forEach(varY => {
        let isEmpty = true
        for (let i = 0; i < _var_x_list.length; i++) {
          let varX = _var_x_list[i]
          if (_ct_json[varX][varY] > 0) {
            isEmpty = false
            break
          }
        }
        
        if (isEmpty === true) {
          //console.log('delete', varY)
          for (let i = 0; i < _var_x_list.length; i++) {
            let varX = _var_x_list[i]
            delete _ct_json[varX][varY]
          }
        }
      })
    }
    
    //console.log(_ct_json)
    
    return _ct_json;
};

/**
 * 
 * @param {type} _dimension [x|y]
 * @param {type} _name
 * @returns {undefined}
 */
var _remove_ct_json_attr = function (_dimension, _name) {
    if (_dimension === undefined) {
        return;
    }
    
    _ct_json = _get_ct_json_from_ui();
    if (_dimension === "x" && typeof(_ct_json[_name]) === "object") {
        delete _ct_json[_name];
    }
    else if (_dimension === "y") {
        for (var _x_name in _ct_json) {
            if (typeof(_ct_json[_x_name][_name]) !== "undefined") {
                delete _ct_json[_x_name][_name];
            }
        }
    }
    
    _draw_contingency_table_from_ct_json();
};

$(function () {
    $('.contingency-table-col-plus button').click(function () {
        _add_ct_json_attr('x');
    });
    $('.contingency-table-row-plus button.add-row').click(function () {
        _add_ct_json_attr('y');
    });
    $('.contingency-table-row-plus button.download-csv-contingency-table').click(function () {
        _download_csv_contingency_table();
    });
    $('.contingency-table-row-plus button.download-csv-anova-raw').click(function () {
        _download_csv(false);
    });
    $('.contingency-table-row-plus button.download-csv-anova-encoded').click(function () {
        _download_csv(true);
    });
    $('.contingency-table-row-plus button.download-csv-friedman-test-y').click(function () {
        _download_csv_friedman_test("y");
    });
    $('.contingency-table-row-plus button.download-csv-friedman-test-x').click(function () {
        _download_csv_friedman_test("x");
    });
});

var _download_csv_contingency_table = function () {
    var _output = [];
    
    // --------------------------
    
    var _y_name = $("#variable_y_name").val().trim();
    var _y_attr_list = _get_attr("y");
    var _x_name = $("#variable_x_name").val().trim();
    var _x_attr_list = _get_attr("x");
    
    // -----------------
    
    var _line = [""];
    for (var _i = 0; _i < _x_attr_list.length; _i++) {
        _line.push(_x_name + ":" + _x_attr_list[_i]);
    }
    _output.push(_line.join(","));
    
    // -----------------
    
    var _json = _get_ct_json_from_ui();
    
    var _rows = {};
    for (var _x in _json) {
        for (var _y in _json[_x]) {
            var _freq = _json[_x][_y];
            if (typeof(_rows[_y]) === "undefined") {
                _rows[_y] = [_y_name + ":" + _y];
            }
            _rows[_y].push(_freq);
        }
    }
    
    for (var _r in _rows) {
        _output.push(_rows[_r].join(","));
    }
    
    
    // --------------------------
    
    _output = _output.join("\n");
    //console.log(_output);
    var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
  
    var local = new Date(utc);
    var _time = local.toJSON().slice(0,19).replace(/:/g, "-");
    var _filename = $("#variable_y_name").val().trim() + "_" + $("#variable_x_name").val().trim() + "-" + _time + ".csv";
    
    _download_file(_output, _filename, "csv");
};

var _download_csv = function (_encoded) {
    if (typeof(_encoded) === "undefined") {
        _encoded = false;
    }
    
    var _output = [];
    
    // -------------------------
    
    var _y_name = "var_x";
    var _x_name = "var_y";
    
    if (_encoded === false) {
        _y_name = $("#variable_y_name").val().trim();
        _x_name = $("#variable_x_name").val().trim();
    }
    
    _output.push([_y_name, _x_name].join(","));
    // -------------------------
    
    var _json = _get_ct_json_from_ui();
    
    var _x_count = 1;
    for (var _x in _json) {
        var _y_count = 1;
        for (var _y in _json[_x]) {
            var _freq = _json[_x][_y];
            for (var _i = 0; _i < _freq; _i++) {
                if (_encoded === true) {
                    _output.push([_y_count, _x_count].join(","));
                }
                else {
                    _output.push([_y, _x].join(","));
                }
            }
            _y_count++;
        }
        _x_count++;
    }
    
    // -------------------------
    
    _output = _output.join("\n");
    //console.log(_output);
    var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
  
    var local = new Date(utc);
    var _time = local.toJSON().slice(0,19).replace(/:/g, "-");
    var _filename = $("#variable_y_name").val().trim() + "_" + $("#variable_x_name").val().trim() + "-" + _time + ".csv";
    
    _download_file(_output, _filename, "csv");
};

var _add_ct_json_attr = function (_dimension) {
    _ct_json = _get_ct_json_from_ui();
    var _id = _dimension.toUpperCase() + (_count_attr(_dimension) + 1);
    if (_dimension === "x") {
        _ct_json[_id] = {};
        var _y_list = _get_attr('y');
        for (var _i = 0; _i < _y_list.length; _i++) {
            _ct_json[_id][_y_list[_i]] = 0;
        }
    }
    else {
        for (var _x in _ct_json) {
            _ct_json[_x][_id] = 0;
        }
    }
    
    
    _draw_contingency_table_from_ct_json();
};


var _download_csv_friedman_test = function (_dimension) {
    if (typeof(_dimension) === "undefined") {
        _dimension = "x";
    }

    var _output = [];
    
    // -------------------------
    
    var _attr_list = _get_attr(_dimension);
    var _line = [];
    for (var _i = 0; _i < _attr_list.length; _i++) {
        var _attr = _attr_list[_i];
        if (isNaN(_attr) === false) {
            _attr = "var_" + _attr;
        }
        _line.push(_attr);
    }
    _output.push(_line.join(","));
    
    
    // -------------------------
    
    var _json = _get_ct_json_from_ui();
    
    var _total = 0;
    for (var _x in _json) {
        for (var _y in _json[_x]) {
            var _freq = _json[_x][_y];
            _total = _total + _freq;
        }
    }
    
    var _x_attr = _get_attr("x");
    var _y_attr = _get_attr("y");
    
    var _zero_x_list = [];
    var _zero_y_list = [];
    //var _error_combination = [];
    var _skip_count = 0;
    
    while (true) {
        var _min_x_list = [];
        var _min_y_list = [];
        var _min_freq_list = [];
    
        // 先找出行列中最小的值
        for (var _i = 0; _i < _attr_list.length; _i++) {
            var _min_x = null;
            var _min_y = null;
            var _min_freq = null;


            for (var _x_count = 0; _x_count < _x_attr.length; _x_count++) {
                var _x = _x_attr[_x_count];
                if ($.inArray(_x, _min_x_list) > -1) {
                    continue;
                }

                var _y_count = 0;
                for (var _y_count = 0; _y_count < _y_attr.length;_y_count++) {
                    var _y = _y_attr[_y_count];
                    if ($.inArray(_y, _min_y_list) > -1) {
                        continue;
                    }
                    //else if (_min_freq_list.length === 0 
                    //        && _zero_x_list.length !== 3
                    //        && ($.inArray(_x, _zero_x_list) > -1 || $.inArray(_y, _zero_y_list) > -1)) {
                    //    continue;
                    //}

                    var _freq = _json[_x][_y];
                    if ((_min_freq === null && _freq !== 0) || (_freq > _min_freq && _freq !== 0)) {
                        if (_skip_count > 0) {
                            _skip_count--;
                        }
                        else {
                            _min_freq = _freq;
                            _min_x = _x;
                            _min_y = _y;
                        }
                    }
                }
            }
            
            if (_min_freq === null) {
                console.log("找不到合適的方案");
                console.log([_min_x, _min_y, _min_freq]);
                _i = 0;
                _min_x_list = [];
                _min_y_list = [];
                _min_freq_list = [];
                _skip_count++;
            }
            else {
                _min_x_list.push(_min_x);
                _min_y_list.push(_min_y);
                _min_freq_list.push(_min_freq);
                console.log([_min_x, _min_y, _min_freq]);
            }
        }   // for (var _i = 0; _i < _attr_list.length; _i++) {
                
        //console.log([_min_x_list, _min_y_list, _min_freq_list]);
        //var _freq = _min_freq_list[0];
        //for (var _i = 1; _i < _min_freq_list.length; _i++) {
        //    if (_min_freq_list[_i] < _freq) {
        //        _freq = _min_freq_list[_i];
        //    }
        //}
        var _freq = 1;
        var _row = {};
        for (var _i = 0; _i < _attr_list.length; _i++) {
            _row[_attr_list[_i]] = 0;
        }
        
        var _line = [];
        if (_dimension === "x") {
            for (var _i = 0; _i < _min_x_list.length; _i++) {
                var _x = _min_x_list[_i];
                var _y = _min_y_list[_i];
                _row[_x] = _y;
                _json[_x][_y] = _json[_x][_y] - 1;
                
                if (_json[_x][_y] === 0) {
                    _zero_x_list.push(_x);
                    _zero_y_list.push(_y);
                }
                
            }
            for (var _i = 0; _i < _attr_list.length; _i++) {
                _line.push(_row[_attr_list[_i]]);
            }
        }
        else {
            for (var _i = 0; _i < _min_y_list.length; _i++) {
                var _x = _min_x_list[_i];
                var _y = _min_y_list[_i];
                _row[_y] = _x;
                _json[_x][_y] = _json[_x][_y] - 1;
            }
            for (var _i = 0; _i < _attr_list.length; _i++) {
                _line.push(_row[_attr_list[_i]]);
            }
        }
        _line = _line.join(",");
        for (var _i = 0; _i < _freq; _i++) {
            _output.push(_line);
        }
        
        //console.log([_output.length, _total]);
        //console.log(_line);
        //break;
        if (_output.length > (_total/_attr_list.length))  {
            break;
        }
    }
        
    //console.log(_output.join("\n"));
    //return ;
        
    
    
    
    // -------------------------
    
    _output = _output.join("\n");
    
    var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
  
    var local = new Date(utc);
    var _time = local.toJSON().slice(0,19).replace(/:/g, "-");
    var _filename = $("#variable_y_name").val().trim() + "_" + $("#variable_x_name").val().trim() + "-" + _time + ".csv";
    
    //console.log(_output);
    _download_file(_output, _filename, "csv");
};

// ------------------------------

var _count_attr = function (_dimension) {
    var _count = 0;
    if (_dimension === "x") {
        for (var _x in _ct_json) {
            _count++;
        }
    }
    else {
        for (var _x in _ct_json) {
            for (var _y in _ct_json[_x]) {
                _count++;
            }
            break;
        }
    }
    return _count;
};

var _get_attr = function (_dimension) {
    var _attr_list = [];
    if (_dimension === 'x') {
        for (var _x in _ct_json) {
            _attr_list.push(_x);
        }
    }
    else {
        for (var _x in _ct_json) {
            for (var _y in _ct_json[_x]) {
                _attr_list.push(_y);
            }
            break;
        }
    }
    return _attr_list;
};

var _draw_contingency_table_from_ct_json = function () {
    //console.log(_ct_json);
    
    _reset_contingency_table();
    
    // -------------------------------
    
    var _x_count = 0;
    var _y_count;
    
    var _table = $("#contingency_table");
    var _tbody = _table.find("tbody");
    var _x_tr = _table.find(".variable_x_tr");
    for (var _x_name in _ct_json) {
        _x_tr.append(_create_vairable_th("x",_x_name));
        _x_count++;
        
        _y_count = 0;
        for (var _y_name in _ct_json[_x_name]) {
            
            
            if (_tbody.find('.variable_y[value="' + _y_name + '"]').length === 0) {
                var _y_th = _create_vairable_th("y",_y_name);
                
                var _tr = _tbody.find('tr:first');
                if (_tr.find("th").length > 1) {
                    // 表示第一列已經有資料
                    _tr = $('<tr></tr>').appendTo(_tbody);
                }
                
                _tr.append(_y_th);
                
                // ---------------------------
            }
            
            // -------------------------------
            
            var _cell_td = _create_cell_td(_ct_json[_x_name][_y_name]);
            _tbody.find('tr:eq(' + _y_count + ')').append(_cell_td);
            
            _y_count++;
        }
    }
    
    // ------------------------------
    // 設定span
    if (_x_count < 1) {
        _x_count = 1;
    }
    if (_y_count < 1) {
        _y_count = 1;
    }
    $(".variable_x_th").attr("colspan", _x_count);
    $(".variable_y_th").attr("rowspan", _y_count);
    
    _draw_result_table();
};

var _reset_contingency_table = function () {
    var _table = $("#contingency_table");
    _table.find(".cell_td").remove();
    _table.find(".variable_th").remove();
    _table.find("tbody tr:not(:first)").remove();
};

var _create_remove_attr_button = function (_dimension, _name) {
    var _ele = $('<button class="ui icon button" type="button" data-dimension="' + _dimension + '" data-name="' + _name + '">'
        + '<i class="minus square icon remove_attr" ></i>'
        + '</button>');
    _ele.click(function () {
        var _this = $(this);
        var _dimension = _this.data("dimension");
        var _name = _this.data("name");
        _remove_ct_json_attr(_dimension, _name);
    });
    return _ele;
};

var _create_vairable_th = function (_dimension, _name) {
    var _ele = $('<th class="variable_th">'
            + '<div class="ui action input">'
            + '<input type="text" value="' + _name + '" class="variable_' + _dimension + '" />'
            + '</div>'
            + '</th>');
    _ele.find("div").append(_create_remove_attr_button(_dimension, _name));
    _ele.find('.variable_' + _dimension).change(function () {
        _draw_result_table();
    });
    return _ele;
};

var _create_cell_td = function (_cell) {
    var _ele = $('<td class="cell_td"><input type="text" value="' + _cell + '" class="vairable_cell" /></td>');
    _ele.find('input').change(function () {
        _draw_result_table();
    });
    return _ele;
};

// --------------------------------------

var _is_display_percent = function () {
    return ($("#input_display_percent:checked").length === 1);
};

var _x_var_count;
var _y_var_count;
var _draw_result_table = function () {
    _ct_json = _get_ct_json_from_ui();
    _reset_result();
    
    setSettingToPersisten()
    
    //var _n = 0.07215074898001728;
    //console.log([precision_string(_n, 3), _n]);
    //return;
    
    var _panel = $(".file-process-framework");
    var _result = _panel.find("#preview_html");
    
    var _cross_table = $('<div class="cross-table">交叉表<table border="1" cellpadding="0" cellspacing="0">'
        + '<thead>'
            + '<tr class="x-var-tr"><th colspan="3" rowspan="2"></th><th class="x-var-name"></th><th rowspan="2" valign="bottom">' + '列總合' + '</th></tr>'
            + '<tr class="x-vars-tr"></tr></thead>'
        + '<tbody></tbody>'
        + '<tfoot>'
            + '<tr class="x-sum num-tr"><th rowspan="5" colspan="2" align="left" valign="top">' + '行總合' + '</th><th align="left" valign="top">' + '個數' + '</th></tr>'
            + '<tr class="x-sum exp-tr"><th align="left" valign="top">' + '期望個數' + '</th></tr>' 
            + '<tr class="x-sum per y-per-tr"><th align="left" valign="top">' + '(<span class="y-var-name"></span>)列之內的百分比' + '</th></tr>'
            + '<tr class="x-sum per x-per-tr"><th align="left" valign="top">' + '(<span class="x-var-name"></span>)欄之內的百分比' + '</th></tr>'
            + '<tr class="x-sum per per-tr"><th align="left" valign="top">' + '整體百分比' + '</th></tr>'
        + '</tfoot>'
        + '</table></div>');

    if (_is_display_percent() === false) {
        _cross_table.find('tfoot tr.per').remove();
        _cross_table.find('tfoot tr.num-tr th:first').attr('rowspan', 2);
    }

    if ($("#input_table_style_display:checked").length === 0) {
        _cross_table.addClass("analyze-result");
    }
    _cross_table.appendTo(_result);
    
    // ------------------
    // 先畫出x變數
    
    var _x_var_name = _cross_table.find(".x-var-name:first");
    var _x_name = $("#variable_x_name").val().trim();
    _x_var_name.html(_x_name);
    
    var _x_vars_tr = _cross_table.find('.x-vars-tr');
    _x_vars_count = 0;
    var _x_vars_list = [];
    $("#contingency_table input.variable_x").each(function (_i, _input) {
        var _name = _input.value.trim();
        if (_name !== "") {
            $('<th>' + _name + '</th>').appendTo(_x_vars_tr);
            _x_vars_list.push(_name);
            _x_vars_count++;
        }
    });
    _x_var_name.attr("colspan", _x_vars_count);
    
    // ----------------------
    // 再畫出y變數
    
    
    var _tbody = _cross_table.find('tbody');
    var _y_var_name;
    _y_vars_count = 0;
    var _y_name = $("#variable_y_name").val().trim();
    var _rowspan = 8;
    if (_is_display_percent() === false) {
        _rowspan = 5;
    }
    $("#contingency_table input.variable_y").each(function (_i, _input) {
        var _name = _input.value.trim();
        if (_name === "") {
            return;
        }
        
        // -----------
        
        
        var _tr_num = $('<tr y_var="' + _name + '" class="num-tr"><th rowspan="' + _rowspan + '" class="bottom-border-thin" valign="top" align="left">' + _name + '</th>'
                + '<th valign="top" align="left">' + '個數' + '</th></tr>').appendTo(_tbody);
        var _tr_exp = $('<tr y_var="' + _name + '" class="exp-tr"><th valign="top" align="left">' + '期望個數' + '</th></tr>').appendTo(_tbody);
        if (_is_display_percent()) {
            var _tr_y_per = $('<tr y_var="' + _name + '" class="y-per-tr"><th valign="top" align="left">' + '(<span class="y-var-name"></span>)列之內的百分比' + '</th></tr>').appendTo(_tbody);
            var _tr_x_per = $('<tr y_var="' + _name + '" class="x-per-tr"><th valign="top" align="left">' + '(<span class="x-var-name"></span>)欄之內的百分比' + '</th></tr>').appendTo(_tbody);
            var _tr_global = $('<tr y_var="' + _name + '" class="global-tr"><th valign="top" align="left">' + '整體百分比' + '</th></tr>').appendTo(_tbody);
        }
        var _tr_residual = $('<tr y_var="' + _name + '" class="residual-tr"><th valign="top" align="left">' + '殘差' + '</th></tr>').appendTo(_tbody);
        var _tr_std_residual = $('<tr y_var="' + _name + '" class="std-residual-tr"><th valign="top" align="left">' + '標準化殘差' + '</th></tr>').appendTo(_tbody);
        var _tr_adj_residual = $('<tr y_var="' + _name + '" class="adj-residual-tr bottom-border-thin"><th valign="top" align="left">' + '調整後殘差' + '</th></tr>').appendTo(_tbody);
        
        // -----------
        
        if (_y_vars_count === 0) {
            // 插入y變數的名字
            _y_var_name = $('<th class="y-var-name bottom-border-thin" valign="top" align="left"></th>')
                    .prependTo(_tr_num);
            _y_var_name.html(_name);
        }
        _y_vars_count++;
        
        // -----------
        
        for (var _j = 0; _j < _x_vars_count+1; _j++) {
            var _td = $('<td align="right"></td>');
            if (_j < _x_vars_count) {
                _td.attr('x_var', _x_vars_list[_j]);
            }
            else {
                _td.addClass('y-sum');
            }
            _td.clone().appendTo(_tr_num);
            _td.clone().appendTo(_tr_exp);
            if (_is_display_percent()) {
                _td.clone().appendTo(_tr_y_per);
                _td.clone().appendTo(_tr_x_per);
                _td.clone().appendTo(_tr_global);
            }
            _td.clone().appendTo(_tr_residual);
            _td.clone().appendTo(_tr_std_residual);
            _td.clone().appendTo(_tr_adj_residual);
        }
        
        // -------------------
        
    }); // $("#contingency_table input.variable_y").each(function (_i, _input) {
    
    _y_var_name.attr('rowspan', _y_vars_count * _rowspan);
    _cross_table.find('.x-var-name').html(_x_name);
    _cross_table.find('.y-var-name').html(_y_name);
    
    //return;
    
    // ------------------------
    // 結尾
    
    var _tfoot_num_tr = _cross_table.find('tfoot > .x-sum.num-tr');
    var _tfoot_exp_tr = _cross_table.find('tfoot > .x-sum.exp-tr');
    var _tfoot_y_per_tr = _cross_table.find('tfoot > .x-sum.y-per-tr');
    var _tfoot_x_per_tr = _cross_table.find('tfoot > .x-sum.x-per-tr');
    var _tfoot_per_tr = _cross_table.find('tfoot > .x-sum.per-tr');
    
    for (var _j = 0; _j < _x_vars_count+1; _j++) {
        var _td = $('<td align="right"></td>');
        if (_j < _x_vars_count) {
            _td.attr('x_var', _x_vars_list[_j]);
        }
        else {
            _td.addClass('total-sum');
        }
        _td.clone().appendTo(_tfoot_num_tr);
        _td.clone().appendTo(_tfoot_exp_tr);
        _td.clone().appendTo(_tfoot_y_per_tr);
        _td.clone().appendTo(_tfoot_x_per_tr);
        _td.clone().appendTo(_tfoot_per_tr);
    }
    
    //_result.html("1");
    
    
    _draw_num_cell();
};

var _x_sum_list;
var _y_sum_list;
var _total_sum;

var _is_sum_too_small;
var _is_zero_cell_existed;
var _is_sum_zero_cell_existed;

var _draw_num_cell = function () {
    _x_sum_list = {};
    _y_sum_list = {};
    _total_sum = 0;
    _is_sum_too_small = true;
    _is_zero_cell_existed = false;
    
    var _cross_table = $("#preview_html .cross-table");
    
    for (var _x_var_name in _ct_json) {
        for (var _y_var_name in _ct_json[_x_var_name]) {
            var _num = _ct_json[_x_var_name][_y_var_name];
            
            if (_num === 0) {
                _is_zero_cell_existed = true;
            }
            
            _cross_table.find('.num-tr[y_var="' + _y_var_name + '"] [x_var="' + _x_var_name +'"]').html(_num);
            
            if (typeof(_x_sum_list[_x_var_name]) === 'undefined') {
                _x_sum_list[_x_var_name] = 0;
            }
            _x_sum_list[_x_var_name] += _num;
            
            if (typeof(_y_sum_list[_y_var_name]) === 'undefined') {
                _y_sum_list[_y_var_name] = 0;
            }
            _y_sum_list[_y_var_name] += _num;
            
            _total_sum += _num;
        }
    }
    
    _is_sum_zero_cell_existed = false;
    for (var _x_var_name in _x_sum_list) {
        var _sum = _x_sum_list[_x_var_name];
        if (_sum >= 20) {
            _is_sum_too_small = false;
        }
        _cross_table.find('.x-sum.num-tr [x_var="' + _x_var_name + '"]').html(_sum);
        _cross_table.find('.x-sum.exp-tr [x_var="' + _x_var_name + '"]').html(_sum);
        
        if (_sum === 0) {
            _is_sum_zero_cell_existed = true;
            _cross_table.find('.x-sum.num-tr [x_var="' + _x_var_name + '"]').addClass('zero-sum');
        }
    }
    
    _cross_table.find('tbody .y-per-tr .y-sum').html(precision_string(100, 1) + '%');
    
    for (var _y_var_name in _y_sum_list) {
        var _sum = _y_sum_list[_y_var_name];
        if (_sum >= 20) {
            _is_sum_too_small = false;
        }
        
        _cross_table.find('.num-tr[y_var="' + _y_var_name + '"] .y-sum').html(_sum);
        _cross_table.find('.exp-tr[y_var="' + _y_var_name + '"] .y-sum').html(_sum);
        
        if (_sum === 0) {
            _is_sum_zero_cell_existed = true;
            _cross_table.find('.num-tr[y_var="' + _y_var_name + '"] .y-sum').addClass('zero-sum');
        }
    }
    
    _cross_table.find('.x-sum.x-per-tr td[x_var]').html(precision_string(100, 1) + '%');
    
    _cross_table.find('.x-sum.num-tr .total-sum').html(_total_sum);
    _cross_table.find('.x-sum.exp-tr .total-sum').html(_total_sum);
    _cross_table.find('.x-sum.y-per-tr .total-sum').html(precision_string(100, 1) + '%');
    _cross_table.find('.x-sum.x-per-tr .total-sum').html(precision_string(100, 1) + '%');
    _cross_table.find('.x-sum.per-tr .total-sum').html(precision_string(100, 1) + '%');
    
    var _panel = $(".file-process-framework");
    var _result = _panel.find("#preview_html");
    if (_is_sum_zero_cell_existed === true) {
        var _zero_var_list = [];
        _cross_table.find('.zero-sum').each(function (_i, _td) {
            _td = $(_td);
            if (_td.hasClass('y-sum')) {
                _zero_var_list.push(_td.parent().attr('y_var'));
            }
            else {
                _zero_var_list.push(_td.attr('x_var'));
            }
        });
        
        $('<div>因為「' + _zero_var_list.join("」、「") + '」的總合個數為0，無法進行列聯表分析，建議刪除上述變項再進行分析。</div>').appendTo(_result);
        _cross_table.hide();
        return;
    }
    
    _draw_x_percent_cell();
    _draw_y_percent_cell();
    _draw_cell_percent_cell();
    
    drawPlainTable(_cross_table)
};

_x_per_list = {};
var _draw_x_percent_cell = function () {
    var _cross_table = $("#preview_html .cross-table");
    for (var _x_var_name in _x_sum_list) {
        var _num = _x_sum_list[_x_var_name];
        var _per = (_num) / _total_sum * 100;
        _x_per_list[_x_var_name] = _per / 100;
        var _per_text = precision_string(_per, 1) + '%';
        //console.log([_x_var_name, _num, _per]);
        
        _cross_table.find('.x-sum.y-per-tr [x_var="' + _x_var_name + '"]').html(_per_text);
        _cross_table.find('.x-sum.per-tr [x_var="' + _x_var_name + '"]').html(_per_text);
    }
};

_y_per_list = {};
var _draw_y_percent_cell = function () {
    var _cross_table = $("#preview_html .cross-table");
    for (var _y_var_name in _y_sum_list) {
        var _num = _y_sum_list[_y_var_name];
        var _per = (_num) / _total_sum * 100;
        _y_per_list[_y_var_name] = _per / 100;
        var _per_text = precision_string(_per, 1) + '%';
        //console.log([_x_var_name, _num, _per]);
        
        _cross_table.find('.x-per-tr[y_var="' + _y_var_name + '"] .y-sum').html(_per_text);
        _cross_table.find('.global-tr[y_var="' + _y_var_name + '"] .y-sum').html(_per_text);
    }
};

var _get_percent_text = function (_per) {
    _per = _per*100;
    return precision_string(_per, 1) + '%';
};

var _is_cell_exp_too_small;
var _draw_cell_percent_cell = function () {
    
    _is_cell_exp_too_small = false;
    
    var _chi_squared = 0;
    var _yates_chi_squared = 0;
    
    var _cross_table = $("#preview_html .cross-table");
    var _tbody = _cross_table.find("tbody");
    for (var _x_var_name in _ct_json) {
        for (var _y_var_name in _ct_json[_x_var_name]) {
            var _num = _ct_json[_x_var_name][_y_var_name];
            
            var _total_per = _num / _total_sum;
            _tbody.find('tr.global-tr[y_var="' + _y_var_name + '"] td[x_var="' + _x_var_name + '"]').html(_get_percent_text(_total_per));
            
            var _y_per = _num / _y_sum_list[_y_var_name];
            _tbody.find('tr.y-per-tr[y_var="' + _y_var_name + '"] td[x_var="' + _x_var_name + '"]').html(_get_percent_text(_y_per));
            
            var _x_per = _num / _x_sum_list[_x_var_name];
            _tbody.find('tr.x-per-tr[y_var="' + _y_var_name + '"] td[x_var="' + _x_var_name + '"]').html(_get_percent_text(_x_per));
            
            var _exp = (_x_sum_list[_x_var_name] * _y_sum_list[_y_var_name]) / _total_sum;
            _tbody.find('tr.exp-tr[y_var="' + _y_var_name + '"] td[x_var="' + _x_var_name + '"]').html(precision_string(_exp, 1));
//            if (_num === 5) {
//                console.log({
//                    "exp": _exp,
//                    "x": _x_sum_list[_x_var_name],
//                    "y": _y_sum_list[_y_var_name],
//                    "n": _total_sum
//                });
//            }
            
            if (_exp < 5) {
                _is_cell_exp_too_small = true;
            }
            
            var _residual = _num - _exp;
            _tbody.find('tr.residual-tr[y_var="' + _y_var_name + '"] td[x_var="' + _x_var_name + '"]').html(precision_string(_residual, 1));
            
            var _std_residual = _residual / Math.sqrt(_exp);
            _tbody.find('tr.std-residual-tr[y_var="' + _y_var_name + '"] td[x_var="' + _x_var_name + '"]').html(precision_string(_std_residual, 1));
            
            var _adj_residual = _residual / Math.sqrt( _exp * (1 - _x_per_list[_x_var_name]) * (1 - _y_per_list[_y_var_name]) );
            //console.log([_residual, _exp, _x_per_list[_x_var_name], _y_per_list[_y_var_name]]);
            _tbody.find('tr.adj-residual-tr[y_var="' + _y_var_name + '"] td[x_var="' + _x_var_name + '"]').html(precision_string(_adj_residual, 1));
            
            if (Math.abs(_adj_residual) > 1.96) {
                _tbody.find('tr[y_var="' + _y_var_name + '"] td[x_var="' + _x_var_name + '"]').addClass("sig");
                if (_adj_residual < -1.96) {
                    _tbody.find('tr[y_var="' + _y_var_name + '"] td[x_var="' + _x_var_name + '"]').addClass("neg");
                }
            }
            
            _chi_squared += (_std_residual * _std_residual);
            var _y = ( Math.pow((Math.abs(_residual) - 0.5), 2) / _exp );
            
            _yates_chi_squared += _y;
            //console.log([_yates_chi_squared, _y]);
        }
    }
    
    _draw_contingency_table_analyze_result(_chi_squared, _yates_chi_squared);
};

var _draw_contingency_table_analyze_result = function (_chi_squared, _yates_chi_squared) {
    //console.log([_yates_chi_squared]);
    
    // ------------------------
    
    var _panel = $(".file-process-framework");
    var _result = _panel.find("#preview_html");
    
    
    //console.log(_chi_squared);
    var _title_container = $('<div>卡方檢定結果：</div>').appendTo(_result);
    
    var _button = $('<button type="button" class="ui icon button tiny teal speak skip"><i class="talk icon"></i></button>').prependTo(_title_container);
    _button.click(function () {
        /*
        var _text = _result.find('.chi-squared-container:first').clone();
        _text.find('.skip').each(function(_i, _span) {
            _span = $(_span);
            var _alt = "";
            if (typeof(_span.attr("alt")) === 'string') {
                _alt = _span.attr("alt");
            }
            _span.html(_alt);
        });
        _text = _text.text();
        _text = "列聯表分析結果顯示：" + _text + "列聯表分析結束。";
        console.log(_text);
        responsiveVoice.speak(_text, 'Chinese Female', {
                    rate: 1.2
                });
        */
        var _text = "";
        _result.find('.chi-squared-container:first .speak').each(function(_i, _span) {
            if ($(_span).attr("alt") === undefined) {
                _text += $(_span).text();
            }
            else {
                _text += $(_span).attr("alt");
            }
        });
        _text = "卡方檢定結果顯示。" + _text + "卡方檢定結束。";
        _text = _text.replace(/「|」/g, '');
        console.log(_text);
        var _speak_list = _text.split("。");
        if (navigator.userAgent.match(/Android/)) {
            _speak_list = [_text];
        }
        
//        var _next = function (_i) {
//            _i++;
//            _loop(_i);
//        };
        //var _timer;
        var _loop = function (_i) {
            if (_i < _speak_list.length) {
                responsiveVoice.speak(_speak_list[_i], 'Chinese Female', {
                    rate: 1.2,
                    onend: function () {
                        //clearTimeout(_timer);
                        _i++;
                        _loop(_i);
                        console.log(_i);
                    }
                });
                
//                console.log(_speak_list[_i].length * 1000 * 0.3 );
//                _timer = setTimeout(function () {
//                    console.log(_i);
//                    _next(_i);
//                }, _speak_list[_i].length * 1000 * 0.3 );
            }
        };
        _loop(0);
        
    });
    
    // -------------------
    
    var _chi_squared_container = $('<ul class="chi-squared-container"></ul>').appendTo(_result);
    
    if ($("#input_table_style_display:checked").length === 0) {
        _chi_squared_container.addClass("analyze-result");
    }
    
    //console.log([_x_var_count, _y_var_count]);
    var _fisher_mode = false;
    if ($("#input_enable_fisher:checked").length === 1 
            && _is_cell_exp_too_small === true
            && _is_sum_too_small === true
            && _x_vars_count === 2
            && _y_vars_count === 2) {
        _fisher_mode = true;
    }
    if (_DEBUG.force_fisher === true) {
        _fisher_mode = true;
    }
    
    // ------------.
    var _yates_mode = false;
    if ($("#input_enable_yates:checked").length === 1 
            && _is_cell_exp_too_small === true
            && _total_sum >= 20
            && _x_vars_count === 2
            && _y_vars_count === 2) {
        _yates_mode = true;
    }
    if (_DEBUG.force_yates === true) {
        _yates_mode = true;
    }
    
    // ------------
    
    var _df = (_x_vars_count-1) * (_y_vars_count-1);
    
    var _p;
    var _has_sig = false;
    var _x_var_name = $("#variable_x_name").val().trim();
    var _y_var_name = $("#variable_y_name").val().trim();
    
    var _sig_pass = '，達到<span class="skip">α = </span> 0.05的顯著水準 ，因此拒絕虛無假設，接受對立假設。'
                    + '表示<span class="speak">「' + _y_var_name + '」的不同對「' + _x_var_name + '」有顯著的影響。</span></li>';
    var _sig_not_pass = '，未達<span class="skip">α = </span> 0.05的顯著水準，因此無法拒絕虛無假設。'
                    + '表示<span class="speak">「' + _y_var_name + '」的不同對「' + _x_var_name + '」並沒有顯著的影響。</span></li>';
    
    if (_fisher_mode) {
        _p = _calc_fisher_exact_test();
//        if (_is_zero_cell_existed === false) {
//            _p = _calc_fisher_exact_test();
//        }
//        else {
//            //console.log(1);
//            _p = _calc_fisher_exact_test_with_zero();
//        }
        
        var _text = '費雪爾正確概率檢定之雙尾機率值<span class="skip" alt="為"> p值 = </span> ' + precision_string(_p, 3) + ' 。';
        if (Math.abs(_p) < 0.05) {
            _chi_squared_container.append('<li>' + _text + _sig_pass + '</li>');
            _has_sig = true;
        }
        else {
            _chi_squared_container.append('<li>' + _text + _sig_not_pass + '</li>');
        }
    }
    else if (_yates_mode) {
        //console.log([_yates_chi_squared, precision_string(_yates_chi_squared, 3)]);
        _p = chisqrprob(_df, _yates_chi_squared);
        var _text = '使用葉氏連續性校正之後的卡方檢定統計量<span class="skip" alt="為">χ<sup>2</sup> = </span>' + precision_string(_chi_squared, 3) 
                    + ' ，<span class="skip" alt="機率值為">p值 = </span>' + precision_string(_p, 3) + ' ';
        if (Math.abs(_p) < 0.05) {
            _chi_squared_container.append('<li>' + _text + _sig_pass + '</li>');
            _has_sig = true;
        }
        else {
            _chi_squared_container.append('<li>' + _text + _sig_not_pass + '</li>');
        }
    }
    else {
        _p = chisqrprob(_df, _chi_squared);
        var _text = '卡方檢定統計量<span class="skip" alt="為">χ<sup>2</sup> = </span> ' + precision_string(_chi_squared, 3) 
                    + ' ，<span class="skip" alt="機率值為">p值 = </span>' + precision_string(_p, 3) + ' ';
        if (Math.abs(_p) < 0.05) {
            _chi_squared_container.append('<li>' + _text + _sig_pass + '</li>');
            _has_sig = true;
        }
        else {
            _chi_squared_container.append('<li>' + _text + _sig_not_pass + '</li>');
        }
        
    }
    
    if (_has_sig === true || _DEBUG.force_sig_pass) {
        
        var _cramer_v_k = _x_vars_count;
        if (_y_vars_count < _x_vars_count) {
            _cramer_v_k = _y_vars_count;
        }
        var _cramer_v = Math.sqrt(_chi_squared / (_total_sum * (_cramer_v_k - 1)) );
        var _cramer_v_desc = "，<span class='speak'>屬於無相關。</span>";
        if (_cramer_v === 1) {
            _cramer_v_desc = "，<span class='speak'>屬於完全相關。</span>";
        }
        else if (_cramer_v > 0.7) {
            _cramer_v_desc = "，<span class='speak'>屬於高度相關。</span>";
        }
        else if (_cramer_v > 0.4) {
            _cramer_v_desc = "，<span class='speak'>屬於中度相關。</span>";
        }
        else if (_cramer_v > 0.1) {
            _cramer_v_desc = "，<span class='speak'>屬於低度相關。</span>";
        }
        var _cramer_v_li = $('<li><span class="speak">「' + _y_var_name + '」跟「' + _x_var_name + '」'
            + '</span>之相關係數Cramer\'s V值<span class="skip" alt="為">(介於0~1之間)</span>為 ' + precision_string(_cramer_v, 3) + ' ' + _cramer_v_desc + '</li>')
            .appendTo(_chi_squared_container);
        
        // -----------------------------------
        var _tau_container = $('<li><span class="skip" alt="接著進行"></span>Goodman與Kruskal的預測係數Tau值的分析：<ul></ul></li>')
                .appendTo(_chi_squared_container);
        var _tau_container_ul = _tau_container.find('ul');

        // ---------------------------
        // y tau

        $('<li>以「' + _y_var_name + '」來預測「' + _x_var_name + '」的正確比例為' 
                + precision_string(_calc_y2x_tau()*100, 3) + '%。</li>')
                .appendTo(_tau_container_ul);

        // ---------------------------
        // x tau

        $('<li>以「' + _x_var_name + '」來預測「' + _y_var_name + '」的正確比例為' 
                + precision_string(_calc_x2y_tau()*100, 3) + '%。</li>')
                .appendTo(_tau_container_ul);

        // ---------------------------
        
        var _sig_cell = $('.cross-table tbody tr.adj-residual-tr td.sig');
        if (_sig_cell.length > 0) {
            var _cell_container = $('<li><span class="skip" alt="最後進行"></span>細格統計檢定分析：<ul></ul></li>');
            var _cell_ul = _cell_container.find('ul');
            _sig_cell.each(function (_i, _td) {
                var _td = $(_td);
                var _adj_residual = eval(_td.text());
                var _x_var = _td.attr('x_var');
                var _y_var = _td.parent().attr('y_var');

                var _text = '<span class="speak">「' + _y_var + '」中「' + _x_var +'」</span><span class="speak" alt="的"></span>之調整後殘差為' + _adj_residual + '，表示<span class="speak">觀察個數顯著';
                if (_adj_residual > 0) {
                    _text += "高於期望個數。</span>";
                }
                else {
                    _text += "低於期望個數。</span>";
                }
                $('<li>' + _text + '</li>').appendTo(_cell_ul);
            });
            _cell_container.appendTo(_chi_squared_container);
        }
        
    }
};

var _calc_fisher_exact_test = function () {
    var _p = 0;
    
    var _ext_ary = [];
    
    // 先找出最小的那個值
    var _min; 
    var _min_pos = 0;
    var _i = 0;
    var _origin_first;
    
    _traverse_ct_json(function (_x, _y, _num) {
        if (_i === 0) {
            _origin_first = _num;
        }
        
        if (_min === undefined) {
            _min = _num;
        }
        else if (_num < _min) {
            _min = _num;
            _min_pos = _i;
        }
        
        
        _ext_ary.push(_num);
        _i++;
    });
    
    var _adj_pos = _min + 1;
    if (_min_pos % 2 === 1) {
        _adj_pos = _min - 1;
    }
    
    // ---------------------
    
    // 調整成極端值
    
    var _max;
    for (var _i = 0; _i < _ext_ary.length; _i++) {
        var _num = _ext_ary[_i];
        if (_min_pos === 1 || _min_pos === 2) {
            if (_i === 0 || _i === 3 ) {
                _num = _num+_min;
            }
            else {
                _num = _num-_min;
            }
        }
        else {
            if (_i === 0 || _i === 3 ) {
                _num = _num-_min;
            }
            else {
                _num = _num+_min;
            }
        }
        
        
        if (_max === undefined) {
            _max = _num;
        }
        else if (_num > _max) {
            _max = _num;
        }
        _ext_ary[_i] = _num;
    }
    
    //console.log(_ext_ary);
    
    // ---------------------
    // p1跟p2都是固定的，先算p1跟p2
    
    var _p1 = 1;
    for (var _x in _x_sum_list) {
        var _sum = _x_sum_list[_x];
        _p1 = _p1 * _calc_factorial(_sum);
    }
    for (var _y in _y_sum_list) {
        var _sum = _y_sum_list[_y];
        _p1 = _p1 * _calc_factorial(_sum);
    }
    
    var _p2 = _calc_factorial(_total_sum);
    
    var _calc_p3 = function (_ary) {
        var _p = 1;
        for (var _i = 0; _i < _ary.length; _i++) {
            _p = _p * _calc_factorial(_ary[_i]);
        }
        return _p;
    };
    
    // --------------------------------
    var _p4;
    var _original_p4;
    var _p4_list = [];
    
    for (var _i = 0; _i < _max+1; _i++) {
        var _ext_ary2 = [];
        var _has_zero = false;
        var _over_original_flag = false;
        for (var _e = 0; _e < _ext_ary.length; _e++) {
            var _n;
            if (_e === 0 || _e === 3) {
                if (_min_pos === 1 || _min_pos === 2) {
                    _n = _ext_ary[_e]-_i;
                }
                else {
                    _n = _ext_ary[_e]+_i;
                }
                _ext_ary2.push(_n);
            }
            else {
                if (_min_pos === 1 || _min_pos === 2) {
                    _n = _ext_ary[_e]+_i;
                }
                else {
                    _n = _ext_ary[_e]-_i;
                }
                _ext_ary2.push(_n);
            }

            if (_i > 0 && _n === 0) {
                _has_zero = true;
            }

            if (_e === 0 && _n === _origin_first) {
                _over_original_flag = true;
            }
        }

        _p4 = (_p1 / (_p2 * _calc_p3(_ext_ary2)) );
        if (_over_original_flag === true) {
            _original_p4 = _p4;
        }

        //console.log(_ext_ary2);
        //console.log((_p1 / (_p2 * _calc_p3(_ext_ary2)) ));


        //if (_over_original === false) {
            //console.log(['p4', _p4]);
        //    _p += _p4;
        //}
        //console.log(_ext_ary2);
        //console.log(_p4);
        _p4_list.push(_p4);

        //if (_over_original_flag === true) {
        //    _over_original = true;
        //}
        
        if (_has_zero === true) {
            //console.log(['last p4', _last_p4]);
            //console.log(['p4', _p4]);
            //_p += _p4 + _last_p4;
            break;
        }
        //_last_p4 = _p4;
    }
    
    for (var _i = 0; _i < _p4_list.length; _i++) {
        if (_p4_list[_i] <= _original_p4) {
            _p += _p4_list[_i];
        }
    }
    
    return _p;
};

var _calc_fisher_exact_test_with_zero = function () {
    
    var _p1 = 1;
    for (var _x in _x_sum_list) {
        var _sum = _x_sum_list[_x];
        _p1 = _p1 * _calc_factorial(_sum);
    }
    for (var _y in _y_sum_list) {
        var _sum = _y_sum_list[_y];
        _p1 = _p1 * _calc_factorial(_sum);
    }

    var _i = 0;
    var _tmp_num;
    var _p2 = _calc_factorial(_total_sum);
    
    _traverse_ct_json(function (_x, _y, _num) {
        _p2 = _p2 * _calc_factorial(_num);
    });

    var _p = _p1 / _p2;
    return _p;
};

var _calc_x2y_tau = function () {
    var _n = _total_sum;
    
    var _e1 = 0;
    for (var _y_var_name in _y_sum_list) {
        var _f = _y_sum_list[_y_var_name];
        
        _e1 += (( _f * (_n - _f) ) / _n);
    }
    
    var _e2 = 0;
    for (var _x_var_name in _ct_json) {
        var _e = 0;
        var _sum = _x_sum_list[_x_var_name];
        for (var _y_var_name in _ct_json[_x_var_name]) {
            var _f = _ct_json[_x_var_name][_y_var_name];
            
            _e += (_f * (_sum - _f) );
        }
        _e2 += (_e / _sum);
    }
    
    var _tau = 1 - (_e2 / _e1);
    //console.log([_tau, _e2, _e1]);
    //_tau = _tau * 100;
    return _tau;
};

var _calc_y2x_tau = function () {
    var _n = _total_sum;
    var _e1 = 0;
    for (var _x_var_name in _x_sum_list) {
        var _f = _x_sum_list[_x_var_name];
        
        _e1 += (( _f * (_n - _f) ) / _n);
    }
    
    var _e2 = 0;
    var _e_y = {};
    for (var _x_var_name in _ct_json) {
        for (var _y_var_name in _ct_json[_x_var_name]) {
            
            var _sum = _y_sum_list[_y_var_name];
            var _f = _ct_json[_x_var_name][_y_var_name];
            
            if (typeof(_e_y[_y_var_name]) === "undefined") {
                _e_y[_y_var_name] = 0;
            }
            _e_y[_y_var_name] += (_f * (_sum - _f) );
        }
        //_e2 += (_e / _sum);
    }
    
    for (var _y_var_name in _e_y) {
        _e2 += (_e_y[_y_var_name] / _y_sum_list[_y_var_name] );
    }
    
    var _tau = 1 - (_e2 / _e1);
    return _tau;
};

var _calc_factorial = function (num) {
    //num = Math.ceil(num);
    if (num < 0) {
        throw "Error num: " + num;
    }
    
    if (num === 0) { 
        return 1; 
    }
    else { 
        return num * _calc_factorial( num - 1 ); 
    }
};

//console.log(_calc_factorial(24));

var _traverse_ct_json = function (_callback) {
    for (var _x_var_name in _ct_json) {
        for (var _y_var_name in _ct_json[_x_var_name]) {
            _callback(_x_var_name, _y_var_name, _ct_json[_x_var_name][_y_var_name]);
        }
    }
};