import test from 'ava';

import { getCliTemplate } from '../src/utils';

test('下载模版项目文件', async t => {
  await getCliTemplate('https://github.com/kaishens-cn/react-web-template/archive/refs/heads/main.tar.gz');
  t.pass();
});
