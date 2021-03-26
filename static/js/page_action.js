
// 添加上传文件任务的进度表
function addLi(i) {
	let file = null;
	let index = i;
	if (upload_type === 1) {
		file = fileObj[index];
	}
	else {
		file = file_arr[index];
	}
	let file_name = file.name,
		file_size = bytesToSize(file.size);
	console.log("file_name:" + file_name);
	console.log("fileSize:" + file_size);
	console.log("dir:" + current_file);
	newLoadli(file_name, file_size, dir);
	end_lastLi = true;
	indexLi++;
	if (upload_type === 1) {
		if (end_last) {  //上一个任务结束了才开始当前任务
			end_last = false;
			getFileMd5(0);
		}
	}
	else {
		if (indexLi >= file_arr.length) {
			getFileMd5(0);
		}
		else {
			addLi(indexLi);
		}
	}
}

/* 创建上传/下载列表
*  @params
*      name,size,dir [string] 文件名，文件大小，上传目录
*  @return
*/
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
	div_sta.innerText = "等待上传";

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

/* 文件上传进度
*  @params
*      progress [object] 上传进度对象
*  @return
*/
function updateProgress(progress) {
	let uploadList = document.getElementById("uploadList"),
		len = uploadList.children.length,
		thisIndex = 0, //索引
		total_proc = 0; //总进度
	if (upload_type === 1) {
		thisIndex = obj_index;
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
		if (upload_type === 2) { //上传文件夹
			let len = file_arr.length;
			for (let i = 0; i < total_percent.length; i++) {
				let sum = total_percent[i] / len;
				total_proc += sum;
			}
		}
		else { //上传文件
			let len = fileObj.length;
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

/* 上传文件
*  @params
*  @return
*/
function upload(e) {
	upload_type = 1; //上传文件
	file_one = document.getElementById('file').files[0];
	let form_info = new FormData(document.getElementById('filename'));
	formObj = addFileObj(form_info, formObj);
	fileObj = addFileObj(file_one, fileObj);
	eObj = addFileObj(e, eObj);
	requestObj = addFileObj(RequestArray, requestObj);
	// requestObj = addFileObj(request_arr, requestObj);
	if (end_lastLi) {
		end_lastLi = false;
		addLi(indexLi);
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
		file_name = fileObj[index].name;
	}
	else {
		file_name = file_arr[index].name;
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
					uploadFile(end - chunkSize);
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

/* 分片上传文件
*  @params
		start [number] 起始字节
*  @return
*/
function uploadFile(start) {
	current_file = ".";
	endupload_flag = false;
	// 上传完成 
	if (start >= fileSize) {
		console.log("上传完成......");
		end_last = true;
		endupload_flag = true;
		process_global = 0;
		chunkNum_uploaded = 1;
		if (upload_type === 1) {
			obj_index++;
			if (obj_index >= fileObj.length) {
				fileObj = {
					length: 0
				};
				queryData(current_file);
			}
			else {
				getFileMd5(obj_index);
			}
		}
		else {
			file_index++;
			if (file_index >= file_arr.length) {
				queryData(current_file);
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
	let form_data = formObj[obj_index]; //获取表单信息
	let formData = new FormData();
	if (upload_type === 2) { //上传文件夹
		formData.append("uploadfile", file_obj.slice(start, end)) //将获取的文件分片赋给新的对象
	}
	else { //上传文件
		formData.append("uploadfile", form_data.get("uploadfile").slice(start, end)) //将获取的文件分片赋给新的对象
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
			argItem[2] = xhr; //将每个上传任务的每一片存入requestObj对象中，该对象存入的是request_arr数组中
			return xhr;
		},
		success: function (data) {
			if (data.code == 1000) {
				console.log(data.description);
				chunkNum_uploaded++;
				console.log("准备上传第" + chunkNum_uploaded + "片......");
				uploadFile(end);
			}
			else {
				alert(data.description);
				return false;
			}
		}
	});
}

/* 上传文件夹
*  @params
*  @return
*/
function uploadDir() {
	upload_type = 2; //上传文件夹
	$('#folder').change(function (e) {
		eObj = addFileObj(e, eObj);
		let folder_name = null; //文件夹名
		let files = e.target.files; //所有文件
		file_arr = files;
		folder_name = (files[0].webkitRelativePath).split('/')[0]; //获取文件夹名

		//新建上传的同名文件夹
		let new_data = `{"Opt":1,"DirName":["${folder_name}"]}`;
		console.log(new_data);
		$.ajax(
			{
				url: home_rpc,
				data: new_data,
				type: "POST",
				async: false,
				success: function (data) {
					if (data.code == 1000) {
						console.log(data.description);
						queryData(folder_name);
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
		indexLi = 0;
		addLi(indexLi);
	});
}

/* 排队上传单个文件
*  @params
		index 文件数组索引
*  @return
*/
function uploadEver(index) {
	if (upload_type === 1) {
		file_obj = fileObj[index];
	}
	else {
		file_obj = file_arr[index];
	}
	console.log(file_obj);
	fileSize = file_obj.size;
	let file_name = file_obj.name,
		file_size = bytesToSize(file_obj.size);

	chunkSize = chunk(fileSize);
	chunkNum = Math.ceil(fileSize / chunkSize);
	let upload_data = `{"Option":"uploadFile","FileName":"${file_name}","Size":"${fileSize}","ChunkNum":"${chunkNum}","MD5":"${md5_file}","ChunkPos":"1"}`;
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
					argItem[0] = file_name;
					argItem[1] = md5_file;
					RequestArray.push(argItem);
					console.log(argItem);
					uploadFile(0);
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

/* 删除文件
*  @params
*  @return
*/
function deleteFile() {
	current_file = ".";
	checkSelect();
	let del_data = `{"Opt":2,"DirName":["${select_list}"]}`;
	$.ajax(
		{
			url: home_rpc,
			data: del_data,
			type: "POST",
			async: false,
			success: function (data) {
				if (data.code == 1000) {
					console.log(data.description);
					let menu = document.getElementsByClassName("menu")[0];  //右键的菜单
					menu.style.display = "none";
					select_list = [];
					queryData(current_file);
					clearMoreBtn();
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
	current_file = ".";
	let upload_module = document.getElementsByClassName("upload-progress")[0], //上传
		uploadList = document.getElementById("uploadList"),
		download_module = document.getElementsByClassName("download-progress")[0], //下载
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

	let liList = uploadList.getElementsByTagName("li"),
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
