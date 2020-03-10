# Pairify

Finds balanced matches.

👉 [Playground](https://pairify.now.sh/)

The library matches the following balanced pairs:

* `{` and `}`
* `(` and `)`
* `[` and `]`
* `<` and `>`
* `'` and `'`
* `"` and `"`
* `` ` `` and `` ` ``
* `/*` and `*/`
* `//` and `\n`

## Example

Consider the following `code.js` file:

```
function getAnswer(answer = { value: 42 }) {
  return "The answer is " + answer.value;
}
console.log(getAnswer({ value: 100 }));
```

and when we pass it to Pairify

```js
const Pairify = require('pairify');
const code = fs.readFileSync('./code.js').toString('utf8');

console.log(Pairify.analyze(code))
```

We'll get the following result:

```json
[
  {"type":"curly","from":[1,29],"to":[1,42],"body":[28,13]},
  {"type":"round","from":[1,19],"to":[1,43],"body":[18,24]},
  {"type":"double-quotes","from":[2,10],"to":[2,26],"body":[54,16]},
  {"type":"curly","from":[1,44],"to":[3,2],"body":[43,45]},
  {"type":"curly","from":[4,23],"to":[4,37],"body":[111,14]},
  {"type":"round","from":[4,22],"to":[4,38],"body":[110,16]},
  {"type":"round","from":[4,12],"to":[4,39],"body":[100,27]}
]
```

## Installation

* `npm install pairify` / `yarn add pairify`
* Or directly from here [https://unpkg.com/pairify@latest/pairify.min.js](https://unpkg.com/pairify@latest/pairify.min.js)

## API

* `Pairify.analyze(code: string): Pair[]` - parses all the code and returns all the balanced matches
* `Pairify.match(code: string, line:number, position: number): Pair[]` - returns balanced matches based on the provided line and position.

where `Pair` is the following

```js
{
  type: string; // curly, round, square, angle, single-quotes, double-quotes, template-literal, comment-single-line or comment-block
  from: number[]; // [line, position],
  to: number[]; // [line, position],
  body: number[] // [char, length]
}
```
