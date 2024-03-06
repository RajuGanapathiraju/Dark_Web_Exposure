var tr = require('tor-request');
const cheerio = require('cheerio');
const fs = require('fs');
const async = require('async');
var colors = require('colors');

const keywords = ["keyword1","keyword2","keyword3","keyword4","keyword5"];

async.eachSeries(keywords, (keyword, cb) => {


let getToken = new Promise((resolve, reject) => {

tr.request(`http://xmh57jrknzkhv6y3ls3ubitzfqnkrwxhopf5aygthi7d6rplyvk3noyd.onion/cgi-bin/omega/omega`, function (err, res, body) {
  if (!err && res.statusCode == 200) {
    const $ = cheerio.load(`${body}`);
    // Get the value of the input element with id 'tkn'
    const tokenValue = $('#tkn').attr('value');

    console.log(`\n`,tokenValue);

    resolve(tokenValue)
  }
  else{
    reject(err);
  }
});


})


getToken.then((result) => {

   tr.request(`http://xmh57jrknzkhv6y3ls3ubitzfqnkrwxhopf5aygthi7d6rplyvk3noyd.onion/cgi-bin/omega/omega?P=${keyword}&DEFAULTOP=and&DB=default&FMT=query&xDB=default&xFILTERS=.%7E%7E&tkn=${result}%0D%0A`, function (err, res, body) {
  if (!err && res.statusCode == 200) {
    const $ = cheerio.load(`${body}`);

    //console.log($.html());


    if ($.html().indexOf("Term frequencies:") > -1){
        
        const filePath = `${keyword}_dark_web_results.html`;

        fs.writeFileSync(filePath, $.html());

        console.log(`results for ${keyword} is saved to `.red, filePath);

        cb();
    }

    else{

       console.log(`No results for ${keyword}, You are safe dude !!!!`.green); 

       cb();
    }
  }
  else{
    console.log(err);
  }
}); 

}).catch((exception) => {
    console.log(`exceptions \n`, exception);
})




}, () => {
    console.log(`\ncompleted`.blue);
})










