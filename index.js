var tr = require('tor-request');
const cheerio = require('cheerio');
const async = require('async');
var colors = require('colors');
const {
    execSync
} = require('child_process');

const keywords = ["google", "demandbase", "db1", "ivsales", "facebook"];


async function start() {

  let command = "brew services restart tor";

  await execSync(command);

  async.eachSeries(keywords, (keyword, cb) => {


    let getToken = new Promise((resolve, reject) => {

        tr.request(`http://xmh57jrknzkhv6y3ls3ubitzfqnkrwxhopf5aygthi7d6rplyvk3noyd.onion/cgi-bin/omega/omega`, function(err, res, body) {
            if (!err && res.statusCode == 200) {
                const $ = cheerio.load(`${body}`);
                // Get the value of the input element with id 'tkn'
                const tokenValue = $('#tkn').attr('value');

                console.log(`\n`, tokenValue);

                resolve(tokenValue)
            } else {
                reject(err);
            }
        });


    })


    getToken.then((result) => {

        tr.request(`http://xmh57jrknzkhv6y3ls3ubitzfqnkrwxhopf5aygthi7d6rplyvk3noyd.onion/cgi-bin/omega/omega?P=${keyword}&DEFAULTOP=and&DB=default&FMT=query&xDB=default&xFILTERS=.%7E%7E&tkn=${result}%0D%0A`, function(err, res, body) {
            if (!err && res.statusCode == 200) {
                const $ = cheerio.load(`${body}`);

                //console.log($.html());


                if ($.html().indexOf("Term frequencies:") > -1) {

                    const results = [];

                    $('table tr').each((index, row) => {

                        const $tds = $(row).find('td');
                        const result = {
                            // Extract values from the first TD
                            keyword: keyword,
                            timestamp: Math.floor(Date.now() / 1000),
                            size: $tds.eq(0).find('span').text().trim(),
                            relevantCheckbox: $tds.eq(0).find('input[type="checkbox"]').val(),

                            // Extract values from the second TD
                            title: $tds.eq(1).find('b a').text().trim(),
                            description: $tds.eq(1).find('small:first').text().trim(),
                            url: $tds.eq(1).find('a').attr('href'),
                        };
                        results.push(result);
                    });

                    console.log(results);

                    cb();

                } else {

                    console.log(`No results for ${keyword}, You are safe dude !!!!`.green);

                    cb();
                }
            } else {
                console.log(err);
            }
        });

    }).catch((exception) => {
        console.log(`exceptions \n`, exception);
    })




}, () => {
    console.log(`\ncompleted`.blue);
})

}

start();

