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
    '<script></script><template></template><style></style>',
    '<script> /*script*/ </script><template><div id="id">text <!--comment--> </div><br><SelfCose /></template><style>.button{ color: red; }</style>',
    '<docs></docs><script></script><template></template><style></style>',
    '<script></script><docs></docs><template></template><style></style>',
    '<script></script><template></template>',
    '<script></script><style></style>',
    `
      <script>
      </script>

      <template>
      </template>

      <style>
      </style>
    `,

    // order
    {
      code: '<template></template><script></script><style></style>',
      output: null,
      options: [{ order: ['template', 'script', 'style'] }]
    },
    {
      code: '<style></style><template></template><script></script>',
      output: null,
      options: [{ order: ['style', 'template', 'script'] }]
    },
    {
      code: '<template></template><script></script><style></style>',
      output: null,
      options: [{ order: ['template', 'docs', 'script', 'style'] }]
    },
    {
      code: '<template></template><docs></docs><script></script><style></style>',
      output: null,
      options: [{ order: ['template', 'script', 'style'] }]
    },
    {
      code: '<docs><div id="id">text <!--comment--> </div><br><SelfCose /></docs><script></script><template></template><style></style>',
      output: null,
      options: [{ order: ['docs', 'script', 'template', 'style'] }]
    },

    // No template
    `<style></style><script></script>`,
    `<script></script><style></style>`,

    // Invalid EOF
    '<template><div a=">test</div></template><style></style>',
    '<template><div><!--test</div></template><style></style>'
  ],
  invalid: [
    {
      code: '<template></template><script></script><style></style>',
      errors: ['<script> should be above the <template> on line 1.']
    },
    {
      code: `
        <template></template>
        <script></script>
        <style></style>
      `,
      errors: ['<script> should be above the <template> on line 2.']
    },
    {
      code: `
        <script></script>
        <template></template>
        <style></style>
      `,
      options: [{ order: ['template', 'script', 'style'] }],
      errors: ['<template> should be above the <script> on line 2.']
    },
    {
      code: `
        <template></template>
        <docs></docs>
        <script></script>
        <style></style>
      `,
      options: [{ order: ['docs', 'template', 'script', 'style'] }],
      errors: ['<docs> should be above the <template> on line 2.']
    },
    {
      code: `
        <template></template>
        <docs></docs>
        <script></script>
        <style></style>
      `,
      errors: ['<script> should be above the <template> on line 2.']
    },
    {
      code: `
        <template></template>
        <docs>
          <unknown-void>
          <unknown-void>
          <unknown-void>
        </docs>
        <script></script>
        <style></style>
      `,
      errors: ['<script> should be above the <template> on line 2.']
    },
    {
      code: `
        <template></template>
        <docs>
          </end-tag>
          </end-tag>
        </docs>
        <script></script>
        <style></style>
      `,
      errors: ['<script> should be above the <template> on line 2.']
    },
    {
      code: `
        <script></script>
        <template></template>
      `,
      options: [{ order: ['template', 'script'] }],
      errors: ['<template> should be above the <script> on line 2.']
    },
    {
      code: `
        <style></style>
        <template></template>
        <script></script>
      `,
      errors: [
        '<template> should be above the <style> on line 2.',
        '<script> should be above the <template> on line 3.'
      ]
    },
    {
      code: `
        <style></style>
        <docs></docs>
        <template></template>
        <script></script>
      `,
      errors: [
        '<template> should be above the <style> on line 2.',
        '<script> should be above the <template> on line 4.'
      ]
    }
  ]
})
