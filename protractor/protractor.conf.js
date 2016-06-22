exports.config = {
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      'excludeSwitches': ['ignore-certificate-errors'],
      prefs: {
        download: {
          prompt_for_download: false,
          default_directory: process.cwd() + '/downloads'
        },
      }
    }
  },

  specs: ['*.js'],

  jasmineNodeOpts: {
    isVerbose: true,
    showColors: true,
    defaultTimeoutInterval: 30000,
    includeStackTrace: false
  },

  onPrepare: function () {
    jasmine.getEnv().afterEach(function () {
      var spec = jasmine.getEnv().currentSpec;
      if (spec.results().failedCount > 0) {
        browser.pause();
      }
    });
  },

  params: {
    mufg: {
      id: process.env.MUFG_ID,
      password: process.env.MUFG_PASSWORD
    },
    rakuten: {
      id: process.env.RAKUTEN_ID,
      password: process.env.RAKUTEN_PASSWORD,
      questions: (function () {
        var questions = [];
        for (var i = 1; process.env['RAKUTEN_QUESTIONS_' + i]; ++i) {
          var qa = process.env['RAKUTEN_QUESTIONS_' + i].split(/\t+/);
          if (qa.length !== 2) {
            break;
          }
          questions.push([new RegExp(qa[0]), qa[1]]);
        }
        return questions;
      })(),
      imap: {
        server: 'imap.gmail.com',
        id: process.env.RAKUTEN_IMAP_ID,
        password: process.env.RAKUTEN_IMAP_PASSWORD
      }
    },
    smbc: {
      account: process.env.SMBC_ACCOUNT,
      password: process.env.SMBC_PASSWORD
    },
    amazon: {
      email: process.env.AMAZON_EMAIL,
      password: process.env.AMAZON_PASSWORD
    }
  }
};
