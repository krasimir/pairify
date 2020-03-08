const assert = require('assert');
const fs = require('fs');

const sb = require('../scope-bracket.js');
const getCode = file => fs.readFileSync(__dirname + '/samples/' + file).toString('utf8');

describe('Given the scope-bracket library', () => {
	describe('when we pass code', () => {
		it('should properly analyze it', () => {
			const res = sb.analyze('foo bar { a b c } foo() bar');
			expect(res).toStrictEqual([
				{
					"type": "curly",
					"from": [1, 9],
					"to": [1, 17]
				},
				{
					"type": "round",
					"from": [1, 22],
					"to": [1, 23]
				}
			])
		})
	});
	describe('when we pass nested pairs', () => {
		it('should properly analyze it', () => {
			const res = sb.analyze('foo bar({ test: 20 }) moo');
			expect(res).toStrictEqual([
				{ type: 'curly', from: [ 1, 9 ], to: [ 1, 20 ] },
				{ type: 'round', from: [ 1, 8 ], to: [ 1, 21 ] }
			])
		});
		it('should properly analyze it even with complex nesting', () => {
			const res = sb.analyze('foo bar({ test: \'Hey, "John"\', "a": `b` }, { n: 20 }) moo');
			expect(res).toStrictEqual([
        { type: 'double-quotes', from: [ 1, 23 ], to: [ 1, 28 ] },
        { type: 'single-quotes', from: [ 1, 17 ], to: [ 1, 29 ] },
        { type: 'double-quotes', from: [ 1, 32 ], to: [ 1, 34 ] },
        { type: 'template-literal', from: [ 1, 37 ], to: [ 1, 39 ] },
        { type: 'curly', from: [ 1, 9 ], to: [ 1, 41 ] },
        { type: 'curly', from: [ 1, 44 ], to: [ 1, 52 ] },
        { type: 'round', from: [ 1, 8 ], to: [ 1, 53 ] }
      ])
		});
		it('should properly analyze it even with complex nesting', () => {
			const res = sb.analyze('function go(a = " ) ") { }');
			expect(res).toStrictEqual([
        { type: 'double-quotes', from: [ 1, 17 ], to: [ 1, 21 ] },
        { type: 'round', from: [ 1, 12 ], to: [ 1, 22 ] },
        { type: 'curly', from: [ 1, 24 ], to: [ 1, 26 ] }
      ])
		})
	});
	describe('when there are unbalanced paris', () => {
		fit('should still provide some analysis', () => {
			const res = sb.analyze('const v = { prop: "value - test \'foo\') }');
			console.log(res);
			// expect(res).toStrictEqual([
      //   { type: 'double-quotes', from: [ 1, 17 ], to: [ 1, 21 ] },
      //   { type: 'round', from: [ 1, 12 ], to: [ 1, 22 ] },
      //   { type: 'curly', from: [ 1, 24 ], to: [ 1, 26 ] }
      // ])
		});
	});
});