var host = "localhost:9090";

// 链接地址
var login_href = "http://" + host + "/login",
    regist_href = "http://" + host + "/regist",
    index_href = "http://" + host + "/index",
    share_href = "http://" + host + "/share",
    logout_href = "http://" + host + "/logout";

// 接口
var login_rpc = "http://" + host + "/login_auth",
    regist_rpc = "http://" + host + "/regist",
    home_rpc = "http://" + host + "/home",
    logout_rpc = "http://" + host + "/logout",
    upload_rpc = "http://" + host + "/upload",
    download_rpc = "http://" + host + "/download",
    uploadreq_rpc = "http://" + host + "/upload_request",
    upload_rpc = "http://" + host + "/upload";

var current_file = ".";  //当前所在的文件夹
    select_file = "",  //选中的文件
    select_dir = "",  //当前点击的目录
    current_dir = [],  //当前路径数组
    select_list = [],  //选中的文件数组，用于删除
    newClick = false, //新建文件夹调用标识
    md5_file = null,
    /*切片需要的变量*/
    chunkNum = 0, //分片数
    chunkNum_uploaded = 1, //已上传片数
    end = 0, //结束字节

    upload_type = null, //上传类型:1是文件，2是文件夹

    /*上传文件需要的变量*/
    file_one = null, //上传文件的文件对象
    request = null, //上传请求，用于暂停
    eObj =  {
        length: 0
    }; //存储
    formObj =  {
        length: 0
    }; //存储每次点击上传文件里的文件的formdata信息
    fileObj =  {
        length: 0
    }; //存储每次点击上传文件里的文件
    obj_index = 0; //fileObj的索引属性
    end_last = true; //上一个文件上传结束的标识

    /*上传文件夹需要的变量*/
    file_arr = null, //文件夹的文件数组
    file_index = 0, //文件夹里的文件数组的索引
    file_obj = null, //上传文件夹里的每个文件

    endupload_flag = true, //每个文件上传结束的标识
    process_global = 0, //每个文件总进度总进度
    total_percent = [], //总进度条数组：里面的值为每个文件的总进度，数组里的值相加能得到总进度条的值

    username = localStorage.getItem("user"); //用户名

var chunkSize = 0, //每片的大小
    fileSize = 0;  //文件大小