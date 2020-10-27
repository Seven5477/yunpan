// 退出
function logout() {
    window.location.href = logout_href;
}

// 校验文件名
function validateFileName(fileName) {
    var reg = new RegExp('[\\\\/:*?\"<>|]');
    if (reg.test(fileName)) {
        return false;
    }
    return true;
}

// 阻止冒泡
function stopPropagation(e) {
    e = e || window.event;
    if(e.stopPropagation) { //W3C阻止冒泡方法
        e.stopPropagation();
    } 
    else {
        e.cancelBubble = true; //IE阻止冒泡方法
    }
}

// 文件查看刷新
function fileShow(ret) {
    let container = document.getElementsByClassName("content")[0],  //表格所在的区域
        menu = document.getElementsByClassName("menu")[0];  //右键的菜单
    let index_data = "{\"Opt\"" + ":" + "0" + "," + "\"DirName\"" + ":" + "[\"" + ret + "\"]" + "}";
    let json_str,  //目录数据（字符串）
        message,   //转化为json格式
        key_word = [],  //存储所有文件夹，便于点击查看时获取当前点击的文件夹
        index = 0;  //key_word的索引

    // 显示当前目录
    $.ajax(
        {
            url: home_rpc,
            data: index_data,
            type: "POST",
            async: false,
            success: function (data) {
                if (data) {
                    console.log("Inquire data: success!");
                    json_str = data;
                    return true;
                }
                else {
                    console.log("Inquire data: error!");
                    return false;
                }
            },
            error: function () {
                alert("Network error!")
            }
        });

    //创建表元素
    let json_table = document.getElementsByTagName("table")[0];
    json_table.style.borderCollapse = "collapse";
    let json_tbody = document.createElement("tbody"),
        json_tr = document.createElement("tr");
    json_table.appendChild(json_tbody);

    let table = document.getElementsByTagName("table")[0],
        infoList = document.getElementsByTagName("tbody"),
        infoLen = infoList.length,
        tobodyList = [];
    for (let i = infoLen - 1; i > 0; i--) {
        tobodyList[i] = document.getElementsByTagName("tbody")[i];
        table.removeChild(tobodyList[i]);
    }
    //此处必须创建tbody，否则无法加入到table中
    let infos = document.createElement("tbody");

    message = JSON.parse(json_str);
    console.log(message);
    // 遍历对象的属性
    for (let prop in message) {
        // 遍历对象的某个属性		
        for (let num in message[prop]) {
            let json_tr = document.createElement("tr");
            // 每行第一列为checkbox
            let checkbox_td = document.createElement("td"),
                label = document.createElement("label"),
                input = document.createElement("input"),
                i = document.createElement("i");

            checkbox_td.className = "tdwidthbox";
            label.className = "checklabel";
            input.className = "checkbox";
            input.type = "checkbox";
            i.className = "check";

            label.appendChild(input);
            label.appendChild(i);
            checkbox_td.appendChild(label);
            json_tr.appendChild(checkbox_td);

            // 遍历对象的某个属性的数组
            for (let key in message[prop][num]) {
                let json_td = document.createElement("td");
                //获取键key
                let td_txt = document.createTextNode(message[prop][num][key]);
                // 大小和修改时间直接放入td
                if (key != "FileName" && key != "DirName") {
                    json_td.appendChild(td_txt);
                }
                // 文件名的td添加样式
                else {
                    let json_span = document.createElement("span");
                    let json_div = document.createElement("div");
                    json_div.className = "file_name";

                    json_span.appendChild(td_txt);
                    json_div.appendChild(json_span);
                    json_td.appendChild(json_div);
                }
                json_tr.appendChild(json_td);
                infos.appendChild(json_tr);
                json_tr.className = "trstyle";

                if (key == "DirName" || key == "FileName") {
                    // 存储文件夹和文件的值放入key_word
                    key_word[index] = message[prop][num][key];
                    index++;
                    json_td.className = "tdwidth1";

                    // 添加文件的图标
                    let label_file = document.createElement("label"),
                        i_file = document.createElement("i");
                    label_file.className = "dir_label";
                    label_file.appendChild(i_file);
                    json_td.appendChild(label_file);

                    if (key == "DirName") {  //文件夹的图标
                        i_file.className = "dir_i";
                    }
                    else {  //文件的图标
                        i_file.className = "file_i";
                    }
                }
                else if (key == "Size") {
                    json_td.className = "tdwidth2";
                }
                else if (key == "ModTime") {
                    json_td.className = "tdwidth3";
                }
            }
        }
    }
    table.appendChild(infos);

    // 左键点击表格某一行
	let trList = document.getElementsByTagName("tr"),
        checkList = document.getElementsByClassName("checkbox"),  //选择框
        fileList = document.getElementsByClassName("file_name"),
        trLen = trList.length,
        checkLen = checkList.length,
        fileLen = fileList.length,
        lastIndex_leftBtn = 0,  //左键的上一次点击
        lastIndex_rightBtn = 0;  //右键的上一次点击
    (function () {
        for (let i = 0; i < fileLen; i++) {
            fileList[i].onclick = function (e) {
                stopPropagation(e);
                this.index = i + 1;
                clearBox();
                // 清除上一次右键点击的样式
                trList[lastIndex_rightBtn].style.background = "none";
                checkList[lastIndex_rightBtn].checked = false;
                if (!(trList[this.index])) {
                    return;
                }
                else {
                    trList[lastIndex_leftBtn].style.background = "none";
                    checkList[lastIndex_leftBtn].checked = false;
                    // 添加背景颜色
                    trList[this.index].style.background = "#e8f6fd";
                    // 选中方框
                    checkList[this.index].checked = true;
                    trList[this.index].isClick = true;
                    lastIndex_leftBtn = this.index; //保存当前的index
                }
            }
        }
    })();

    // 点击选择框
	let labelList = document.getElementsByClassName("checklabel"),
        labelLen = labelList.length;
    (function() {
        for(let i = 1; i < labelLen; i++) {
            labelList[i].onclick = function (e) {
                stopPropagation(e);
                menu.style.display = 'none';
                if(checkList[i].checked) {
                    checkList[i].checked = false;
                    trList[i].style.background = "none";
                }
                else{				
                    checkList[i].checked = true;
                    trList[i].style.background = "#e8f6fd";
                }
            }
        }
    })();

    //左键点击查看文件
    let	filenameList = [];  //存储文件名
	let tdList = document.getElementsByClassName("tdwidth1"),
		td1Len = tdList.length;
		i_list = [];
	for (let i = 0; i < fileLen; i++) {
		filenameList[i] = fileList[i].getElementsByTagName("span")[0];
	}
	for (let i = 1; i < td1Len; i++) {
		i_list.push(tdList[i].getElementsByTagName("i")[0])
	}
	let nameLen = filenameList.length;
	(function () {
		for (let i = 0; i < nameLen; i++) {
			filenameList[i].onclick = function (e) {
                stopPropagation(e);
				current_file = key_word[i];
				if(i_list[i].className == "file_i") {
					return;
				}
				else{
					fileShow(current_file);
				}
			}
		}
    })();

    // 鼠标双击
    (function () {
        for (let i = 0; i < fileLen; i++) {
            fileList[i].ondblclick = function (e) {
                stopPropagation(e);
                this.index = i + 1;
                clearBox();
                // 清除上一次右键点击的样式
                trList[lastIndex_rightBtn].style.background = "none";
                checkList[lastIndex_rightBtn].checked = false;
                if (!(trList[this.index])) {
                    return;
                }
                else {
                    trList[lastIndex_leftBtn].style.background = "none";
                    checkList[lastIndex_leftBtn].checked = false;
                    // 添加背景颜色
                    trList[this.index].style.background = "#e8f6fd";
                    // 选中方框
                    checkList[this.index].checked = true;
                    trList[this.index].isClick = true;
                    lastIndex_leftBtn = this.index; //保存当前的index
                }
                current_file = key_word[i];
				if(i_list[i].className == "file_i") {
					return;
				}
				else{
					fileShow(current_file);
				}
            }
        }
    })();

    // 右键文件弹出菜单
	(function() {
    	for(let i = 0; i < fileLen; i++) {
            fileList[i].index = i;  //自定义属性index保存索引
            fileList[i].isClick = false;   //定义点击开关
    		fileList[i].onmousedown = function(e) {
                stopPropagation(e);
				// 右键弹出菜单
    			if(e.button == 2) {
					// 清除上一次左键点击的样式
					trList[lastIndex_leftBtn].style.background = "none";
					checkList[lastIndex_leftBtn].checked = false;
                    container.style.overflow = "hidden";
                    this.index = i + 1;
                    if (!(fileList[i])) {
                        return;
                    }
                    else {
                        if (this.isClick) {
                            // 清除背景颜色
                            trList[this.index].style.background = "none";
                            // 不选中方框
                            checkList[this.index].checked = false;
                        }
                        else {
                            // 清除上一次点击的样式
                            trList[lastIndex_rightBtn].style.background = "none";
                            checkList[lastIndex_rightBtn].checked = false;
                            // 添加背景色
							trList[this.index].style.background = "#e8f6fd";
							// 选中方框
                            checkList[this.index].checked = true;
                            lastIndex_rightBtn = this.index; //保存当前的index
                        }
                    }
                    let menu = document.getElementsByClassName("menu")[0];  //右键的菜单
                    select_file = (fileList[i].getElementsByTagName("span")[0]).innerText;  //当前点击的文件名
					menu.style.display = 'block';
					// 根据鼠标点击位置和浏览器顶部的距离更改菜单的位置
					let h = mousePos(e);
					if(h < 700) {
						menu.style.top = h - 210 + "px";
					}
    				else{
						menu.style.top = "490px";
					}
				}
				// 左键关闭菜单
    			else if(e.button == 0) {
                    container.style.overflow = "auto";
                    menu.style.display = 'none';
    			}
    		}
    	}
    })();
}

