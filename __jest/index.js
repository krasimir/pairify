const { SimpleConsole } = require('./Console');

global.console = new SimpleConsole(process.stdout, process.stderr);