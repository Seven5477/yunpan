var container = document.getElementsByClassName("content")[0];
console.log(container);
var json_table =
  '{"Dirs": [{"DirName": "test","ModTime": "2020-09-19T22:31:05.3257899+08:00"}],"Files": [{"FileName": "ONVIF-AccessControl-Service-Spec.pdf","Size": 499556,"ModTime": "2020-09-12T22:14:34+08:00"},{"FileName": "The.Boys.S02E02.Proper.Preparation.and.Planning.1080p.AMZN.WEB-DL.DDP5.1.H.264-NTb.mkv","Size": 3546962251,"ModTime": "2020-09-30T16:25:54.6441114+08:00"}]}';

var message = JSON.parse(json_table);

//创建表元素
var json_table = document.getElementsByTagName("table")[0];
json_table.style.borderCollapse = "collapse";
var json_tr = document.createElement("tr");

for (var num in message.Files) {
  	var json_tr = document.createElement("tr");

  	for (var key in message.Files[num]) {
    	var json_td = document.createElement("td");
   	 	//获取键名
    	var td_txt = document.createTextNode(message.Files[num][key]);
    	if (key != "FileName") {
			json_td.appendChild(td_txt);
		} 
		else {
      		var json_div = document.createElement("div");
      		json_div.className = "filename";

			json_div.appendChild(td_txt);
			json_td.appendChild(json_div);
		}

		json_tr.appendChild(json_td);
		json_table.appendChild(json_tr);
		json_tr.className = "trstyle";

		if (key == "FileName") {
			json_td.className = "tdwidth1";
		} else if (key == "Size") {
			json_td.className = "tdwidth2";
		} else if (key == "ModTime") {
			json_td.className = "tdwidth3";
			// var text = json_td.innerHTML
			// console.log(text)
			// text = text.replace(/T/, " ");
			// console.log(text)
			// text = text.substring(0,td_txt.indexOf("."));
			// console.log(text)
		}

		//计算点击次数
		var count = 0;

		//按单元格显示对应的名片
		json_td.onclick = function () {
		var txt = "";
		count++;

		for (var key in message) {
			txt += message[key][this.parentNode.rowIndex - 1] + "   ";
		}

		//再次点击时删除之前的名片
		if (count > 1) {
			container.removeChild(document.getElementsByTagName("div")[1]);
		}

		//创建名片
		createCard(txt);
		};
	}
}

//添加表格
container.appendChild(json_table);

//改变表格样式
// json_table.style.border = "1px solid black";
// json_table.style.width = "800px";
