const assert = require('assert');
const fs = require('fs');

const tests = [];

const sb = require('./scope-bracket.js');
const code = file => fs.readFileSync(__dirname + '/samples/' + file).toString('utf8');

function it(name, fn) {
	tests.push({ name, fn });
}
function run() {
	tests.forEach(t => {
		try {
			t.fn();
			console.log('✅', t.name);
		} catch (e) {
			console.log('❌', t.name);
			console.log(e.stack);
		}
	})
}

// ********************************** tests

it('should properly analyze the string', () => {
	const res = sb.analyze(code('code-simple'));
	console.log(JSON.stringify(res, null, 2));
});

run();