function $x(xpath) {
    return element(by.xpath(xpath));
}
describe('smbc', function () {
    browser.ignoreSynchronization = true;
    browser.get('https://direct.smbc.co.jp/aib/aibgsjsw5001.jsp');
    var params = browser.params.smbc;
    it('ログイン', function () {
        $('input[name="S_BRANCH_CD"]').sendKeys(params.account.split(/-/)[0]);
        $('input[name="S_ACCNT_NO"]').sendKeys(params.account.split(/-/)[1]);
        $('input[name="PASSWORD"]').sendKeys(params.password);
        $('input[value="ログイン"]').click();
    });
    it('お知らせがあったら読む', function () {
        browser.getCurrentUrl().then(function (url) {
            if (url === 'https://direct3.smbc.co.jp/servlet/com.smbc.SUPRedirectServlet') {
                $('input[value="確認して次へ"]').click();
            }
        });
    });
    it('ログイン完了', function () {
        $('.balance .fRight').getText().then(function (balance) {
            console.log('残高: ' + balance);
            $x('//a[.="明細照会"]').click();
        });
    });
    it('', function () {
        browser.pause();
    });
});
