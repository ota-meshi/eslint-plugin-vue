/**
 * @author Yosuke Ota
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/html-content-newline')
const RuleTester = require('eslint').RuleTester

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const tester = new RuleTester({
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2015
  }
})

tester.run('html-content-newline', rule, {
  valid: [
    `<template><div class="panel">content</div></template>`,
    `
      <template>
        <div class="panel">
          content
        </div>
      </template>`,
    `
      <template>
        <div
          class="panel"
        >
          content
        </div>
      </template>`,
    {
      code: `
        <template>
          <div class="panel">
            content
          </div>
        </template>`,
      options: [{
        singleline: 'always',
        multiline: 'never'
      }]
    },
    {
      code: `
        <template>
          <div
            class="panel"
          >content</div>
        </template>`,
      options: [{
        singleline: 'always',
        multiline: 'never'
      }]
    },
    {
      code: `
        <template>
          <self-closing />
        </template>`,
      options: [{
        singleline: 'always',
        multiline: 'never'
      }]
    },
    // Ignore if no closing brackets
    `
      <template>
        <div
          id=
          ""
    `
  ],
  invalid: [
    {
      code: `
        <template>
          <div
            class="panel"
          >content</div>
        </template>
      `,
      output: `
        <template>
          <div
            class="panel"
          >
content
</div>
        </template>
      `,
      errors: [
        {
          message: 'Expected line break after closing bracket, but no line breaks found.',
          line: 5,
          column: 12,
          nodeType: 'HTMLTagClose',
          endLine: 5,
          endColumn: 12
        },
        {
          message: 'Expected line break before open bracket, but no line breaks found.',
          line: 5,
          column: 19,
          nodeType: 'HTMLEndTagOpen',
          endLine: 5,
          endColumn: 19
        }
      ]
    },
    {
      code: `
        <template>
          <div class="panel">panel</div>
        </template>
      `,
      options: [{
        singleline: 'always',
        multiline: 'never'
      }],
      output: `
        <template>
          <div class="panel">
panel
</div>
        </template>
      `,
      errors: [
        {
          message: 'Expected line break after closing bracket, but no line breaks found.',
          line: 3,
          column: 30,
          nodeType: 'HTMLTagClose',
          endLine: 3,
          endColumn: 30
        },
        {
          message: 'Expected line break before open bracket, but no line breaks found.',
          line: 3,
          column: 35,
          nodeType: 'HTMLEndTagOpen',
          endLine: 3,
          endColumn: 35
        }]
    },
    {
      code: `
        <template>
          <div
            class="panel"
          >
            content
          </div>
        </template>
      `,
      options: [{
        singleline: 'always',
        multiline: 'never'
      }],
      output: `
        <template>
          <div
            class="panel"
          >
content
</div>
        </template>
      `,
      errors: [{
        message: 'Expected no line breaks after closing bracket, but line break found.',
        line: 5,
        column: 12,
        nodeType: 'HTMLTagClose',
        endLine: 6,
        endColumn: 13
      },
      {
        message: 'Expected no line breaks before open bracket, but line break found.',
        line: 6,
        column: 20,
        nodeType: 'HTMLEndTagOpen',
        endLine: 7,
        endColumn: 11
      }
      ]
    }
  ]
})
