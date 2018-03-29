/**
 * @author Yosuke Ota
 * See LICENSE file in root directory for full license.
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

function parseOptions (options) {
  return Object.assign({
    'singleline': 'ignore',
    'multiline': 'always',
    'ignoreNames': ['pre', 'textarea'],

    detectType (node) {
      if (node.startTag.loc.start.line === node.startTag.loc.end.line &&
        node.endTag.loc.start.line === node.endTag.loc.end.line) {
        return this.singleline
      }
      return this.multiline
    }
  }, options)
}

function getBreakPhrase (breaks) {
  return breaks ? 'line break' : 'no line breaks'
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'require or disallow a line break before and after html contents',
      category: undefined,
      url: 'https://github.com/vuejs/eslint-plugin-vue/blob/v4.4.0/docs/rules/html-content-newline.md'
    },
    fixable: 'whitespace',
    schema: [{
      type: 'object',
      properties: {
        'singleline': { enum: ['ignore', 'always', 'never'] },
        'multiline': { enum: ['ignore', 'always', 'never'] },
        'ignoreNames': {
          type: 'array',
          items: { type: 'string' },
          uniqueItems: true,
          additionalItems: false
        }
      },
      additionalProperties: false
    }]
  },

  create (context) {
    const options = parseOptions(context.options[0])
    const template = context.parserServices.getTemplateBodyTokenStore && context.parserServices.getTemplateBodyTokenStore()

    return utils.defineTemplateBodyVisitor(context, {
      'VElement' (node) {
        if (node.startTag.selfClosing || !node.endTag) {
          // self closing
          return
        }
        if (options.ignoreNames.indexOf(node.name) >= 0) {
          return
        }
        const type = options.detectType(node)
        if (type === 'ignore') {
          return
        }
        debugger// TODO
        const getTokenOption = { includeComments: true, filter: (token) => token.type !== 'HTMLWhitespace' }
        const contentFirst = template.getTokenAfter(node.startTag, getTokenOption)
        const contentLast = template.getTokenBefore(node.endTag, getTokenOption)
        const hasBeforeBreaks = node.startTag.loc.end.line < contentFirst.loc.start.line
        const hasAfterBreaks = contentLast.loc.end.line < node.endTag.loc.start.line
        const needBreaks = type === 'always'
        if (needBreaks !== hasBeforeBreaks) {
          context.report({
            node: template.getLastToken(node.startTag),
            loc: {
              start: node.startTag.loc.end,
              end: contentFirst.loc.start
            },
            message: 'Expected {{expected}} after closing bracket, but {{actual}} found.',
            data: {
              expected: getBreakPhrase(needBreaks),
              actual: getBreakPhrase(hasBeforeBreaks)
            },
            fix: type === 'always'
              ? (fixer) => fixer.insertTextAfter(node.startTag, '\n')
              : (fixer) => fixer.removeRange([node.startTag.range[1] + 1, contentFirst.range[0]])
          })
        }

        if (needBreaks !== hasAfterBreaks) {
          context.report({
            node: template.getFirstToken(node.endTag),
            loc: {
              start: contentLast.loc.end,
              end: node.endTag.loc.start
            },
            message: 'Expected {{expected}} before open bracket, but {{actual}} found.',
            data: {
              expected: getBreakPhrase(needBreaks),
              actual: getBreakPhrase(hasAfterBreaks)
            },
            fix: type === 'always'
              ? (fixer) => fixer.insertTextBefore(node.endTag, '\n')
              : (fixer) => fixer.removeRange([contentLast.range[1] + 1, node.endTag.range[0]])
          })
        }
      }
    })
  }
}
