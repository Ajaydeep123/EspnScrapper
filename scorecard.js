const request = require("request");
const cheerio = require("cheerio");
const fs= require("fs");
const path= require("path");
const xlsx = require("xlsx");

function getInfoFromScorecard(url){
   // console.log("from scorecards.js", url);
request(url, cb);
}

function cb(err, res, body){
    if(err){
        console.log(err);
    }else{
      console.log("---------------------------------------------------------------------------------------");
        getMatchDetails(body);

    }
}
function getMatchDetails(html){

    let selecTool = cheerio.load(html);
    let desc = selecTool(".ds-text-tight-m.ds-font-regular.ds-text-ui-typo-mid"); // description
    let descArr = desc.text().split(",")
    // console.log(descArr);
    let dateOfMatch = descArr[2];
    let venueOfMatch = descArr[1];
    console.log(dateOfMatch);
    console.log(venueOfMatch);

    let matchResElement = selecTool( ".ds-text-tight-m.ds-font-regular.ds-truncate");
    let matchResult=  matchResElement.text();
    console.log(matchResult);

    let teamName = selecTool("a[class = 'ds-text-ui-typo hover:ds-text-ui-typo-primary ds-block']");
   // console.log(teamName.text());
    let team1 = selecTool(teamName[0]).text();
    let team2 = selecTool(teamName[1]).text();
    console.log(team1);
    console.log(team2);

    let allBatsmanRows = selecTool(".table.batsman tbody>tr");
    console.log(allBatsmanRows.text());

     //5. get innings 

     let allBatsmenTable = selecTool(".ds-w-full.ds-table.ds-table-xs.ds-table-fixed.ci-scorecard-table > tbody");
    
     // console.log(allBatsmenTable.html()); //html of table 1, because two table is there
     // console.log(allBatsmenTable.length); // 2
 
     // for(let i=0; i<allBatsmenTable.length;i++){
     //     let tablehtml = selecTool(allBatsmenTable[i]).html();
     //     console.log(tablehtml);
     // }
 
  for (let i = 0; i < allBatsmenTable.length; i++) {
         let allRows = selecTool(allBatsmenTable[i]).find("tr"); // all rows arr -> data of batsmen + empty rows 
         for (let i = 0; i < allRows.length; i++) {
             let row = selecTool(allRows[i]); // selectool isliye likha qki .find() krna h aage row pe, jo ki direct nhi kr skte , isme tr agya-> jisme bohot saare td hai :) 
             let firstColmnOfRow = row.find("td")[0]; //first td of tr
             let spann = selecTool(firstColmnOfRow).find("span"); //getting span of td
             
             // skip didnot bat row
             if(row.hasClass("!ds-border-b-0")){
                 // console.log("did not bat row");
             }
 
             //row -> td -> span that have this this class only have data (skipping empty row indirectly)
             else if(selecTool(spann).hasClass("ds-inline-flex" && "ds-items-center" && "ds-leading-none")){     //for every table -> get all rows of that table -> find first td span -> because span has special class that empty row doesn't have 
  
        let playerName = selecTool(row.find("td")[0]).text().trim();
        // console.log(playerName);
        let runs = selecTool(row.find("td")[2]).text();
        let balls = selecTool(row.find("td")[3]).text();
        let numberOf4 = selecTool(row.find("td")[5]).text();
        let numberOf6 = selecTool(row.find("td")[6]).text();
        let sr = selecTool(row.find("td")[7]).text();

        console.log(
          `playerName -> ${playerName}| runsScored ->  ${runs}| ballsPlayed ->  ${balls}| numbOfFours -> ${numberOf4}| numbOfSixes -> ${numberOf6}|  strikeRate-> ${sr}`
        );
        processInformation(
            dateOfMatch,
            venueOfMatch,
            matchResult,
            team1,
            team2,
            playerName,
            runs,
            balls,
            numberOf4,
            numberOf6,
            sr
          );
      

        }
    }
}
function processInformation(dateOfMatch,venueOfMatch,matchResult,team1,team2,playerName,runs,balls,numberOf4,numberOf6,sr){
        let mainIplFolder = path.join(__dirname, "IPL");

        if(!fs.existsSync(mainIplFolder)){
            fs.mkdirSync(mainIplFolder);
        }

        let teamNamePath = path.join(__dirname, "IPL", team1)
        if (!fs.existsSync(teamNamePath)) {
            fs.mkdirSync(teamNamePath);
          }
        
        let playerPath= path.join(teamNamePath,playerName+ ".xlsx");
        let content =excelReader(playerPath, playerName); 
        let playerObj= {
            dateOfMatch,
            venueOfMatch,
            matchResult,
            team1,
            team2,
            playerName,
            runs,
            balls,
            numberOf4,
            numberOf6,
            sr
        };
        content.push(playerObj);
        excelWriter(playerPath,content,playerName);
}
}

function excelReader(playerPath, sheetName) {
    if (!fs.existsSync(playerPath)) {
      //if playerPath does not exists, this means that we have never placed any data into that file 
      return [];
    }
    //if playerPath already has some data in it 
    let workBook = xlsx.readFile(playerPath);
    //A dictionary of the worksheets in the workbook. Use SheetNames to reference these.
    let excelData = workBook.Sheets[sheetName];
    let playerObj = xlsx.utils.sheet_to_json(excelData);
    return playerObj;
  }
  function excelWriter(playerPath, jsObject, sheetName) {
    //Creates a new workbook
    let newWorkBook = xlsx.utils.book_new();
    //Converts an array of JS objects to a worksheet.
    let newWorkSheet = xlsx.utils.json_to_sheet(jsObject);
    //it appends a worksheet to a workbook
    xlsx.utils.book_append_sheet(newWorkBook, newWorkSheet, sheetName);
    // Attempts to write or download workbook data to file
    xlsx.writeFile(newWorkBook, playerPath);
  }



module.exports = {
    gifs:getInfoFromScorecard
}

