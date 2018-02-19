/**
 * @author Yosuke Ota
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/component-name-in-template-casing')
const RuleTester = require('eslint').RuleTester

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const tester = new RuleTester({
  parser: 'vue-eslint-parser'
})

tester.run('html-self-closing', rule, {
  valid: [
    // default
    '<template><div/></template>',
    '<template><img></template>',
    '<template><CustomComp/></template>',
    '<template><svg><path/></svg></template>',
    '<template><math><mspace/></math></template>',

    // Don't error if there are comments in their content.
    {
      code: '<template><Custom><!-- comment --></Custom></template>',
      output: null,
      options: ['PascalCase']
    },
    {
      code: '<template><CustomComp><!-- comment --></CustomComp></template>',
      output: null,
      options: ['PascalCase']
    },
    {
      code: '<template><custom><!-- comment --></custom></template>',
      output: null,
      options: ['kebab-case']
    },
    {
      code: '<template><custom-comp><!-- comment --></custom-comp></template>',
      output: null,
      options: ['kebab-case']
    },
    // Invalid EOF
    '<template><custom-comp a=">test</custom-comp></template>',
    '<template><custom-comp><!--test</custom-comp></template>'
  ],
  invalid: [
    {
      code: `
<template>
  <custom-comp id="id">
    <!-- comment -->
  </custom-comp>
</template>
`,
      output: `
<template>
  <CustomComp id="id">
    <!-- comment -->
  </CustomComp>
</template>
`,
      errors: ['Component name "custom-comp" is not PascalCase.']
    },
    {
      code: `
<template>
  <custom-comp id="id"/>
</template>
`,
      output: `
<template>
  <CustomComp id="id"/>
</template>
`,
      errors: ['Component name "custom-comp" is not PascalCase.']
    },
    {
      code: `
<template>
  <CustomComp id="id">
    <!-- comment -->
  </CustomComp>
</template>
`,
      options: ['kebab-case'],
      output: `
<template>
  <custom-comp id="id">
    <!-- comment -->
  </custom-comp>
</template>
`,
      errors: ['Component name "CustomComp" is not kebab-case.']
    },
    {
      code: `
<template>
  <CustomComp id="id"/>
</template>
`,
      options: ['kebab-case'],
      output: `
<template>
  <custom-comp id="id"/>
</template>
`,
      errors: ['Component name "CustomComp" is not kebab-case.']
    },
    {
      code: `
<template>
  <custom-comp
    id="id"/>
</template>
`,
      output: `
<template>
  <CustomComp
    id="id"/>
</template>
`,
      errors: ['Component name "custom-comp" is not PascalCase.']
    },
    {
      code: `
<template>
  <custom-comp/>
</template>
`,
      output: `
<template>
  <CustomComp/>
</template>
`,
      errors: ['Component name "custom-comp" is not PascalCase.']
    },
    {
      code: `
<template>
  <custom-comp></custom-comp>
</template>
`,
      output: `
<template>
  <CustomComp></CustomComp>
</template>
`,
      errors: ['Component name "custom-comp" is not PascalCase.']
    }
  ]
})
