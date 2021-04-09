let host = "localhost:9090";

// 链接地址
let login_href = "http://" + host + "/login",
    regist_href = "http://" + host + "/register",
    index_href = "http://" + host + "/index",
    share_href = "http://" + host + "/share",
    account_href = "http://" + host + "/account",
    logout_href = "http://" + host + "/logout";

// 接口
let login_rpc = "http://" + host + "/authentication",
    register_rpc = "http://" + host + "/register",
    modify_rpc = "http://" + host + "/edit_account",
    deregister_rpc = "http://" + host + "/deregister",
    home_rpc = "http://" + host + "/dir_option",
    logout_rpc = "http://" + host + "/logout",
    upload_rpc = "http://" + host + "/upload_chunk",
    download_rpc = "http://" + host + "/download",
    uploadreq_rpc = "http://" + host + "/upload_request";

let username = localStorage.getItem("user"), //用户名
    password = localStorage.getItem("password"), //密码

    // 获取文件夹下所有文件需要的变量
    _DATA,  //目录数据(JSON格式)
    current_path = "/",  //当前所在的文件夹，默认根目录"/""
    select_file = "",  //当前选中的某个文件（夹）名，用于下载和重命名
    current_dirname_arr = [],  //当前进入的文件夹名组成的数组，用于路径跳转
    dir_name = "",  //当前点击进入的文件夹名，用于current_path的获取

    // 新建文件需要的变量
    newClick = false, //是否处于新建文件夹的状态

    // 删除需要的变量
    checkSelect_list = [],  //选中的文件（夹）名组成的数组，用于删除
   
    // 重命名需要的变量
    current_dom = null,  //右键某个文件所在的tr元素

    // 切片需要的变量
    chunkNum = 0, //总的分片数
    chunkSize = 0, //每片的大小
    chunkNum_uploaded = 1, //准备上传第几片
    end = 0, //每一片的结束字节

    // 计算MD5需要的变量
    fileReader = new FileReader(),
    md5 = null,
    md5_sum = null,  //MD5值
    end_md5 = true,
    e_obj = null,

    // 上传文件（夹）需要的变量
    upload_type = null, //上传类型: 1是文件，2是文件夹
    end_lastUpload = true, //上一个文件上传结束的标识

    file_choose = null,  //当前选择的文件，用于创建上传进度条
    file_obj = null,  //正在上传的当前文件对象
    fileName = null,  //正在上传的当前文件的文件名
    fileSize = 0;  //正在上传的当前文件的文件大小
    uploadFile_Obj = {
        length: 0,
        totalSize: 0
    },  //存储当前上传文件对象
    index_uploadFile_Obj = 0,  //即将上传的文件对象的索引，用于添加多少个上传进度表和上传文件夹
    formObj = {
        length: 0
    },  //存储每次上传文件的formdata信息
    eObj = {
        length: 0
    },  //存储绑定的e对象

    request = null,
    requestObj = {
        length: 0
    }, //上传请求，用于暂停
    currentRequest_arr = [],  //当前上传请求所在的数组
    argItem = [],  //保存每个文件的文件名、MD5值和request请求
    
    // 上传文件夹需要的变量
    files_Obj = null, //文件夹里包含的文件对象组成的fileList对象
    li_index = 0,  //每个文件上传进度表索引
    index_files_Obj = 0, //即将上传的fileList对象的索引
    

    // 上传进度表需要的变量
    end_lastLi = true,  //上一个进度表结束的标识
    last_endindex = 0,
    total_size = 0,  //上传列表的总字节数
    total_arr = [];  ///每个文件已上传字节数存入数组中，thisIndex作为索引，故索引下的值一直在变化，用于计算总进度


let result = null,
    xmlHttp = null;
