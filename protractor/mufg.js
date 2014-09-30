var fs = require('fs');

var lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

var outFilePath = [
  'mufg-', lastMonth.getFullYear(), '-', (lastMonth.getMonth() + 101).toString().substr(-2), '.tsv'
].join('');

function $x (xpath) {
  return element(by.xpath(xpath));
}

describe('mufg', function () {
  browser.ignoreSynchronization = true;
  browser.get('https://entry11.bk.mufg.jp/ibg/dfw/APLIN/loginib/login?_TRANID=AA000_001');

  it('ログイン', function () {
    $('input[name="KEIYAKU_NO"]').sendKeys(browser.params.mufg.id);
    $('input[name="PASSWORD"]')  .sendKeys(browser.params.mufg.password);
    $('[alt="ログイン"]').click();
  });

  it('お知らせがあったら読む', function () {
    function readInformationIfAny() {
      browser.getCurrentUrl().then(function (url) {
        if (/InformationIchiranShoukaiMidoku\.do/.exec(url)) {
          var information = $x('//table[@class="data"]/tbody[1]/tr');

          information.getText().then(console.log);
          information.element(by.buttonText('表示')).click();

          $('[alt="トップページへ"]').click().then(readInformationIfAny);
        }
      });
    }

    readInformationIfAny();
  });

  it('ログイン完了 - 明細へ', function () {
    $('#setAmountDisplay').getText().then(function (amount) {
      console.log('残高: ' + amount);
    });
    $x('//a[img[@alt="入出金明細をみる"]]').click();
  });

  it('先月の明細を見る', function () {
    $('input#last_month').click();
    $x('//button[img[@alt="照会"]]').click();
  });

  it('ファイルに書き出す', function () {
    $$('#no_memo table tr').map(function (tr) {
      return tr.all(by.css('td')).map(function (td) { return td.getText() });
    }).then(function (rows) {
      var content = rows.filter(function (cols) {
        return cols.length === 5;
      }).map(function (cols) {
        return cols.map(function (col) { return col.replace(/\s+/g, ' ') }).join('\t');
      }).join('\n');

      fs.writeFileSync(outFilePath, content);
      console.log('wrote: ' + outFilePath);
    });
  });
});
