import { Command, Option } from 'clipanion';

const inquirer = require('inquirer');
import * as chalk from 'colorette';
import * as fs from 'fs';
import * as path from 'path';

import { debugFactory } from './debug';
import { CACHE_PATH, getCliTemplate, pnpmInstall } from './utils';

const debug = debugFactory('create');

if (process.env.DEBUG) {
  debug.enabled = true;
}

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

  targets? = Option.String({
    name: '--targets,-t',
    required: false,
  });

  shouldInstallDeps? = Option.Boolean(`--should-install-deps`);

  async catch(error) {
    try {
      await fs.promises.stat(path.join(path.resolve('./'), this.dirname));
      fs.rmSync(path.join(path.resolve('./'), this.dirname), { recursive: true });
    } catch (e) {
      //...
    }
    try {
      await fs.promises.stat(CACHE_PATH);
      fs.rmSync(CACHE_PATH, { recursive: true });
    } catch (e) {
      //...
    }
  }

  async execute() {
    await this.getName();

    await this.getDirName();

    if (!this.targets) {
      const { targets } = await inquirer.prompt([
        {
          type: 'list',
          name: 'targets',
          message: 'Choose targets you want to create',
          choices: SupportedProject,
        },
      ]);

      this.targets = targets;
    }

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

    if (this.targets === 'web(react)') {
      await this.createProject(
        'https://github.com/kaishens-cn/react-web-template/archive/refs/heads/main.tar.gz',
        'react-web-template-main'
      );
      const packageContent = JSON.parse(
        fs.readFileSync(path.join(path.resolve('./'), this.dirname, 'package.json'), 'utf8')
      );
      packageContent.name = this.name;
      packageContent.version = '1.0.0';
      fs.writeFileSync(
        path.join(path.resolve('./'), this.dirname, 'package.json'),
        JSON.stringify(packageContent, null, 2)
      );

      await pnpmInstall(path.join(path.resolve('./'), this.dirname), true);
    }

    if (this.targets === 'desktop(electron)') {
      // await this.createProject(
      //   'https://github.com/kaishens-cn/react-web-template/archive/refs/heads/main.tar.gz',
      //   'react-web-template-main'
      // );
    }
  }

  private async createProject(url: string, template: string) {
    await getCliTemplate(url);
    try {
      await fs.promises.stat(path.join(path.resolve('./'), this.dirname));
    } catch (e) {
      await fs.promises.mkdir(path.join(path.resolve('./'), this.dirname), { recursive: true });
    }
    fs.cpSync(path.join(CACHE_PATH, template), path.join(path.resolve('./'), this.dirname), {
      recursive: true,
    });
    fs.rmSync(CACHE_PATH, { recursive: true });
  }

  private async getDirName(msg?: string) {
    if (!this.dirname) {
      const [scope, name] = this.name?.split('/') ?? [];
      const defaultProjectDir = name ?? scope;
      const dirAnswer = await inquirer.prompt({
        type: 'input',
        name: DIR_PROMOTE_NAME,
        message: msg,
        default: defaultProjectDir,
      });

      try {
        await fs.promises.stat(path.join(path.resolve('./'), dirAnswer[DIR_PROMOTE_NAME]));
        await this.getDirName(
          `A directory named ${dirAnswer[DIR_PROMOTE_NAME]} already exists in the current directory`
        );
      } catch (e) {
        this.dirname = dirAnswer[DIR_PROMOTE_NAME];
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
