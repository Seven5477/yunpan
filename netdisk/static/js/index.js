window.onload = function() {
	let container = document.getElementsByClassName("content")[0];

	let index_data = "{\"Opt\""+ ":" + "0" + "," + "\"DirName\"" + ":" + "[\".\"]" + "}";
	let json_str;
	let message;

	$.ajax(
		{
			url:"http://localhost:9090/home",
			data: index_data,
			type: "POST",
			async: false,
			success: function(data)
			{
				if(data){
					console.log("success!");
					json_str = data;
					return true;
				}
				else{
					console.log("error!");
					return false;
				}
			},
			error: function()
			{
				alert("服务器错误")
			}
		});

	//创建表元素
	let json_table = document.getElementsByTagName("table")[0];
	json_table.style.borderCollapse = "collapse";
	let json_tr = document.createElement("tr");

	message = JSON.parse(json_str);
	console.log(message)
	// 遍历对象的属性
	for(let prop in message) {
		// 遍历对象的某个属性
		for (let num in message[prop]) {
			let json_tr = document.createElement("tr");
			// 遍历对象的某个属性的数组
			for (let key in message[prop][num]) {
				let json_td = document.createElement("td");
				//获取键名
				let td_txt = document.createTextNode(message[prop][num][key]);
				if (key != "FileName") {
					json_td.appendChild(td_txt);
				} 
				else {
					let json_div = document.createElement("div");
					json_div.className = "filename";

					json_div.appendChild(td_txt);
					json_td.appendChild(json_div);
				}

				json_tr.appendChild(json_td);
				json_table.appendChild(json_tr);
				json_tr.className = "trstyle";

				if (key == "FileName" || key == "DirName") {
					json_td.className = "tdwidth1";
				} 
				else if (key == "Size") {
					json_td.className = "tdwidth2";
				} 
				else if (key == "ModTime") {
					json_td.className = "tdwidth3";
					// let text = json_td.innerHTML
					// console.log(typeof td_txt)
					// console.log(td_txt)

					// text = String(td_txt);
					// text = text.replace(/T/, " ");
					// console.log(text)
					// text = text.substring(0,td_txt.indexOf("."));
					// console.log(text)
				}
			}
		}
	}
}

// 		//计算点击次数
// 		let count = 0;

// 		//按单元格显示对应的名片
// 		json_td.onclick = function () {
// 		let txt = "";
// 		count++;

// 		for (let key in message) {
// 			txt += message[key][this.parentNode.rowIndex - 1] + "   ";
// 		}

// 		//再次点击时删除之前的名片
// 		if (count > 1) {
// 			container.removeChild(document.getElementsByTagName("div")[1]);
// 		}

// 		//创建名片
// 		createCard(txt);
// 		};
// 	}
// }

// //添加表格
// container.appendChild(json_table);

// //改变表格样式
// // json_table.style.border = "1px solid black";
// // json_table.style.width = "800px";
