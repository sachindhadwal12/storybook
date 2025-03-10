import { dirname, join } from 'path';
import type { PresetProperty } from '@storybook/types';
import type { StorybookConfig } from './types';

const getAbsolutePath = <I extends string>(input: I): I =>
  dirname(require.resolve(join(input, 'package.json'))) as any;

export const addons: PresetProperty<'addons', StorybookConfig> = [
  getAbsolutePath('@storybook/preset-vue3-webpack'),
];

export const core: PresetProperty<'core'> = async (config, options) => {
  const framework = await options.presets.apply('framework');

  return {
    ...config,
    builder: {
      name: getAbsolutePath('@storybook/builder-webpack5'),
      options: typeof framework === 'string' ? {} : framework.options.builder || {},
    },
    renderer: getAbsolutePath('@storybook/vue3'),
  };
};

export const typescript: PresetProperty<'typescript'> = async (config) => ({
  ...config,
  skipCompiler: true,
});
