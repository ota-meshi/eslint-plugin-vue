# disallow use v-if on the same element as v-for. (vue/no-use-v-if-with-v-for)

> So even if we only render elements for a small fraction of users, we have to iterate over the entire list every time we re-render, whether or not the set of active users has changed.
>
> https://vuejs.org/v2/style-guide/#Avoid-v-if-with-v-for-essential

> When they exist on the same node, `v-for` has a higher priority than `v-if`. That means the `v-if` will be run on each iteration of the loop separately.
>
> https://vuejs.org/v2/guide/list.html#v-for-with-v-if

So never use `v-if` directive on the same element as `v-for` directives.

## :book: Rule Details

:-1: Examples of **incorrect** code for this rule:

```html
<TodoItem
  v-if="complete"
  v-for="todo in todos"
  :todo="todo"
/>
```

In this case, the `v-if` should be written on the wrapper element.


```html
<TodoItem
  v-for="todo in todos"
  v-if="todo.shown"
  :todo="todo"
/>
```

In this case, the 'v-for' list variable should be replace with a computed property that returns your filtered list.


:+1: Examples of **correct** code for this rule:


```html
<ul v-if="complete">
  <TodoItem
    v-for="todo in todos"
    :todo="todo"
  />
</ul>
```


```html
<TodoItem
  v-for="todo in shownTodos"
  v-if="todo.shown"
  :todo="todo"
/>
```

```js
computed: {
  shownTodos() {
    return this.todos.filter((todo) => todo.shown)
  }
}
```

## :wrench: Options

`allowUsingIterationVar` - Enables The `v-if` directive use the reference which is to the variables which are defined by the `v-for` directives.

```
'vue/no-use-v-if-with-v-for': [’error', {
  allowUsingIterationVar: Boolean // default: false
}]
```

:+1: Examples of **correct** code for `{ allowUsingIterationVar: true }`:

```html
<TodoItem
  v-if="complete"
  v-for="todo in todos"
  :todo="todo"
/>
```

