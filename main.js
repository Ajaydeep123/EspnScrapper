/**
step 1: get the html from url using request()
step 2: load html using cheerio -> selectTool = cheerio.load(html) -> cheerio simply parses markup and provides an API for manipulating the resulting data structure
step 3: using selectTool we try to get <a> tag whiich has href of allResults page. we have use selector -> attribute selector here
step 4: After getting <a> we want the href that has relative link for next page using -> anchorOfAllResultsButton.attr("href");
step 5: new url = url + relativelink
step 6: the html of this new link needs to be loaded for getting all match links -> pass this url to new function where we can again use request to load html 

*/

let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";

const request = require("request");
const cheerio = require("cheerio");
const allMatchObj = require("./allmatch");
const fs= require("fs");
const path= require("path");
request(url, cb);

function cb(err, res, body) {
  if (err) {
    console.error("error", err);
  } else {
    handleHTML(body);
  }
}
//console.log(__dirname);
let iplPath = path.join(__dirname,"IPL");
if (!fs.existsSync(iplPath)) {
  fs.mkdirSync(iplPath);
}

function handleHTML(html){
    let selecTool = cheerio.load(html);
    let anchorElem = selecTool('span[class = "ds-inline-flex ds-items-center ds-leading-none"]>a[class="ds-block ds-text-center ds-uppercase ds-text-ui-typo-primary ds-underline-offset-4 hover:ds-underline hover:ds-decoration-ui-stroke-primary ds-block"]');
    // console.log(anchorElem);
    //attr methods -> Method for getting all attributes and their values
    let relativeLink = anchorElem.attr("href");
    // console.log(relativeLink);
    let fullLink = "https://www.espncricinfo.com" + relativeLink;
    // console.log(fullLink);
    allMatchObj.getAllMatch(fullLink);
}

