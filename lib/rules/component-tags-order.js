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

function create (context) {
  const tokenStore = context.parserServices.getTemplateBodyTokenStore && context.parserServices.getTemplateBodyTokenStore()
  let order = [].concat(defaultOrder)
  if (context.options[0] && context.options[0].order) {
    order = context.options[0].order
  }

  function getTopLevelHTMLTagOpenList (templateBody) {
    const tokens = templateBody.tokens
    const templateOpen = tokenStore.getFirstToken(templateBody.startTag)
    const templateClose = tokenStore.getLastToken(templateBody.endTag)

    const templateBeforeTokens = tokens.slice(0, tokens.indexOf(templateOpen))
    const templateAfterTokens = tokens.slice(tokens.indexOf(templateClose))

    const beforeResults = []
    let level = 0
    templateBeforeTokens.every((token) => {
      if (level === 0 && token.type === 'HTMLTagOpen') {
        beforeResults.push(token)
      }
      if (token.type === 'HTMLTagOpen') {
        level++
      } else if (token.type === 'HTMLEndTagOpen' || token.type === 'HTMLSelfClosingTagClose') {
        level--
      }
      return true
    })
    const afterResults = []
    level = 0
    templateAfterTokens.reverse().every((token) => {
      if (token.type === 'HTMLTagOpen') {
        level--
      } else if (token.type === 'HTMLEndTagOpen' || token.type === 'HTMLSelfClosingTagClose') {
        level++
      }
      if (level === 0 && token.type === 'HTMLTagOpen') {
        afterResults.push(token)
      }
      return true
    })
    return beforeResults.concat([templateOpen]).concat(afterResults.reverse())
  }

  function report (token, previousToken) {
    console.log(token)
    context.report({
      node: token,
      loc: token.loc,
      message: `<{{ tagName }}> should go before <{{prevTagName}}>.`,
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
      const templateBody = node.templateBody
      if (!templateBody) {
        return null
      }
      const tags = getTopLevelHTMLTagOpenList(templateBody)

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
          items: {
            type: 'string'
          },
          minItems: 3
        }
      }
    }
  },
  create
}
