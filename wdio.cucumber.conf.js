import { config as baseConfig } from './wdio.conf.js'

export const config = {
  ...baseConfig,

  // run feature files instead of mocha specs
  specs: [
    './features/**/*.feature'
  ],

  // use the cucumber framework
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
