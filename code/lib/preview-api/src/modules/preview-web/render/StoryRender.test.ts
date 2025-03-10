import { describe, it, expect, vi } from 'vitest';
import { Channel } from '@storybook/channels';
import type { Renderer, StoryIndexEntry } from '@storybook/types';
import type { StoryStore } from '../../store';
import { PREPARE_ABORTED } from './Render';

import { StoryRender } from './StoryRender';

const entry = {
  type: 'story',
  id: 'component--a',
  name: 'A',
  title: 'component',
  importPath: './component.stories.ts',
} as StoryIndexEntry;

const createGate = (): [Promise<any | undefined>, (_?: any) => void] => {
  let openGate = (_?: any) => {};
  const gate = new Promise<any | undefined>((resolve) => {
    openGate = resolve;
  });
  return [gate, openGate];
};

describe('StoryRender', () => {
  it('throws PREPARE_ABORTED if torndown during prepare', async () => {
    const [importGate, openImportGate] = createGate();
    const mockStore = {
      loadStory: vi.fn(async () => {
        await importGate;
        return {};
      }),
      cleanupStory: vi.fn(),
    };

    const render = new StoryRender(
      new Channel({}),
      mockStore as unknown as StoryStore<Renderer>,
      vi.fn(),
      {} as any,
      entry.id,
      'story'
    );

    const preparePromise = render.prepare();

    render.teardown();

    openImportGate();

    await expect(preparePromise).rejects.toThrowError(PREPARE_ABORTED);
  });

  it('does run play function if passed autoplay=true', async () => {
    const story = {
      id: 'id',
      title: 'title',
      name: 'name',
      tags: [],
      applyLoaders: vi.fn(),
      unboundStoryFn: vi.fn(),
      playFunction: vi.fn(),
      prepareContext: vi.fn(),
    };

    const render = new StoryRender(
      new Channel({}),
      { getStoryContext: () => ({}) } as any,
      vi.fn() as any,
      {} as any,
      entry.id,
      'story',
      { autoplay: true },
      story as any
    );

    await render.renderToElement({} as any);
    expect(story.playFunction).toHaveBeenCalled();
  });

  it('does not run play function if passed autoplay=false', async () => {
    const story = {
      id: 'id',
      title: 'title',
      name: 'name',
      tags: [],
      applyLoaders: vi.fn(),
      unboundStoryFn: vi.fn(),
      playFunction: vi.fn(),
      prepareContext: vi.fn(),
    };

    const render = new StoryRender(
      new Channel({}),
      { getStoryContext: () => ({}) } as any,
      vi.fn() as any,
      {} as any,
      entry.id,
      'story',
      { autoplay: false },
      story as any
    );

    await render.renderToElement({} as any);
    expect(story.playFunction).not.toHaveBeenCalled();
  });
});
