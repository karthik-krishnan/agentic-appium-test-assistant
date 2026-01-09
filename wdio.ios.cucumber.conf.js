import { config as iosConfig } from './wdio.ios.conf.js'

export const config = {
  ...iosConfig,
  specs: ['./features/**/*.feature'],
  framework: '@wdio/cucumber-framework',
  cucumberOpts: {
    require: ['./features/step-definitions/**/*.js'],
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    format: ['pretty'],
    colors: true,
    snippets: true,
    source: true,
    profile: [],
    strict: false,
    tagExpression: '',
    timeout: 60000,
    ignoreUndefinedDefinitions: false
  }
}
