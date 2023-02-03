import { Command, Option } from 'clipanion';
const inquirer = require('inquirer');
import * as chalk from 'colorette';

import { debugFactory } from './debug';

const debug = debugFactory('create');

debug.enabled = true;

const NAME_PROMOTE_NAME = 'Package name';
const DIR_PROMOTE_NAME = 'Dir name';
const SHOULD_INSTALL_DEPS = 'Whether to install dependencies';

const SupportedProject: string[] = ['web(react)', 'desktop(electron)'];

export class NewCommand extends Command {
  static usage = Command.Usage({
    description: 'Create a new project',
  });

  static paths = [['new']];

  name? = Option.String({
    name: '-n,--name',
    required: false,
  });

  dirname? = Option.String({
    name: '-d,--dirname',
    required: false,
  });

  targets? = Option.Array('--targets,-t');

  shouldInstallDeps? = Option.Boolean(`--should-install-deps`);

  async execute() {
    await this.getName();
    if (!this.dirname) {
      const [scope, name] = this.name?.split('/') ?? [];
      const defaultProjectDir = name ?? scope;
      const dirAnswer = await inquirer.prompt({
        type: 'input',
        name: DIR_PROMOTE_NAME,
        default: defaultProjectDir,
      });

      this.dirname = dirAnswer[DIR_PROMOTE_NAME];
    }

    await this.getTargets();

    if (this.shouldInstallDeps === undefined) {
      const answer = await inquirer.prompt([
        {
          type: 'confirm',
          name: SHOULD_INSTALL_DEPS,
          message: 'Whether to install dependencies?',
          default: true,
        },
      ]);
      this.shouldInstallDeps = answer[SHOULD_INSTALL_DEPS];
    }

    debug(`Running command: ${chalk.green(NewCommand.paths.toString())}`);
  }

  private async getTargets() {
    if (!this.targets) {
      const { targets } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'targets',
          message: 'Choose targets you want to create',
          choices: SupportedProject,
        },
      ]);

      if (!targets.length) {
        await this.getTargets();
      } else {
        this.targets = targets;
      }
    }
  }

  private async getName() {
    if (!this.name) {
      const nameAnswer = await inquirer.prompt({
        type: 'input',
        name: NAME_PROMOTE_NAME,
        suffix: ' (The name filed in your package.json)',
      });

      const name = nameAnswer[NAME_PROMOTE_NAME];
      if (!name) {
        await this.getName();
      } else {
        this.name = name;
      }
    }
  }
}
