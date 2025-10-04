import { Config } from 'protractor';

export const config: Config = {
  framework: 'jasmine',
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
    }
  },
  specs: ['../e2e/**/*.e2e-spec.ts'],
  seleniumServerJar: '../node_modules/protractor/node_modules/webdriver-manager/selenium/selenium-server-standalone-3.141.59.jar',
  SELENIUM_PROMISE_MANAGER: false,
  onPrepare: () => {
    browser.waitForAngularEnabled(false);
  },
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  }
};
