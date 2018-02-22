/**
 * @author Yosuke Ota
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/component-tags-order')
const RuleTester = require('eslint').RuleTester

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const tester = new RuleTester({
  parser: 'vue-eslint-parser'
})

tester.run('component-tags-order', rule, {
  valid: [
    // default
    '<script> /*script*/ </script><template><div id="id"></div><br><SelfCose /></template><style>.button{ color: red; }</style>',

    // order
    // {
    //   code: '<template></template><script></script><style></style>',
    //   output: null,
    //   options: [{ order: ['template', 'script', 'style'] }]
    // },
    // Invalid EOF
    // '<style></style><template><the-component a=">test</the-component></template>',
    // '<style></style><template><the-component><!--test</the-component></template>'
  ],
  invalid: [
    {
      code: `<template></template><script></script><style></style>`,
      errors: ['<script> should go before <template>.']
    }
  ]
})