// 补0
function addZero(s) {
    return s < 10 ? '0' + s : s;
}

// 添加文件至数组
function addList(file) {
    if(select_list.indexOf(file) == -1) {
        select_list.push(file);
    }
    else{
        return;
    }
}

// 清除选中框样式
function clearBox() {
    let trList = document.getElementsByTagName("tr"),
        checkList = document.getElementsByClassName("checkbox"),  //选择框
        checkLen = checkList.length;
    for (let i = 0; i < checkLen; i++) {
        checkList[i].checked = false;
        trList[i].style.background = "none";
    }
}

// 全选文件
function checkall() {
    let checkList = document.getElementsByClassName("checkbox");  //选择框
    for (var i = 0; i < checkList.length; i++) {
        checkList[i].checked = checkList[0].checked;
    }
}

// 检查勾选的数据
function checkSelect() {
    let checkList = document.getElementsByClassName("checkbox"),  //选择框
		fileList = document.getElementsByClassName("file_name"),
		checkLen = checkList.length,
		fileLen = fileList.length;
    for (let i = 0; i < checkLen; i++) {
        if(checkList[i].checked) {
            addList(fileList[i-1].innerText);
        }
    }
    for(let i = 0; i < select_list.length; i++) {
        select_list[i] = "\"" + select_list[i] + "\"";
    }
    return select_list;
}

