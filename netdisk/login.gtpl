<html>
<head>
<title></title>
</head>
<body>
<form action="/login" method="post">
	<input type="checkbox" name="interest" value="football">足球
	<input type="checkbox" name="interest" value="basketball">篮球
	<input type="checkbox" name="interest" vlaue="tennis">网球
	<select name="fruit">
	<option value="apple">apple</option>
	<option value="pear">pear</option>
	<option value="banana">banana</option>
	</select>
	<input type="radio" name="gender" value="1">男
	<input type="radio" name="gender" value="2">女
	用户名:<input type="text" name="username">
	密码:<input type="password" name="password">
	<input type="hidden" name="token" value="{{.}}">
	<input type="submit" value="登录">
</form>
</body>
</html>
