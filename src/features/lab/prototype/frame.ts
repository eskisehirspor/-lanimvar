import { createContext, useContext } from 'react';

/** The story, in order. A static prototype: fixtures and timers, no backend. */
export const scenes = ['intro', 'home', 'draft', 'searching', 'accepted', 'live', 'done'] as const;
export type Scene = (typeof scenes)[number];

export const sceneIndex = (s: Scene) => scenes.indexOf(s);

export interface Point {
  x: number;
  y: number;
}

export interface Frame {
  w: number;
  h: number;
  top: number;
  bottom: number;
}

export const FrameContext = createContext<Frame>({ w: 390, h: 844, top: 47, bottom: 34 });
export const useFrame = () => useContext(FrameContext);

/** Story fixtures (fictional people, Eskişehir places). */
export const story = {
  customer: { name: 'Ayşe', initials: 'AK' },
  tasker: { name: 'Mehmet', full: 'Mehmet K.', initials: 'MK', rating: '4,9', tasks: 31 },
  neighbourhood: 'Hoşnudiye',
  online: 12,
  acceptMin: 4,
  price: 650,
  pin: '482913',
  eta: 7,
};