// 鼠标点击位置到浏览器顶部的距离
function mousePos(e){
    e = e || window.event;
    let scrollY=document.documentElement.scrollTop||document.body.scrollTop;  //分别兼容ie和chrome
    let height = e.pageY || (e.clientY+scrollY);  //兼容火狐和其他浏览器
    return height;
}

// 新建文件夹
function newFile() {
    // 创建tbody格式
    let table = document.getElementsByTagName("table")[0];
    let tbody = document.createElement("tbody"),
        tr = document.createElement("tr"),
        td1 = document.createElement("td"),
        td2 = document.createElement("td"),
        td3 = document.createElement("td"),
        div = document.createElement("div"),
        new_input = document.createElement("input"),
        span = document.createElement("span"),
        i1 = document.createElement("i"),
        i2 = document.createElement("i");

    // 每行都加一个checkbox
    let checkbox_td = document.createElement("td"),
        label = document.createElement("label"),
        input = document.createElement("input"),
        i = document.createElement("i");

    checkbox_td.className = "tdwidthbox";
    label.className = "checklabel";
    input.className = "checkbox";
    input.type = "checkbox";
    i.className = "check";

    label.appendChild(input);
    label.appendChild(i);
    checkbox_td.appendChild(label);
    tr.appendChild(checkbox_td);

    tr.className = "trstyle";
    td1.className = "tdwidth1";
    td2.className = "tdwidth2";
    td2.innerText = "-";
    td3.className = "tdwidth3";

    // 文件创建时间
    let myDate = new Date();
    let month = addZero(myDate.getMonth() + 1),
        date = addZero(myDate.getDate()),
        hour = addZero(myDate.getHours()),
        min = addZero(myDate.getMinutes()),
        sec = addZero(myDate.getSeconds());

    // 创建时间
    td3.innerText = myDate.getFullYear() + "-" + month + "-" + date + " " + hour + ":" + min + ":" + sec;
    div.className = "filename";
    new_input.type = "text";
    new_input.className = "new_input";
    span.className = "icon";
    i1.className = "icon_1";
    i2.className = "icon_2";

    span.insertBefore(i1, div.children[1]); //添加兄弟节点
    div.insertBefore(new_input, div.children[0]);
    span.appendChild(i2); //添加子节点
    div.appendChild(span);
    td1.appendChild(div);

    // 添加文件夹标识
    let label_file = document.createElement("label"),
        i_file = document.createElement("i");
    label_file.className = "dir_label";
    label_file.appendChild(i_file);
    i_file.className = "dir_i";
    td1.appendChild(label_file);

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tbody.appendChild(tr);
    // table.appendChild(tbody);
    table.insertBefore(tbody, table.children[1]);

    // 保存按钮
    i1.onclick = function (e) {
        stopPropagation(e);
        flag = true;
        let input_value = new_input.value;
        if (!input_value) {
            alert("文件名称不能为空，请重新输入！");
            new_input.focus(); //光标回到输入框内
        }
        else {
            // 验证文件名
            if (!validateFileName(input_value)) {
                alert("文件名不能包含以下字符:[\\\\/:*?\"<>|]");
                new_input.focus();  //光标定位到输入框中
            }
            else {
                let new_data = "{\"Opt\"" + ":" + "1" + "," + "\"DirName\"" + ":" + "[\"" + input_value + "\"]" + "}";
                $.ajax(
                    {
                        url: home_rpc,
                        data: new_data,
                        type: "POST",
                        async: false,
                        success: function (data) {
                            if (data) {
                                console.log("Add data: success!");
                                let new_span = document.createElement("span"),
                                    file_txt = input_value;
                                // 隐藏新建文件夹的框，使添加的文件直接加入表格中
                                new_input.className = "hide";
                                i1.className = "hide";
                                i2.className = "hide";
                                span.className = "";
                                span.innerText = file_txt;
                                current_file = ".";
                                fileShow(current_file);
                                return true;
                            }
                            else {
                                console.log("Add data: error!");
                                return false;
                            }
                        },
                        error: function () {
                            alert("Network error!")
                        }
                    });
            }
        }
    }

    // 取消按钮
    i2.onclick = function () {
        window.location.reload();
    }
}

