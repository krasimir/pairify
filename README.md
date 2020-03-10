# Pairify

It analyzes JavaScript (and not only) code and searches for balanced matches.

👉 [Playground](https://poet.krasimir.now.sh/e/2XL7W5Q08CZ#code.js)

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

## Installation

* `npm install pairify` / `yarn add pairify`
* Or directly from here [https://unpkg.com/pairify@latest/pairify.min.js](https://unpkg.com/pairify@latest/pairify.min.js)

## Usage

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
  {"type":"curly","from":[1,29],"to":[1,42]},
  {"type":"round","from":[1,19],"to":[1,43]},
  {"type":"double-quotes","from":[2,10],"to":[2,26]},
  {"type":"curly","from":[1,44],"to":[3,2]},
  {"type":"curly","from":[4,23],"to":[4,37]},
  {"type":"round","from":[4,22],"to":[4,38]},
  {"type":"round","from":[4,12],"to":[4,39]}
]
```

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
