import { promise as wdpromise } from 'selenium-webdriver';
import { Locator } from 'protractor/built/locators';
import { ProtractorBrowser } from 'protractor/built/browser';

declare module 'protractor/built/locators' {
  export interface ProtractorBy {
    valueBind(bindTarget: string, parentElement?: Node): Locator;
  }
}

declare module 'protractor/built/browser' {
  export interface ProtractorBrowser {
    loadAndWaitForAureliaPage(url: string): wdpromise.Promise<any>;
    waitForRouterComplete(): wdpromise.Promise<any>;
  }
}

export * from 'protractor';
