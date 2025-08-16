import type {
  ComposeLeft as ComposeDown,
  Compose as ComposeUp
} from 'hotscript'

import type { After, Before, InFns, Layer, OutFns } from './layer.js'

const composeTwo =
  (layerA: Layer, layerB: Layer) =>
  (arg: unknown): unknown =>
    layerA(layerB(arg))

const identity: Layer = (arg: unknown): unknown => arg

type First<ITEMS extends unknown[]> = ITEMS extends [
  infer ITEMS_HEAD,
  ...unknown[]
]
  ? ITEMS_HEAD
  : never

type Last<ITEMS extends unknown[], OUTPUT = never> = ITEMS extends [
  infer ITEMS_HEAD,
  ...infer ITEMS_TAIL
]
  ? Last<ITEMS_TAIL, ITEMS_HEAD>
  : OUTPUT

export type ComposeUpLayers<
  LAYERS extends Layer[],
  FIRST_LAYER = First<LAYERS>,
  LAST_LAYER = Last<LAYERS>
> = Layer<
  FIRST_LAYER extends Layer ? Before<FIRST_LAYER> : never,
  ComposeUp<OutFns<LAYERS>>,
  LAST_LAYER extends Layer ? After<LAST_LAYER> : never,
  ComposeDown<InFns<LAYERS>>
>

export const composeUp = <LAYERS extends Layer[]>(
  ...layers: LAYERS
): ComposeUpLayers<LAYERS> =>
  layers.reduce(composeTwo, identity) as ComposeUpLayers<LAYERS>

export type ComposeDownLayers<
  LAYERS extends Layer[],
  FIRST_LAYER = First<LAYERS>,
  LAST_LAYER = Last<LAYERS>
> = Layer<
  LAST_LAYER extends Layer ? Before<LAST_LAYER> : never,
  ComposeDown<OutFns<LAYERS>>,
  FIRST_LAYER extends Layer ? After<FIRST_LAYER> : never,
  ComposeUp<InFns<LAYERS>>
>

export const composeDown = <LAYERS extends Layer[]>(
  ...layers: LAYERS
): ComposeDownLayers<LAYERS> =>
  [...layers]
    .reverse()
    .reduce(composeTwo, identity) as ComposeDownLayers<LAYERS>
