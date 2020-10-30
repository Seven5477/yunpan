let current_file = ".";  //当前进入的文件
let select_file = "";  //选中的文件
let select_dir = "";  //当前目录
let select_list = [];  //选中的文件数组
let flag = false;  //输入框函数是否成功调用

// 登录成功后进入用户主界面
function loadPage() {
	// 显示用户名
	let user = document.getElementsByClassName("username")[0];
		username = localStorage.getItem("user");  //获取用户名
		user.innerHTML = username;  //用户名

	let container = document.getElementsByClassName("content")[0],  //表格所在的区域
		menu = document.getElementsByClassName("menu")[0];  //右键的菜单
	let index_data = "{\"Opt\"" + ":" + "0" + "," + "\"DirName\"" + ":" + "[\"" + current_file + "\"]" + "}";  //ajax需要的数据
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

			// 遍历对象的某个属性
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
				json_tbody.appendChild(json_tr);
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

					if(key == "DirName") {  //文件夹的图标
						i_file.className = "dir_i";
					}
					else{  //文件的图标
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
				// 清除所有选中框的样式
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

	// 屏蔽默认右键菜单
	container.oncontextmenu = function (event) {
		event.preventDefault();
	};

	// 右键文件弹出菜单
	(function() {
    	for(let i = 0; i < fileLen; i++) {
            fileList[i].index = i;  //自定义属性index保存索引
            fileList[i].isClick = false;   //定义点击开关
    		fileList[i].onmousedown = function(e) {
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

	// 整个页面点击鼠标左键关闭菜单
	let html = document.getElementsByTagName("html")[0];
	html.onclick = function(e) {
		stopPropagation(e);
		menu.style.display = 'none';
	}

	// 鼠标经过上传按钮
	let upload_btn = document.getElementsByClassName("upload")[0],
		upload_ul = document.getElementsByClassName("upload_file")[0];

	upload_btn.onmouseenter = function () { //鼠标经过
		upload_ul.style.display = 'block';
	}
	upload_btn.onmouseleave = function () { //鼠标离开
		upload_ul.style.display = 'none';
	}
}
