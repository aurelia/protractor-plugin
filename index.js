"use strict";

/* Aurelia Protractor Plugin */
function addValueBindLocator() {
  by.addLocator('valueBind', function (bindingModel, opt_parentElement) {
    var using = opt_parentElement || document;
    var matches = using.querySelectorAll('*[value\\.bind="' + bindingModel +'"]');
    var result;

    if (matches.length === 0) {
      result = null;
    } else if (matches.length === 1) {
      result = matches[0];
    } else {
      result = matches;
    }

    return result;
  });
}

function loadAndWaitForAureliaPage(pageUrl) {
  function onAureliaComposed(onReady) {
    if (!!document.querySelector("[aurelia-app]")) {
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
    var aurelia = document.querySelector("[aurelia-app]").aurelia;
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

  function isReady(id) {
    var aurelia = document.querySelector("[aurelia-app]").aurelia;
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

/* Plugin hooks */
exports.setup = function(config) {
  // Ignore the default Angular synchronization helpers
  browser.ignoreSynchronization = true;

  // add the aurelia specific valueBind locator
  addValueBindLocator();

  // attach a new way to browser.get a page and wait for Aurelia to complete loading
  browser.loadAndWaitForAureliaPage = loadAndWaitForAureliaPage;

  // wait for router navigations to complete
  browser.waitForRouterComplete = waitForRouterComplete;
};

exports.teardown = function(config) {};
exports.postResults = function(config) {};
