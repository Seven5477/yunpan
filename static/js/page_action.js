// 是否新建文件夹
function isNew() {
	if (!newClick) {
		newFile();
	}
	else {
		let new_input = document.getElementsByClassName("new_input")[0];
		new_input.focus();  //聚焦到文本框内
	}
}

// 新建文件夹
function newFile() {
	newClick = true;
	// 回到顶部
	$('html,body').animate({ scrollTop: '0px' }, 800);
	let con = $(".content"),
		htmlStr = ``,
		tbody = $("tbody").eq(1);
	con.scrollTop(0);

	// 文件创建时间
	let myDate = new Date();
	let month = addZero(myDate.getMonth() + 1),
		date = addZero(myDate.getDate()),
		hour = addZero(myDate.getHours()),
		min = addZero(myDate.getMinutes()),
		sec = addZero(myDate.getSeconds()),
		timeText = myDate.getFullYear() + "-" + month + "-" + date + " " + hour + ":" + min + ":" + sec;
	htmlStr = `
        <tr class="trstyle">
            <td class="tdwidthbox">
                <label class="checklabel">
                    <input type="checkbox" class="checkbox">
                    <i class="check"></i>
                </label>
            </td>
            <td class="tdwidth1">
                <div class="file_name">
                    <input type="text" class="new_input">
                    <span class="icon">
                        <i class="icon_1"></i>
                        <i class="icon_2"></i>
                    </span>
                </div>
                <label class="dir_label">
                    <i class="dir_i"></i>
                </label>
            </td>
            <td class="tdwidth2">-</td>
            <td class="tdwidth3">${timeText}</td>
        </tr>
    `;
	tbody.prepend(htmlStr);

	let file_name = $(".tdwidth1 .file_name").eq(0),
		icon = $(".icon"),
		icon_save = $(".icon_1"),
		icon_cancel = $(".icon_2"),
		new_input = $(".new_input");
	new_input.focus(); //光标回到输入框内
	file_name.keypress(function (event) {
		if (event.which === 13) {
			//点击回车要执行的事件
			newFileSave();
		}
	});

	function newFileSave() {
		let input_value = new_input.val();  //获取文本框的数据
		if (!input_value) {
			alert("文件名称不能为空，请重新输入！");
			new_input.focus();
		}
		else {
			// 验证文件名
			if (!validateFileName(input_value)) {
				alert("文件名不能包含以下字符:[\\\\/:*?\"<>|]");
				new_input.focus();  //光标定位到输入框中
			}
			else {
				let new_data = `{"dir_option":"dir_option_create","dir_name":["${input_value}"]}`;
				$.ajax(
					{
						url: home_rpc,
						data: new_data,
						type: "POST",
						async: false,
						success: function (result) {
							if (result.code === 0) {
								// 隐藏新建文件夹的框，使添加的文件直接加入表格中
								new_input[0].className = "hide";
								icon_save[0].className = "hide";
								icon_cancel[0].className = "hide";
								icon[0].className = "";
								icon[0].innerText = input_value;
								queryData(current_path);
								return true;
							}
							else {
								alert(result.msg);
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

	// 保存按钮
	icon_save.on('click', function (e) {
		stopPropagation(e);
		newFileSave
	});

	// 取消按钮
	icon_cancel.on('click', function () {
		queryData(current_path);
		newClick = false;
	});
}

// 删除文件
function deleteFile() {
	checkSelect();
	let del_data = `{"dir_option":"dir_option_remove","dir_name":[${checkSelect_list}]}`;
	console.log(del_data)
	if (checkSelect_list.length === 0) {
		alert("请先选择文件！");
		return;
	}
	$.ajax(
		{
			url: home_rpc,
			data: del_data,
			type: "POST",
			async: false,
			success: function (result) {
				if (result.code === 0) {
					let menu = document.getElementsByClassName("menu")[0];  //右键的菜单
					menu.style.display = "none";
					checkSelect_list = [];
					isCheckAll();
					queryData(current_path);
					clearMoreBtn();
					return true;
				}
				else {
					alert(result.msg);
					return false;
				}
			},
			error: function () {
				alert("Network error!")
			}
		});
}

// 文件查看刷新
function refresh() {
	let icon_refresh = document.getElementsByClassName("iconfont-refresh")[0],
		rotateval = 0;
	function rot() {
		rotateval = rotateval + 1;
		if (rotateval === 360) {
			clearInterval(interval);
			rotateval = 0;
			queryData(".");
		}
		icon_refresh.style.transform = 'rotate(' + rotateval + 'deg)';
	}
	let interval = setInterval(rot, 5);
}

// 文件/文件夹重命名
function renameFile() {
	let oldName = select_file,
		newName = "",
		file_name = current_dom.find(".file_name"),
		newStr = `
			<input type= "text" class="new_input">
			<span class="icon">
				<i class="icon_1"></i>
				<i class="icon_2"></i>
			</span>
		`;
	file_name.html(newStr);

	let icon_save = file_name.find(".icon_1"),
		icon_cancel = file_name.find(".icon_2"),
		new_input = file_name.find(".new_input");
	new_input.val(oldName);
	new_input.focus();
	file_name.keypress(function (event) {
		if (event.which === 13) {
			//点击回车要执行的事件
			renameSave();
		}
	});

	function renameSave() {
		newName = new_input.val();
		if (!newName) {
			alert("文件名称不能为空，请重新输入！");
			new_input.focus();
		}
		else if (newName === oldName) {
			newStr = `
				<span>${oldName}</span>
			`;
			file_name.html(newStr);
		}
		else {
			// 验证文件名
			if (!validateFileName(newName)) {
				alert("文件名不能包含以下字符:[\\\\/:*?\"<>|]");
				new_input.focus();  //光标定位到输入框中
			}
			else {
				let rename_data = `{"dir_option":"dir_option_rename","dir_name":["${oldName}", "${newName}"]}`;
				$.ajax(
					{
						url: home_rpc,
						data: rename_data,
						type: "POST",
						async: false,
						success: function (result) {
							if (result.code === 0) {
								// 隐藏新建文件夹的框，使添加的文件直接加入表格中
								newStr = `
									<span>${newName}</span>
								`;
								file_name.html(newStr);
								// 清除选中样式
								cleanCheckCss(current_dom);
								return true;
							}
							else {
								alert(result.msg);
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

	// 保存按钮
	icon_save.on('click', function (e) {
		stopPropagation(e);
		renameSave();
	});

	// 取消按钮
	icon_cancel.on('click', function () {
		newStr = `
			<span>${oldName}</span>
		`;
		file_name.html(newStr);
	});
}

/* 下载文件
*  @params
*  @return
*/
function downloadFile() {
	let form = document.createElement("form"),
		input = document.createElement("input");
	form.style.display = "none";
	form.method = "post";
	form.action = download_rpc;
	form.enctype = "multipart/form-data";
	input.type = "hidden";
	input.name = "download_file";
	input.value = select_file;
	form.appendChild(input);
	document.body.appendChild(form);

	let form_data = new FormData(form);
	form.submit();
}

/* 全部暂停下载
*  @params
*  @return
*/
function pauseList() {
	let pause = document.getElementsByClassName("total-pause")[0],
		uploadList = document.getElementById("uploadList"),
		liList = uploadList.getElementsByTagName("li"),
		len = liList.length;
	if (pause.innerText === "全部暂停") {
		for (let i = 0; i < len; i++) {
			pauseUpload(i);
		}
		pause.innerText = "全部开始";
	}
	else {
		for (let i = 0; i < len; i++) {
			reUpload(i);
		}
		pause.innerText = "全部暂停";
	}
}

// 上传文件
function upload(e) {
	upload_type = 1; //上传文件
	let file_choose = document.getElementById('file').files[0],  //获取上传的文件对象
		form_info = new FormData(document.getElementById('filename'));  //获取上传的文件的formdata信息
	// 把上传的单个文件的formdata信息放入formObj
	formObj = addFileObj(form_info, formObj);
	// 把上传的单个文件对象放入uploadFile_obj
	uploadFile_Obj = addFileObj(file_choose, uploadFile_Obj);
	// 把操作对象e放入eObj
	eObj = addFileObj(e, eObj);
	// 当前上传的单个请求所在的数组放入requestObj
	requestObj = addFileObj(currentRequest_arr, requestObj);
	if (end_lastLi) {  //如果上一个进度表创建完毕，则创建下一个进度表
		end_lastLi = false; //此时创建的进度表处于未结束状态
		addLi(index_uploadFile_Obj);
	}
}

// 上传文件夹
function uploadDir() {
	upload_type = 2; //上传文件夹
	$('#folder').change(function (e) {
		eObj = addFileObj(e, eObj);
		let folder_name = null; //文件夹名
		let files = e.target.files; //所有文件
		files_arr = files;
		folder_name = (files[0].webkitRelativePath).split('/')[0]; //获取文件夹名

		//新建上传的同名文件夹
		let new_data = `{"Opt":1,"DirName":["${folder_name}"]}`;
		$.ajax(
			{
				url: home_rpc,
				data: new_data,
				type: "POST",
				async: false,
				success: function (result) {
					if (result.code === 0) {
						queryData(folder_name);
						return true;
					}
					else {
						alert(data.msg);
						return false;
					}
				},
				error: function () {
					alert("Network error!")
				}
			});
		index_uploadFile_Obj = 0;
		addLi(index_uploadFile_Obj);
	});
}

// 添加上传文件任务的进度表
function addLi(index) {
	if (upload_type === 1) {   //文件
		file_obj = uploadFile_Obj[index];  //拿到当前上传的文件对象
		// index_uploadFile_Obj = 0;  //下一个要上传的文件对象索引为0，因为结束上传uploadFile_Obj会清空
	}
	else {   //文件夹
		file_obj = files_arr[index];
		index_uploadFile_Obj++;  //新上传的文件对象的索引递增
	}
	let file_name = file_obj.name,
		file_size = bytesToSize(file_obj.size);
	newLoadli(file_name, file_size, current_dirname_arr[current_dirname_arr.length - 1]);
	end_lastLi = true;  //当前进度表已完成创建

	if (upload_type === 1) {   //文件
		if (end_lastUpload) {  //如果上一个上传任务完成，则创建下一个上传任务
			end_lastUpload = false;  //此时的上传任务处于未结束状态
			// index_uploadFile_Obj++;  //上一个文件没有上传完，新上传的文件对象的索引递增
			getFileMd5(index_uploadFile_Obj);
		}
	}
	else {   //文件夹：先把文件夹中的所有文件的上传进度表都创建完成再逐个分片
		if (index_uploadFile_Obj >= files_arr.length) {
			index_uploadFile_Obj = 0;  //文件全部完成上传，新上传的文件对象的索引归0
			getFileMd5(0);
		}
		else {
			addLi(index_uploadFile_Obj);
		}
	}
}

/* 创建上传/下载进度表
*  @params
*      name,size,dir [string] 文件名，文件大小，上传目录
*  @return
*/
function newLoadli(name, size, dir) {
	let uploadList = $("#uploadList");

	let uploadStr = `
		<li class="status">
			<div class="process"></div>
			<div class="file-info">
				<div class="file-name">${name}</div>
				<div class="file-size">${size}</div>
				<div class="file-path">${dir}</div>
				<div class="file-status">等待上传</div>
				<div class="file-operate">
					<em class="pause"></em>
					<em class="remove"></em>
				</div>
			</div>
		</li>	
	`;
	uploadList.append(uploadStr);
}

/* 计算文件的MD5值
*  @params
*      index 当前索引(eObj,uploadFile_Obj,files_arr) 
*  @return 
*/
function getFileMd5(index) {
	let e_obj = null;
	if (upload_type === 1) {  //文件
		file_obj = uploadFile_Obj[index];
		e_obj = eObj[index];
	}
	else {  //文件夹
		file_obj = files_arr[index];
	}

	console.log("------------计算MD5值-----------");

	fileSize = file_obj.size;
	fileName = file_obj.name;
	if (fileSize <= 30 * 1024 * 1024) {  //不大于30M的
		let fileReader = new FileReader()
		fileReader.readAsBinaryString(file_obj);
		fileReader.onload = e_obj => {
			md5_sum = SparkMD5.hashBinary(e_obj.target.result);
			console.log(md5_sum);
			console.log("------------计算完成-----------");
			uploadEach(index);
		}
	}
	else {
		let chunkSize = Math.ceil(fileSize / 10), //分成10片，每片的大小
			fileReader = new FileReader(),
			md5 = new SparkMD5(),
			start = 0;  //起始字节
		let loadFile = () => {
			let slice = file_obj.slice(start, start + chunkSize);  //根据字节范围切割每一片
			fileReader.readAsBinaryString(slice);
		}
		loadFile();
		fileReader.onload = e_obj => {
			md5.appendBinary(e_obj.target.result);
			if (start < fileSize) {
				start += chunkSize;
				loadFile();
			} else {
				md5_sum = md5.end();
				console.log(md5_sum);
				console.log("------------计算完成-----------");
				uploadEach(index);
			}
		};
	}
}

/* 排队上传单个文件
*  @params
		index 文件数组索引
*  @return
*/
function uploadEach(index) {
	if (upload_type === 1) {
		file_obj = uploadFile_Obj[index];
	}
	else {
		file_obj = files_arr[index];
	}
	console.log(file_obj);

	chunkSize = chunk(fileSize);  //每片的大小
	chunkNum = Math.ceil(fileSize / chunkSize);  //总片数
	uploadPiece(0);
	// $.ajax(
	// 	{
	// 		url: uploadreq_rpc,
	// 		data: upload_data,
	// 		type: "POST",
	// 		async: false,
	// 		success: function (data) {
	// 			if (data.code == 1000) {
	// 				argItem[0] = file_name;
	// 				argItem[1] = md5_file;
	// 				currentRequest_arr.push(argItem); //把文件名、MD5和请求放入当前请求数组
	// 				uploadPiece(0);
	// 				return true;
	// 			}
	// 			else {
	// 				alert(data.description);
	// 				return false;
	// 			}
	// 		},
	// 		error: function () {
	// 			alert("Network error!")
	// 		}
	// 	});
}

/* 分片上传文件
*  @params
		start [number] 起始字节
*  @return
*/
function uploadPiece(start) {
	current_path = ".";
	// 上传完成 
	if (start >= fileSize) {
		console.log("------------上传完成-------------");
		end_lastUpload = true;
		process_global = 0;
		chunkNum_uploaded = 0;
		if (upload_type === 1) {
			index_uploadFile_Obj++;
			if (index_uploadFile_Obj >= uploadFile_Obj.length) { //文件全部上传完毕
				uploadFile_Obj = {
					length: 0
				};
				queryData(current_path);
			}
			else {
				getFileMd5(index_uploadFile_Obj);
			}
		}
		else {
			file_index++;
			if (file_index >= files_arr.length) {  //文件夹的文件上传完毕
				queryData(current_path);
			}
			else {
				getFileMd5(file_index);
			}
		}
		return;
	}
	// 获取文件块的终止字节
	end = (start + chunkSize > fileSize) ? fileSize : (start + chunkSize);

	// 将文件切块上传
	let form_data = formObj[index_uploadFile_Obj]; //获取表单信息
	let formData = new FormData();
	if (upload_type === 1) { //上传文件
		formData.append("user_name", username);
		formData.append("src_file_path", "test");
		formData.append("file_path", "/test1");
		formData.append("file_name", fileName);
		formData.append("size", fileSize);
		formData.append("chunk_num", chunkNum);
		formData.append("md5", md5_sum);
		formData.append("chunk_index", chunkNum_uploaded);
		formData.append("upload_file", form_data.get("uploadfile").slice(start, end)); //将获取的文件分片赋给新的对象
	}
	else { //上传文件夹
		formData.append("uploadfile", file_obj.slice(start, end)); //将获取的文件分片赋给新的对象
	}

	$.ajax({
		url: upload_rpc,
		data: formData,
		type: "POST",
		cache: false,
		processData: false,
		contentType: false, //必须false才会自动加上正确的Content-Type
		//这里我们先拿到jQuery产生的 XMLHttpRequest对象，为其增加 progress 事件绑定，然后再返回交给ajax使用
		xhr: function () {
			let xhr = $.ajaxSettings.xhr();
			if (xhr.upload) {
				xhr.upload.onprogress = function (progress) {
					updateProgress(progress);
				};
			}
			// argItem[2] = xhr; //将每个上传任务的每一片存入requestObj对象中，该对象存入的是request_arr数组中
			// argItem = [];
			return xhr;
		},
		success: function (result) {
			if (result.code === 0) {
				chunkNum_uploaded++;
				console.log("准备上传第" + chunkNum_uploaded + "片......");
				uploadPiece(end);
			}
			else {
				alert(result.msg);
				return false;
			}
		}
	});
}

/* 文件上传进度
*  @params
*      progress [object] 上传进度对象
*  @return
*/
function updateProgress(progress) {
	let uploadList = document.getElementById("uploadList"),
		thisIndex = 0, //文件对象索引
		total_proc = 0; //总进度
	if (upload_type === 1) {
		thisIndex = index_uploadFile_Obj;
	}
	else {
		thisIndex = file_index;
	}
	let process = uploadList.getElementsByClassName("process")[thisIndex], //li对应的进度标签
		status = uploadList.getElementsByClassName("file-status")[thisIndex],
		operate = uploadList.getElementsByClassName("file-operate")[thisIndex],
		em1 = operate.getElementsByTagName("em")[0],
		em2 = operate.getElementsByTagName("em")[1],
		total = document.getElementsByClassName("total")[0];
	if (progress.lengthComputable) {
		console.log("loaded:" + progress.loaded, "total:" + progress.total);
		let current_progress = progress.loaded / progress.total; //当前片的进度
		process_global = (((chunkNum_uploaded - 1) / chunkNum) + (current_progress / chunkNum)) * 100; //每个文件总进度 = （已上传的片数/总片数 + 当前片的进度/总片数） * 100
		let percent = process_global.toFixed(2) + "%";
		console.log("percent:" + percent);
		process.style.width = percent; //每个文件的进度
		status.innerText = percent; //每个文件的进度值
		total_percent[thisIndex] = process_global.toFixed(2);
		if (upload_type === 2) { //文件夹
			let len = files_arr.length;
			for (let i = 0; i < total_percent.length; i++) {
				let sum = total_percent[i] / len;
				total_proc += sum;
			}
		}
		else { //文件
			let len = uploadFile_Obj.length;
			for (let i = 0; i < total_percent.length; i++) {
				let sum = total_percent[i] / len;
				total_proc += sum;
			}
		}
		console.log("total_percent:" + Math.round(total_proc));
		total.style.width = Math.round(total_proc) + "%"; //总进度
		if (process_global == 100) {
			status.innerText = "上传成功";
			status.style.color = "#9a079a";
			em1.className = "clear";
			em2.className = "";
		}
	}
}

/* 暂停文件
*  @params
		index 任务列表索引
*  @return
*/
function pauseUpload(index) {
	console.log(requestObj);
	console.log(requestObj[index]);
	console.log(requestObj[index][0]);
	console.log(requestObj[index][0][2]);
	requestObj[index][0][2].abort(); //中止当前上传任务中的已上传的最后一片
	if (index < requestObj.length - 1) {
		index++;
		chunkNum_uploaded = 1;
		getFileMd5(index);
	}
}

/* 续传文件
*  @params
		index 任务列表索引
*  @return
*/
function reUpload(index) {
	let file_name = null;
	if (upload_type === 1) {
		file_name = uploadFile_Obj[index].name;
	}
	else {
		file_name = files_arr[index].name;
	}

	let upload_data = `{"Option":"reUploadFile","FileName":"${file_name}","Size":"${fileSize}","ChunkNum":"${chunkNum}","MD5":"${md5_file}","ChunkPos":"${chunkNum_uploaded}"}`;
	console.log(upload_data);
	$.ajax(
		{
			url: uploadreq_rpc,
			data: upload_data,
			type: "POST",
			async: false,
			success: function (data) {
				if (data.code == 1000) {
					console.log(data.description);
					uploadPiece(end - chunkSize);
					return true;
				}
				else {
					alert(data.description);
					return false;
				}
			},
			error: function () {
				alert("Network error!")
			}
		});
}

/* 跳转到传输列表
*  @params
*  @return
*/
function toTransport() {
	current_path = ".";
	let upload_module = $(".upload-progress"), //上传
		download_module = $(".download-progress"), //下载
		netdisk_page = $(".nav-title li").eq(0),
		transport_page = $(".nav-title li").eq(1),
		transport_content = $(".transport-content"),
		main_content = $(".main-content"),
		disk_left = $(".disk"),
		trans_left = $(".trans"),
		download_menu = $(".trans .title").eq(0), //左侧下载菜单
		upload_menu = $(".trans .title").eq(1); //左侧上传菜单
	// 替换右侧内容
	main_content.css("display", "none");
	disk_left.css("display", "none");
	netdisk_page[0].className = "";
	transport_content.css("display", "");
	trans_left.css("display", "");
	transport_page[0].className = "active";

	isEmptyDownload();

	// 点击下载
	download_menu.on('click', function() {
		$(this).css("background", "##d0e3ea");
		upload_menu.css("background", "");
		upload_module.css("display", "none");
		download_module.css("display", "");
		isEmptyDownload();
	});

	// 点击上传
	upload_menu.on('click', function() {
		$(this).css("background", "#d0e3ea");
		download_menu.css("background", "");
		download_module.css("display", "none");
		upload_module.css("display", "");
		isEmptyUpload();
	});

	let uploadList = $("#uploadList")[0],
		liList = uploadList.getElementsByTagName("li"),
		total = document.getElementsByClassName("total")[0],
		operationList = document.getElementsByClassName("file-operate"),
		opeLen = operationList.length;
	(function () {
		for (let i = 1; i < opeLen - 1; i++) {
			let em_btn = operationList[i].getElementsByTagName("em")[0],
				em_cancel = operationList[i].getElementsByTagName("em")[1];

			em_btn.onclick = function () {
				if (em_btn.className != 'clear') {
					// 如果当前为暂停图标
					if (em_btn.className == "pause") {
						em_btn.className = "continue";
						pauseUpload(i - 1);
					}
					// 如果当前为继续图标
					else {
						em_btn.className = "pause";
						reUpload(i - 1);
					}
				}
				else { // 如果当前为清除图标
					liList[i - 1].style.display = "none";
					isEmptyUpload();
				}
			}
			// 点击移除图标
			em_cancel.onclick = function () {
				pauseUpload(i - 1);
				cancelUpload(i - 1);
				uploadList.removeChild(uploadList.children[i - 1]);
				total.style.width = 0;
				isEmptyUpload();
			}
		}
	})();
}

/* 跳转到我的网盘
*  @params
*  @return
*/
function toDisk() {
	let netdisk_page = $(".nav-title li").eq(0),
		transport_page = $(".nav-title li").eq(1),
		transport_content = $(".transport-content"),
		main_content = $(".main-content"),
		disk_left = $(".disk"),
		trans_left = $(".trans");
	main_content.css("display", "");
	disk_left.css("display", "");
	netdisk_page[0].className = "active";
	transport_content.css("display", "none");
	trans_left.css("display", "none");
	transport_page[0].className = "";
}

/* 取消上传文件
*  @params
		index 任务列表索引
*  @return
*/
function cancelUpload(index) {
	let file_name = null;
	if (upload_type === 1) {  //文件
		file_name = uploadFile_Obj[index].name;
	}
	else {   //文件夹
		file_name = files_arr[index].name;
	}

	let upload_cancel = `{"Option":"uploadCancel","FileName":"${file_name}","Size":"","ChunkNum":"","MD5":"","ChunkPos":""}`;
	console.log(upload_cancel);
	$.ajax(
		{
			url: uploadreq_rpc,
			data: upload_cancel,
			type: "POST",
			async: false,
			success: function (data) {
				if (data.code == 1000) {
					console.log(data.description);
					return true;
				}
				else {
					alert(data.description);
					return false;
				}
			},
			error: function () {
				alert("Network error!")
			}
		});
}

/* 全部取消下载
*  @params
*  @return
*/
function cancelList() {
	let uploadList = document.getElementById("uploadList"),
		liList = uploadList.getElementsByTagName("li"),
		len = liList.length;
	for (let i = 0; i < len; i++) {
		pauseUpload(i);
		cancelUpload(i);
	}
}