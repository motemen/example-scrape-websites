var fs = require('fs');
var inbox = require('inbox');
var iconv = require('iconv');
var converter = new iconv.Iconv("ISO-2022-JP", "UTF-8");

var lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

var outFilePath = [
  'rakuten-', lastMonth.getFullYear(), '-', (lastMonth.getMonth() + 101).toString().substr(-2), '.tsv'
].join('');

// ワンタイムキー取得用プロミス
var oneTimeKeyPromise;
var oneTimeKey;

describe('rakuten', function () {
  browser.ignoreSynchronization = true;
  browser.driver.get('https://fes.rakuten-bank.co.jp/MS/main/RbS?CurrentPageID=START&&COMMAND=LOGIN');

  it('IMAPサーバにログインしてワンタイムキー通知メールを取得できるようイベント監視', function () {
    // http://ayapi.github.io/posts/observingimaponnode/
    // http://liginc.co.jp/web/service/facebook/153850

    var deferred = protractor.promise.defer();
    oneTimeKeyPromise = deferred.promise;

    var imap = inbox.createConnection(
      false, browser.params.rakuten.imap.server, {
        secureConnection: true,
        auth: {
          user: browser.params.rakuten.imap.id,
          pass: browser.params.rakuten.imap.password
        }
      }
    );

    imap.on('connect', function() {
      console.log('connected');
      imap.openMailbox('INBOX', function(error){
        if(error) throw error;
      });
    });

    imap.on('new', function(message) {
      if (message.from.address !== 'service@ac.rakuten-bank.co.jp') {
        console.log('this message is not from rakuten bank. skip.');
        console.log(message.title);
        console.log(message.from.address);
        return;
      }
      var body = '';
      var stream = imap.createMessageStream(message.UID);
      stream.on("data", function(chunk) {
        body += chunk;
      });
      stream.on("end", function() {
        body = converter.convert(body).toString();
        // FIXME: body にはヘッダ部も含まれているため RFC822 に則ってちゃんとパースする？
        if (/ワンタイムキー[ 　]*[:：][ 　]*([a-zA-Z0-9]+)/.test(body)) {
          var otKey = RegExp.$1;
          console.log('ワンタイムキーを本文から取得成功:' + otKey);
          deferred.fulfill(otKey);
        } else {
          console.log('ワンタイムキーを本文から取得失敗');
          deferred.reject();
        }
      });
    });

    imap.connect();
  });

  it('楽天銀行ログイン', function () {
    $('.user_id').sendKeys(browser.params.rakuten.id);
    $('.login_password').sendKeys(browser.params.rakuten.password);
    $('[value="ログイン"]').click();
  });

  it('ワンタイムキーを発行する', function () {
    $('[src="/rb/fes/img/common/btn_onetime.gif"]').element(by.xpath('..')).click();
  });

  it('IMAPサーバからワンタイムキーを取得', function () {
    browser.driver.wait(function () {
      return oneTimeKeyPromise;
    }, 60 * 1000, 'ワンタイムキーパスワード記載のメールを1分待つ')
    .then(function (otKey) {
      console.log('then(): otKey = ' + otKey);
      oneTimeKey = otKey;
      expect(typeof oneTimeKey).toBe('string');
      expect(oneTimeKey).not.toBe('');
    }, function (err) {
      console.log('Promise failure: ');
      console.log(err);
    });
  }, 60 * 1000);

  it('ワンタイムキーを入力してログインする', function () {
    $('.security_code').sendKeys(oneTimeKey);
    $('[value="一時解除実行"]').click();
  });

  it('本人確認', function () {
    element(by.cssContainingText('div', 'ご本人確認のため、以下の認証情報を入力してください。'))
    .isPresent().then(function (b) {
      console.log('本人確認テキストが存在したか？ = ' + b);
      if (!b) return;
      // 「質問」
      $('#INPUT_FORM > table.margintop20 > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td > div')
      .getText().then(function (questionText) {
        expect(typeof questionText).toBe('string');
        expect(questionText).not.toBe('');
        console.log('質問：' + questionText);
        // 「合言葉」
        var $answer = $('#INPUT_FORM > table.margintop20 > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > div > input');
        var myQuestions = browser.params.rakuten.questions;
        var i;
        for (i = 0; i < myQuestions.length; i++) {
          if (myQuestions[i][0].test(questionText)) {
            console.log('合言葉を入力：' + myQuestions[i][1]);
            $answer.sendKeys(myQuestions[i][1]);
            break;
          }
        }
        console.log('合言葉の入力を終了');
        if (i >= myQuestions.length) {
          fail('最後まで見つからなかった');
        }
        $('[value="次 へ"]').click();
        console.log('次へ - クリック');
      });
    });
  });

  it('お知らせ', function () {
    var $next = $('[value="　次へ （MyAccount）　"]');
    $next.isPresent().then(function (b) {
      console.log('次へボタンが存在したか？ = ' + b);
      if (!b) return;
      $next.click();
    });
  });

  it('先月の明細を取得', function () {
    element(by.linkText('入出金明細')).click();
  });

  it('ファイルに書き出す', function () {
    // 「最新の入出金明細（最大50件・24ヶ月以内）」
    $$('body > center:nth-child(4) > table > tbody > tr > td > table > tbody > tr > td > div.innerbox00 > table tr').map(function (tr) {
      return tr.all(by.css('td')).map(function (td) { return td.getText() });
    }).then(function (rows) {
      var content = rows.filter(function (cols) {
        return cols.length === 4;
      }).map(function (cols) {
        return cols.map(function (col) { return col.replace(/\s+/g, ' ') }).join('\t');
      }).join('\n');

      fs.writeFileSync(outFilePath, content);
      console.log('wrote: ' + outFilePath);
    });
  });

  it('', function () {
      browser.pause();
  });
});
