const request = require("request");
const cheerio = require("cheerio");
// {func} to require our own method
const {gifs} = require("./scorecard");
function getAllMatch(url){
    request(url, cb);
}
function cb(err, res, body){
    if(err){
        console.error("error", err);
    }
    else{
        extractAllMatchLink(body);
    }
}

function extractAllMatchLink(html){
    let selecTool = cheerio.load(html);
    let scorecardElemArr = selecTool('div[class = "ds-px-4 ds-py-3"]>a');
    console.log(scorecardElemArr.length);

    for(let i=0; i<scorecardElemArr.length;i++){
        let scorecardLink = selecTool(scorecardElemArr[i]).attr("href");
        let fullLink = "https://www.espncricinfo.com"+ scorecardLink;

        gifs(fullLink);
    }
}
module.exports = {
  getAllMatch: getAllMatch,
};