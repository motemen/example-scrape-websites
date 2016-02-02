var fs = require('fs');

describe('amazon-affiliate', function () {
  browser.ignoreSynchronization = true;
  browser.get('https://affiliate.amazon.co.jp/gp/associates/network/main.html');

  it('ログイン', function () {
    $('#ap_signin_existing_radio').click();
    $('input[name="email"]')   .sendKeys(browser.params.amazon.email);
    $('input[name="password"]').sendKeys(browser.params.amazon.password);

    $('#signInSubmit').click();
  });

  it('今月の速報値を表示', function () {
    $$('#mini-report .line-item, #mini-report .line-item-total').each(function (lineElem) {
      lineElem.getText().then(function (text) {
        console.log(text.replace(/\n/, '\t'));
      });
    });
  });

  it('レポートへ', function () {
    element(by.linkText('レポート全体を表示')).click();
  });

  it('レポートをダウンロード', function () {
    $('option[value="ordersReport"]').click();
    $('input[name="submit.download_CSV"]').click(); // 画面上に表示されているテキストでは TSV …
    browser.pause();
  });
});