// 上传文件
function uploadFile() {
    let form_data = new FormData(document.getElementById('filename'));
    console.log(form_data.get("uploadfile"));

    let ret = confirm("是否将该文件上传至当前目录？");
    if (ret) {
        $.ajax(
            {
                url: upload_rpc,
                data: form_data,
                type: "POST",
                cache: false,
                processData: false,
                contentType: false,
                success: function (data) {
                    if (data) {
                        console.log("Upload file: success!");
                        window.location.reload();
                        return true;
                    }
                    else {
                        console.log("Upload file: error!");
                        return false;
                    }
                },
                error: function () {
                    alert("Network error!")
                }
            });
    }
    else {
        return;
    }
}

// 上传文件夹
function uploadFiles() {
    let form_data = new FormData(document.getElementById('filesname'));
    console.log(form_data.get("uploadfile"));

    if (ret) {
        $.ajax(
            {
                url: upload_rpc,
                data: form_data,
                type: "POST",
                cache: false,
                processData: false,
                contentType: false,
                success: function (data) {
                    if (data) {
                        console.log("Upload files: success!");
                        console.log(data)
                        return true;
                    }
                    else {
                        console.log("Upload files: error!");
                        return false;
                    }
                },
                error: function () {
                    alert("Network error!")
                }
            });
    }
    else {
        return;
    }
}

// 返回上一级
function returnFile() {
    current_file = "..";
    fileShow(current_file);
}

// 删除文件
function deleteFile() {
    current_file = ".";
    checkSelect();
    let del_data = "{\"Opt\"" + ":" + "2" + "," + "\"DirName\"" + ":" + "[" + select_list + "]" + "}";
    console.log(del_data);
    $.ajax(
        {
            url: home_rpc,
            data: del_data,
            type: "POST",
            async: false,
            success: function (data) {
                if (data) {
                    console.log("Delete data: success!");
                    let menu = document.getElementsByClassName("menu")[0];  //右键的菜单
                    menu.style.display = "none";
                    select_list = [];
                    fileShow(current_file);
                    return true;
                }
                else {
                    console.log("Delete data: error!");
                    return false;
                }
            },
            error: function () {
                alert("Network error!")
            }
        });
}

// 下载文件
function downloadFile() {
    console.log(select_file);
    let form = document.createElement("form"),
        input = document.createElement("input");
    form.style.display = "none";
    form.method = "post";
    form.action = download_rpc;
    form.enctype = "multipart/form-data";
    input.type = "hidden";
    input.name = "downloadfile";
    input.value = select_file;
    form.appendChild(input);
    $("body").append(form);

    let form_data = new FormData(form);
    form.submit();
}