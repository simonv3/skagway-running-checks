const fs = require('fs');
const tabula = require('tabula-js');
const moment = require('moment');
const csv = require('csv');

const file = process.argv[2];
const fileDate = moment(file.replace(/[^0-9]+/g,''), 'MMDDYY');
const t = tabula(file, {pages: 'all'});

var futureCSV = [['date', 'to', 'description', 'amount']];
t.extractCsv((err, data) => {
  if (err) console.log(err);
  data.forEach(function (datum, idx) {
    csv.parse(datum, function (err, parsed) {
      if (err) console.log(err);
      var lineItem = parsed[0];

      if (parsed[0] &&
          lineItem[0] &&
          lineItem[0].split(' ')[0] &&
          moment(lineItem[0].split(' ')[0], 'M/DD/YYYY').isValid()) {
        var date = moment(lineItem[0].split(' ')[0], 'M/DD/YYYY');
        var to = lineItem[1].trim();
        var description = lineItem[2].trim();
        if (!isNaN(Number(description.replace(',','')))) {
          description = '';
        }
        var currency = lineItem[lineItem.length-1].trim();
        var amount = Number(currency.replace(/[^0-9\.]+/g,""));
        futureCSV.push([date.format(), to, description, amount]);
      }

      if (idx === data.length-1) {
        csv.stringify(futureCSV, function (err, output) {
          if (err) console.log(err);
          fs.writeFileSync('./check-runs/' + fileDate.format('MM-DD-YY') + '.csv', output);
        });
      }
    });
  });
});
