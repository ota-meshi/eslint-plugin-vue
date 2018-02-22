/**
 * @author Yosuke Ota
 * issue https://github.com/vuejs/eslint-plugin-vue/issues/140
 */
'use strict'
const utils = require('../utils')

const defaultOrder = ['script', 'template', 'style']

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

function getTopLevelHTMLTagOpenListFromTokens (tokens) {
  const results = []
  const stack = []
  tokens.forEach((token) => {
    if (token.type === 'HTMLTagOpen') {
      if (stack.length === 0) {
        results.push(token)
      }
      stack.push(token.value)
    }

    if (token.type === 'HTMLSelfClosingTagClose') {
      stack.pop()
    } else if (token.type === 'HTMLEndTagOpen') {
      const index = stack.lastIndexOf(token.value)
      if (index >= 0) {
        stack.length = index
      }
    }
  })
  return results
}

function create (context) {
  const tokenStore = context.parserServices.getTemplateBodyTokenStore && context.parserServices.getTemplateBodyTokenStore()
  const order = context.options[0] && context.options[0].order || [].concat(defaultOrder)

  function getTopLevelHTMLTagOpenList (node) {
    const templateBody = node.templateBody
    if (templateBody) {
      const tokens = templateBody.tokens
      const templateOpen = tokenStore.getFirstToken(templateBody.startTag)
      const templateClose = tokenStore.getLastToken(templateBody.endTag)

      const templateBeforeTokens = tokens.slice(0, tokens.indexOf(templateOpen))
      const templateAfterTokens = tokens.slice(tokens.indexOf(templateClose))

      const beforeResults = getTopLevelHTMLTagOpenListFromTokens(templateBeforeTokens)
      const afterResults = getTopLevelHTMLTagOpenListFromTokens(templateAfterTokens)
      return beforeResults.concat([templateOpen]).concat(afterResults)
    } else {
      // can not analyze
      return []
    }
  }

  function report (token, previousToken) {
    context.report({
      node: token,
      loc: token.loc,
      message: `<{{ tagName }}> should go before <{{ prevTagName }}>.`,
      data: {
        tagName: token.value,
        prevTagName: previousToken.value
      }
    })
  }

  return {
    Program (node) {
      const hasInvalidEOF = utils.hasInvalidEOF(node)
      if (hasInvalidEOF) {
        return
      }
      const tags = getTopLevelHTMLTagOpenList(node)

      let preTarget = null
      let preTargetIndex = -1
      tags.forEach(tag => {
        const index = order.indexOf(tag.value)
        if (index < 0) {
          return
        }
        if (preTarget) {
          if (preTargetIndex > index) {
            report(tag, preTarget)
            return
          }
        }
        preTarget = tag
        preTargetIndex = index
      })
    }
  }
}

module.exports = {
  meta: {
    docs: {
      description: 'enforce order of component top-level element',
      category: undefined
    },
    fixable: null,
    schema: {
      type: 'array',
      properties: {
        order: {
          type: 'array'
        }
      }
    }
  },
  create
}
