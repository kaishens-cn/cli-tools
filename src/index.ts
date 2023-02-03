import 'core-js/es/string/replace-all';

import { Cli } from 'clipanion';

import { version } from '../package.json';
import { NewCommand } from './new';

const cli = new Cli({
  binaryName: 'ky',
  binaryVersion: version,
});

cli.register(NewCommand);

cli
  .run(process.argv.slice(2), {
    ...Cli.defaultContext,
  })
  .then(status => {
    process.exit(status);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
