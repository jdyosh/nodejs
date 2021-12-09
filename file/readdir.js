var testFolder = '../data';
var fs = require('fs');

fs.readdir(testFolder, function(error, filelist){
    console.log(filelist); // Array로 전달
});