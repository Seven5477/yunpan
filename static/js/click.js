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

// 转换字节
function bytesToSize(bytes) {
    if (bytes === 0) return '0 B';
    let k = 1024,
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)). toFixed(2) + ' ' + sizes[i];
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
                    select_dir = (fileList[i].getElementsByTagName("span")[0]).innerText;  //当前点击的文件名
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
                    select_dir = (fileList[i].getElementsByTagName("span")[0]).innerText;  //当前点击的文件名
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
function isNew() {
    if(!newClick) {
        newFile();
    }
    else{
        let new_input = document.getElementsByClassName("new_input")[0];
        new_input.focus();
    }
}
function newFile() {
    newClick = true;
    // 回到顶部
    $('html,body').animate({scrollTop: '0px'}, 800);
    let con = document.getElementsByClassName("content")[0];
    $(con).scrollTop(0);
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
        newClick = false;
    }

    // 取消按钮
    i2.onclick = function () {
        fileShow(current_file);
        newClick = false;
    }
}

// 文件上传进度
function updateProgress(progress) {
    let uploadList = document.getElementById("uploadList"),
        len = uploadList.children.length;
    let process = document.getElementsByClassName("process")[len-1],
        status = document.getElementsByClassName("file-status")[len],
        operate = document.getElementsByClassName("file-operate")[len],
        em1 = operate.getElementsByTagName("em")[0],
        em2 = operate.getElementsByTagName("em")[1],
        total = document.getElementsByClassName("total")[0];
    if (progress.lengthComputable) {
        console.log("loaded:" + progress.loaded, "total:" + progress.total);
        let upload_progress = (progress.loaded / progress.total) * 100;
        let percent = upload_progress.toFixed(2) + "%";
        console.log("percent:" + percent);
        process.style.width = percent;
        total.style.width = percent;
        status.innerText = percent;
        if (upload_progress == 100) {
            status.innerText = "上传成功";
            status.style.color = "#9a079a";
            // em1.className = "clear";
            // operate.removeChild(operate.children[1]);
        }
    }
}

// 上传/下载列表
function newLoadli(name, size, dir) {
    let uploadList = document.getElementById("uploadList");
    let li = document.createElement("li"),
        div_pro = document.createElement("div"),
        div_info = document.createElement("div"),
        div_name = document.createElement("div"),
        div_size = document.createElement("div"),
        div_path = document.createElement("div"),
        div_sta = document.createElement("div"),
        div_ope = document.createElement("div"),
        em1 = document.createElement("em"),
        em2 = document.createElement("em");

    li.className = "status";
    div_pro.className = "process";
    div_info.className = "file-info";
    div_name.className = "file-name";
    div_size.className = "file-size";
    div_path.className = "file-path";
    div_sta.className = "file-status";
    div_ope.className = "file-operate";
    em1.className = "pause";
    em2.className = "remove";

    div_name.innerText = name;
    div_size.innerText = size;
    div_path.innerText = dir;
    div_sta.innerText = "正在上传";

    div_ope.appendChild(em1);
    div_ope.appendChild(em2);
    div_info.appendChild(div_name);
    div_info.appendChild(div_size);
    div_info.appendChild(div_path);
    div_info.appendChild(div_sta);
    div_info.appendChild(div_ope);
    li.appendChild(div_pro);
    li.appendChild(div_info);
    uploadList.appendChild(li);
}

