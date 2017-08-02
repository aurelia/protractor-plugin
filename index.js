"use strict";

/* Aurelia Protractor Plugin */

// Custom Locators
function addValueBindLocator() {
  by.addLocator('valueBind', function (bindingModel, opt_parentElement) {
    const using = opt_parentElement || document;
    const selector = `*[value\\.bind='${bindingModel}']`;
    const matches = using.querySelectorAll(selector);

    return (matches.length === 0)
      ? null
      : (matches.length === 1)
        ? matches[0]
        : matches;
  });
}

function addI18nLocators() {
  by.addLocator('i18nKey', (translationKey, strict, opt_parentElement) => {
    const using = opt_parentElement || document;
    const selector = `*[t${strict ? '' : '*' }='${translationKey}'], *[t\\.bind${strict ? '' : '*' }='${translationKey}']`;
    const matches = using.querySelectorAll(selector);

    return (matches.length === 0)
      ? null
      : (matches.length === 1)
        ? matches[0]
        : matches;
  });

  by.addLocator('i18nParams', (paramsKey, strict, opt_parentElement) => {
    const using = opt_parentElement || document;
    const selector = `*[t-params\\.bind${strict ? '' : '*' }='${paramsKey}']`;
    const matches = using.querySelectorAll(selector);

    return (matches.length === 0)
      ? null
      : (matches.length === 1)
        ? matches[0]
        : matches;
  });

  by.addLocator('i18nKeyAndParams', (translationKey, paramsKey, strict, opt_parentElement) => {
    const using = opt_parentElement || document;
    const selector = `*[t${strict ? '' : '*' }='${translationKey}'][t-params\\.bind${strict ? '' : '*' }='${paramsKey}'], *[t\\.bind${strict ? '' : '*' }='${translationKey}'][t-params\\.bind${strict ? '' : '*' }='${paramsKey}']`;
    const matches = using.querySelectorAll(selector);

    return (matches.length === 0)
      ? null
      : (matches.length === 1)
        ? matches[0]
        : matches;
  });
}

// Browser Helpers
function loadAndWaitForAureliaPage(pageUrl) {
  function onAureliaComposed(onReady) {
    var aa = document.querySelector("[aurelia-app]");
    if (!!aa && aa.aurelia) {
      // aurelia is already loaded and available:
      onReady();
    } else {
      // we need to wait until it composes:
      document.addEventListener("aurelia-composed", function (e) {
        onReady();
      }, false);
    }
  }

  return browser.get(pageUrl).then(
    () => browser.executeAsyncScript(onAureliaComposed)
  );
}

let waitId = 0;
function waitForRouterComplete() {
  waitId++;

  function registerWait(id) {
    var aa = document.querySelector("[aurelia-app]");
    if (!!aa) {
      var aurelia = aa.aurelia;
      if (aurelia) {
        aurelia.subscribeOnce("router:navigation:complete", function(e) {
          if (!aurelia.PROTRACTOR_NAVIGATION_READY) {
            aurelia.PROTRACTOR_NAVIGATION_READY = [id];
          } else {
            aurelia.PROTRACTOR_NAVIGATION_READY.push(id);
          }
        });
        return true;
      }
    }
  }

  function isReady(id) {
    var aa = document.querySelector("[aurelia-app]");
    if (!aa) { return true; }
    var aurelia = aa.aurelia;
    if (!aurelia) { return true; }
    return aurelia.PROTRACTOR_NAVIGATION_READY && aurelia.PROTRACTOR_NAVIGATION_READY.indexOf(id) >= 0;
  }

  return browser.executeScript(registerWait, waitId).then(function(hooked) {
    if (!hooked) { return; }
    // we do it this way because executeAsyncScript is blocking
    // while browser.wait is non-blocking (it will run across consecutive frames)
    return browser.wait(function() {
      return browser.executeScript(isReady, waitId);
    });
  });
}

/* Plugin hook */
function setup(config) {
  // Ignore the default Angular synchronization helpers
  browser.ignoreSynchronization = true;

  // add the aurelia specific valueBind locator
  addValueBindLocator();
  addI18nLocators();

  // attach a new way to browser.get a page and wait for Aurelia to complete loading
  browser.loadAndWaitForAureliaPage = loadAndWaitForAureliaPage;

  // wait for router navigations to complete
  browser.waitForRouterComplete = waitForRouterComplete;
}

/* Plugin hooks */
module.exports = {
  setup: setup,
  // we need to re-setup after each test
  // in case the user has restartBrowserBetweenTests: true
  postTest: setup
}
