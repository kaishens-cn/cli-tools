import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import * as decompress from 'decompress';
import { CommonSpawnOptions, spawn } from 'child_process';

export const CACHE_PATH = path.join(path.resolve('./'), '.cli-cache');

export const getCliTemplate = (url: string) => {
  return new Promise<void>(async (resolve, reject) => {
    const fileUrl = url;
    try {
      await fs.promises.stat(CACHE_PATH);
    } catch (e) {
      await fs.promises.mkdir(CACHE_PATH, { recursive: true });
    }

    const fileSavePath = path.join(CACHE_PATH, 'main.tar.gz');

    const fileStream = fs.createWriteStream(fileSavePath);
    fileStream.on('finish', () => {
      decompress(fileSavePath, CACHE_PATH)
        .then(_ => {
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
    fileStream.on('error', err => {
      reject(err);
    });

    fetch(fileUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/octet-stream' },
    })
      .then(res => {
        res.body.pipe(fileStream);
      })
      .catch(e => {
        //自定义异常处理
        reject(e);
      });
  });
};

export const pnpmInstall = (dir: string, out?: boolean) => {
  const config: CommonSpawnOptions = { cwd: dir };
  if (out) {
    config.stdio = 'inherit';
  }

  return new Promise<void>((resolve) => {
    const install = spawn('pnpm', ['install'], config);
    install.on('close', (_) => {
      resolve();
    });
  });
};
