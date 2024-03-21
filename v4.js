var tr = require('tor-request');
const cheerio = require('cheerio');
const async = require('async');
var colors = require('colors');

const fs = require('fs');

const {
    execSync
} = require('child_process');


const {
    MongoClient
} = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const keywords = ["keyword1", "keyword2", "keyword3"];


async function start() {

    await client.connect();

    console.log('Connected successfully to server\n');

    const dbName = 'automation';
    const db = client.db(dbName);


    let command = "brew services restart tor";

    await execSync(command);

    async.eachSeries(keywords, (keyword, cb) => {


        let getToken = new Promise((resolve, reject) => {

            tr.request(`http://xmh57jrknzkhv6y3ls3ubitzfqnkrwxhopf5aygthi7d6rplyvk3noyd.onion/cgi-bin/omega/omega`, function(err, res, body) {
                if (!err && res.statusCode == 200) {
                    const $ = cheerio.load(`${body}`);
                    // Get the value of the input element with id 'tkn'
                    const tokenValue = $('#tkn').attr('value');

                    console.log(`got the search token for ${keyword}\n`, tokenValue);

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

                    if ($.html().indexOf("Term frequencies:") > -1) {

                        const results = [];

                        $('table tr').each((index, row) => {

                            const $tds = $(row).find('td');
                            const result = {
                                // Extract values from the first TD
                                keyword: keyword,
                                timestamp: Math.floor(Date.now() / 1000),
                                size: $tds.eq(0).find('span').text().trim(),
                                _id: $tds.eq(0).find('input[type="checkbox"]').val(),

                                // Extract values from the second TD
                                title: $tds.eq(1).find('b a').text().trim(),
                                description: $tds.eq(1).find('small:first').text().trim(),
                                url: $tds.eq(1).find('a').attr('href'),
                            };
                            results.push(result);
                        });


                        results.forEach((item, index) => {

                            db.collection('dark_results').insertOne(item)
                                .then(result => {
                                    console.log(`\nResults stored:\n`, item);
                                    if (index === results.length - 1) { // Check if this is the last item
                                        cb(); // Call the callback only for the last item
                                    }
                                })
                                .catch(error => {
                                    // Check if the error is a duplicate key error
                                    if (error.code === 11000) {
                                        console.log(`Duplicate key error:\n`);
                                        if (index === results.length - 1) { // Check if this is the last item
                                            cb(); // Call the callback only for the last item
                                        }
                                    } else {
                                        console.error(`Error inserting documents:`, error);
                                        cb(error); // Pass the error to the callback
                                    }
                                });
                        })



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




    }, (err) => {
        if (err) console.log(`\ngot error in loops\n`);
        htmlReport();
    })


async function htmlReport() {
    try {
        const collection = db.collection('dark_results');
        const query = { sent: null };
        const projection = { _id: 0, keyword: 1, timestamp: 1, size: 1, title: 1, description: 1, url: 1 };

        const Results = await collection.find(query, { projection }).toArray();

        if (results.length > 0) {
            let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DarkEye</title>
</head>
<body>
  <h1>Dark Web Results</h1>
  <table border="1">
    <thead>
      <tr>
        <th>Keyword</th>
        <th>Timestamp</th>
        <th>Size</th>
        <th>Title</th>
        <th>Description</th>
        <th>URL</th>
      </tr>
    </thead>
    <tbody>`;

            results.forEach(result => {
                html += `<tr>
      <td>${result.keyword}</td>
      <td>${result.timestamp}</td>
      <td>${result.size}</td>
      <td>${result.title}</td>
      <td>${result.description}</td>
      <td><a href="${result.url}">${result.url}</a></td>
    </tr>`;
            });

            html += `</tbody>
  </table>
</body>
</html>`;

            const filePath = `./results/html-report-${Date.now()}.html`;
            await fs.promises.writeFile(filePath, html);

            // Update sent flag to 1 for the documents included in the report
            const updateResult = await collection.updateMany(query, { $set: { sent: 1 } });
            console.log(`\nHTML report generated and stored at: ${filePath}\n`);
            console.log(`\nUpdated the state for ${updateResult.modifiedCount} documents\n`);
            process.exit(1);
        } else {
            console.log('No new alerts');
            process.exit(1);
        }
    } catch (error) {
        console.error('Error generating HTML report:', error);
    }
}

}

start();