// 上传文件
function uploadFile1() {
    current_file = ".";
    let form_data = new FormData(document.getElementById('filename'));
    console.log(form_data.get("uploadfile"));
    let input_obj = document.getElementById('file'),
        file_name = input_obj.files[0].name,
        file_size = bytesToSize(input_obj.files[0].size),
        dir = select_dir;
    console.log("file_name:" + file_name);
    console.log("file_size:" + file_size);
    console.log("dir:" + dir);
    newLoadli(file_name, file_size, dir);


    let ret = confirm("是否将该文件上传至当前目录？");
    if (ret) {
        request = $.ajax(
            {
                url: upload_rpc,
                data: form_data,
                type: "POST",
                cache: false,
                processData: false,
                contentType: false, //必须false才会自动加上正确的Content-Type
                //这里我们先拿到jQuery产生的 XMLHttpRequest对象，为其增加 progress 事件绑定，然后再返回交给ajax使用
                xhr: function () {
                    let xhr = $.ajaxSettings.xhr();
                    if (xhr.upload) {
                        console.log("upload...")
                        xhr.upload.onprogress = function (progress) {
                            self.updateProgress(progress);
                            if(((progress.loaded / progress.total) * 100) == 100);
                        };
                        xhr.upload.onloadstart = function () {
                            console.log('started...');
                        };
                    }
                    return xhr;
                },
                success: function (data) {
                    if (data) {
                        console.log("Upload file: success!");
                        fileShow(current_file);
                        return true;
                    }
                    else {
                        console.log("Upload file: error!");
                        return false;
                    }
                },
                error: function () {
                    console.log("Network error!");
                }
            });
    }
    else {
        return;
    }
}

function uploadFile(start) {
    current_file = ".";   
    let fileObj = document.getElementById('file').files[0];
    // 上传完成
    if (start >= fileObj.size) {
        return;
    }
    // 获取文件块的终止字节
    let end = (start + chunkSize > fileObj.size) ? fileObj.size : (start + chunkSize);

    console.log("size:" + fileObj.size);
    console.log("start:" + start);
    console.log("end:" + end);

    // 将文件切块上传
    let form_data = new FormData(document.getElementById('filename'));
    form_data.append('file', fileObj.slice(start, end));
    // POST表单数据
    // let xhr = new XMLHttpRequest();
    // xhr.open('post', upload_rpc, true);
    // xhr.onload = function() {
    //     if (this.readyState == 4 && this.status == 200) {
    //         // 上传一块完成后修改进度条信息，然后上传下一块
    //         let progress = document.getElementsByClassName('total-process')[0];
    //         progress.max = fileObj.size;
    //         progress.value = end;
    //         uploadFile(end);
    //     }
    // }
    // xhr.send(form_data);
    // POST表单数据
    $.ajax({
        url: upload_rpc,
        data: form_data,
        type: "POST",
        cache: false,
        processData: false,
        contentType: false, //必须false才会自动加上正确的Content-Type
        //这里我们先拿到jQuery产生的 XMLHttpRequest对象，为其增加 progress 事件绑定，然后再返回交给ajax使用
        success: function() {
            uploadFile(end);
        }
    });
    if(end == fileObj.size) {
        fileShow(current_file);
    }
}

// 初始化上传大小
function init() {
    let fileObj = document.getElementById('file').files[0];
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // 将字符串转化为整数
            let start = parseInt(this.responseText);
            // 设置进度条
            let progress = document.getElementById('progress');
            progress.max = fileObj.size;
            progress.value = start;
            // 开始上传
            upload(start);
        }
    }
    xhr.open('post', 'fileSize.php', true);
    // 向服务器发送文件名查询大小
    xhr.send(fileObj.name);
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

// 判断上传任务列表是否为空
function isEmptyUpload() {
    let uploadList = document.getElementById("uploadList"),
        fileInfoList = uploadList.getElementsByClassName("file-info"),
        len = fileInfoList.length,
        nothing = document.getElementsByClassName("nothing")[0],
        progress = document.getElementsByClassName("upload-progress")[0],
        upload_img = nothing.getElementsByTagName("img")[0],
        download_img = nothing.getElementsByTagName("img")[1],
        info = nothing.getElementsByClassName("info")[0];
    // 判断列表内是否有任务
    if(len == 0) {
        progress.style.display = "none";
        nothing.style.display = "block";
        upload_img.style.display = "";
        download_img.style.display = "none";
        info.innerText = "当前没有上传任务喔~";
    }
    else{
        nothing.style.display = "none";
        progress.style.display = "block";
    }
}

