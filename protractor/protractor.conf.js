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
      questions: [
        [/出身地は？/, '(答え)'],
        [/初めて飼ったペットの名前は？/, '(答え)'],
        [/所有している車は？/, '(答え)']
      ],
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
