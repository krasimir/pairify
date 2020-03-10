const assert = require('assert');
const fs = require('fs');

const sb = require('../src/pairify');
const readFile = file =>
	fs.readFileSync(__dirname + '/samples/' + file).toString('utf8');

describe('Given the pairify library', () => {
	describe('when we pass code', () => {
		it('should properly analyze it', () => {
			const res = sb.analyze('foo bar { a b c } foo() bar');
			expect(res).toStrictEqual([
        { type: 'curly', from: [ 1, 9 ], to: [ 1, 18 ], body: [ 8, 9 ] },
        { type: 'round', from: [ 1, 22 ], to: [ 1, 24 ], body: [ 21, 2 ] }
      ])
		})
	});
	describe('when we pass nested pairs', () => {
		it('should properly analyze it', () => {
			const res = sb.analyze('foo bar({ test: 20 }) moo');
			expect(res).toStrictEqual([
        { type: 'curly', from: [ 1, 9 ], to: [ 1, 21 ], body: [ 8, 12 ] },
        { type: 'round', from: [ 1, 8 ], to: [ 1, 22 ], body: [ 7, 14 ] }
      ])
		});
		it('should properly analyze it even with complex nesting', () => {
			const res = sb.analyze('foo bar({ test: \'Hey, "John"\', "a": `b` }, { n: 20 }) moo');
			expect(res).toStrictEqual(
				[
					{
						type: 'double-quotes',
						from: [ 1, 23 ],
						to: [ 1, 29 ],
						body: [ 22, 6 ]
					},
					{
						type: 'single-quotes',
						from: [ 1, 17 ],
						to: [ 1, 30 ],
						body: [ 16, 13 ]
					},
					{
						type: 'double-quotes',
						from: [ 1, 32 ],
						to: [ 1, 35 ],
						body: [ 31, 3 ]
					},
					{
						type: 'template-literal',
						from: [ 1, 37 ],
						to: [ 1, 40 ],
						body: [ 36, 3 ]
					},
					{ type: 'curly', from: [ 1, 9 ], to: [ 1, 42 ], body: [ 8, 33 ] },
					{ type: 'curly', from: [ 1, 44 ], to: [ 1, 53 ], body: [ 43, 9 ] },
					{ type: 'round', from: [ 1, 8 ], to: [ 1, 54 ], body: [ 7, 46 ] }
				])
		});
		it('should properly analyze it even with complex nesting', () => {
			const res = sb.analyze('function go(a = " ) ") { }');
			expect(res).toStrictEqual([
        {
          type: 'double-quotes',
          from: [ 1, 17 ],
          to: [ 1, 22 ],
          body: [ 16, 5 ]
        },
        { type: 'round', from: [ 1, 12 ], to: [ 1, 23 ], body: [ 11, 11 ] },
        { type: 'curly', from: [ 1, 24 ], to: [ 1, 27 ], body: [ 23, 3 ] }
      ])
		})
	});
	describe('when there are unbalanced pairs', () => {
		it('should still provide some analysis', () => {
			const res = sb.analyze('const v = { prop: "value - test \'foo\') }');
			expect(res).toStrictEqual([
        {
          type: 'single-quotes',
          from: [ 1, 33 ],
          to: [ 1, 38 ],
          body: [ 32, 5 ]
        }
      ])
		});
	});
	describe('when we have a multi-line code', () => {
		it('should properly calculate the line position', () => {
			const res = sb.analyze(`import { 
	a
} from 'b';
function test() {
  return "foobar";
}`);
			expect(res).toStrictEqual([
        { type: 'curly', from: [ 1, 8 ], to: [ 3, 2 ], body: [ 7, 7 ] },
        {
          type: 'single-quotes',
          from: [ 3, 8 ],
          to: [ 3, 11 ],
          body: [ 20, 3 ]
        },
        { type: 'round', from: [ 4, 14 ], to: [ 4, 16 ], body: [ 38, 2 ] },
        {
          type: 'double-quotes',
          from: [ 5, 10 ],
          to: [ 5, 18 ],
          body: [ 52, 8 ]
        },
        { type: 'curly', from: [ 4, 17 ], to: [ 6, 2 ], body: [ 41, 22 ] }
      ])
		});
	});
	describe('when we tokens in a string', () => {
		it('should search backwards to the top of the stack', () => {
			const res = sb.analyze(`function message() {
  return "'{test}foobar(test)}"; // this is a return statement
  // a comment
}`);
			expect(res).toStrictEqual(
				[
					{ type: 'round', from: [ 1, 17 ], to: [ 1, 19 ], body: [ 16, 2 ] },
					{ type: 'curly', from: [ 2, 12 ], to: [ 2, 18 ], body: [ 32, 6 ] },
					{ type: 'round', from: [ 2, 24 ], to: [ 2, 30 ], body: [ 44, 6 ] },
					{
						type: 'double-quotes',
						from: [ 2, 10 ],
						to: [ 2, 32 ],
						body: [ 30, 22 ]
					},
					{
						type: 'comment-single-line',
						from: [ 2, 34 ],
						to: [ 2, 63 ],
						body: [ 54, 30 ]
					},
					{
						type: 'comment-single-line',
						from: [ 3, 3 ],
						to: [ 3, 15 ],
						body: [ 86, 13 ]
					},
					{ type: 'curly', from: [ 1, 20 ], to: [ 4, 2 ], body: [ 19, 81 ] }
				]);
		});
	});
	describe('when checking more complex examples', () => {
		it.each([
			['code', 'code.json'],
			['code-simple', 'code-simple.json']
		])('should work properly (%s)', (a, b) => {
			const sourceCode = readFile(a);
			const analysis = readFile(b);
			const result = sb.analyze(sourceCode);
			fs.writeFileSync(
				`${__dirname}/samples/result-${a}.json`,
				`[\n${result.map(o => `  ${JSON.stringify(o)}`).join(',\n')}\n]`
			);
			expect(sb.analyze(sourceCode)).toStrictEqual(JSON.parse(analysis));
		})
	});
	describe('when we have mixed angle, curly tokens', () => {
		it('should analyze the code properly', () => {
			const code = `function test() {
  return (
    <button onClick={() => setCount(count + 1)}>
      Click me
    </button>
  );
}`
			const res = sb.analyze(code);
			expect(res).toStrictEqual([
        { type: 'round', from: [ 1, 14 ], to: [ 1, 16 ], body: [ 13, 2 ] },
        { type: 'round', from: [ 3, 22 ], to: [ 3, 24 ], body: [ 50, 2 ] },
        { type: 'round', from: [ 3, 36 ], to: [ 3, 47 ], body: [ 64, 11 ] },
        { type: 'curly', from: [ 3, 21 ], to: [ 3, 48 ], body: [ 49, 27 ] },
        { type: 'angle', from: [ 3, 5 ], to: [ 3, 49 ], body: [ 33, 44 ] },
        { type: 'angle', from: [ 5, 5 ], to: [ 5, 14 ], body: [ 97, 9 ] },
        { type: 'round', from: [ 2, 10 ], to: [ 6, 4 ], body: [ 27, 83 ] },
        { type: 'curly', from: [ 1, 17 ], to: [ 7, 2 ], body: [ 16, 97 ] }
      ]);
			expect(code.substr(res[3].body[0], res[3].body[1])).toBe('{() => setCount(count + 1)}');
		});
	});
});