// 判断下载任务列表是否为空
function isEmptyDownload() {
    let downloadList = document.getElementById("downloadList"),
        fileInfoList = downloadList.getElementsByClassName("file-info"),
        len = fileInfoList.length,
        nothing = document.getElementsByClassName("nothing")[0],
        progress = document.getElementsByClassName("download-progress")[0],
        upload_img = nothing.getElementsByTagName("img")[0],
        download_img = nothing.getElementsByTagName("img")[1],
        info = nothing.getElementsByClassName("info")[0];
    // 判断列表内是否有任务
    if(len == 0) {
        progress.style.display = "none";
        nothing.style.display = "block";
        upload_img.style.display = "none";
        download_img.style.display = "";
        info.innerText = "当前没有下载任务喔~";
    }
    else{
        nothing.style.display = "none";
        progress.style.display = "block";
    }
}

// 跳转到传输列表
function toTransport() {
    let upload_module = document.getElementsByClassName("upload-progress")[0], //上传
        uploadList = document.getElementById("uploadList"),
        download_module = document.getElementsByClassName("download-progress")[0], //下载
        downloadList = document.getElementById("downloadList"), 
        nav_title = document.getElementsByClassName("nav-title")[0],
        netdisk = nav_title.getElementsByTagName("li")[0],
        transport = nav_title.getElementsByTagName("li")[1],
        transport_content = document.getElementsByClassName("transport-content")[0],
        main_content = document.getElementsByClassName("main-content")[0],
        disk = document.getElementsByClassName("disk")[0],
        trans = document.getElementsByClassName("trans")[0],
        download = trans.getElementsByTagName("div")[0], //左侧下载菜单
        upload = trans.getElementsByTagName("div")[1]; //左侧上传菜单
    // 顶部导航的显示
    main_content.style.display = "none";
    disk.style.display = "none";
    netdisk.className = "";
    transport_content.style.display = "block";
    trans.style.display = "block";
    transport.className = "active";

    isEmptyUpload();

    // 点击下载
    download.onclick = function () {
        download.style.background = "#e2ddec";
        upload.style.background = "#f8f7f7";
        upload_module.style.display = "none"
        download_module.style.display = "block";
        isEmptyDownload();
    }

    // 点击上传
    upload.onclick = function () {
        upload.style.background = "#e2ddec";
        download.style.background = "#f8f7f7";
        download_module.style.display = "none";
        upload_module.style.display = "block";
        isEmptyUpload();
    }

    // let liList = uploadList.getElementsByTagName("li"),
    //     total = document.getElementsByClassName("total")[0],
    //     operationList = document.getElementsByClassName("file-operate"),
    //     opeLen = operationList.length;
    // (function () {
    //     for (let i = 1; i < opeLen; i++) {
    //         let em_btn = operationList[i].getElementsByTagName("em")[0],
    //             em_cancel = operationList[i].getElementsByTagName("em")[1];
    //         // 点击暂停/继续图标
    //         em_btn.onclick = function () {
    //             em_btn.className = em_btn.className == "continue" ? "pause" : "continue";
    //             // 如果当前为暂停图标
    //             if(em_btn.className == "pause") {
    //                 em_btn.className = "continue";

    //             }
    //             // 如果当前为继续图标
    //             else{
    //                 em_btn.className = "pause";
    //             }
    //         }
    //         // 点击移除图标
    //         em_cancel.onclick = function () {
    //             console.log("cancel...");
    //             uploadList.removeChild(uploadList.children[i-1]);
    //             total.style.width = 0;
    //             request.abort();
    //             isEmpty(1);
    //         }
    //     }
    // })();
}

// 跳转到我的网盘
function toDisk() {
    let nav_title = document.getElementsByClassName("nav-title")[0],
        netdisk = nav_title.getElementsByTagName("li")[0],
        transport = nav_title.getElementsByTagName("li")[1],
        transport_content = document.getElementsByClassName("transport-content")[0],
        main_content = document.getElementsByClassName("main-content")[0],
        disk = document.getElementsByClassName("disk")[0],
        trans = document.getElementsByClassName("trans")[0];
    main_content.style.display = "block";
    disk.style.display = "block";
    netdisk.className = "active";
    transport_content.style.display = "none";
    trans.style.display = "none";
    transport.className = "";
}

// 全部暂停下载
function pauseList() {
    let pause = document.getElementsByClassName("total-pause")[0];
    pause.innerText = pause.innerText == "全部暂停" ? "全部开始" : "全部暂停";
}

// 全部取消下载
function cancelList() {

}