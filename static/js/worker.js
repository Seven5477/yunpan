var obj = {
    md5: 999
}

addEventListener("message", function (file) {
    importScripts('./spark-md5.min.js');

    let file_obj = file.data,
        fileReader = new FileReader(),
        md5 = new SparkMD5(),
        currentChunk = 0,
        chunkSize = Math.ceil(file_obj.size / 5), //分成10片，每片的大小
        start = 0;  //起始字节
    let loadFile = () => {
        let slice = file_obj.slice(start, start + chunkSize);  //根据字节范围切割每一片
        fileReader.readAsBinaryString(slice);
    }
    loadFile();
    fileReader.onload = e => {
        console.log("read chunk nr", currentChunk + 1, "of", 5);
        md5.appendBinary(e.target.result);
        currentChunk++;
        if (start < file_obj.size) {
            start += chunkSize;
            loadFile();
        } else {
            md5_sum = md5.end();
            obj.md5 = md5_sum;
            postMessage(JSON.stringify(obj));
        }
    };
});