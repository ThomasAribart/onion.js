import type {
  ComposeLeft as ComposeDown,
  Compose as ComposeUp
} from 'hotscript'

import type { InwardFns, Layer, OutwardFns, Types } from './layer.js'

type Loosest<TYPES extends unknown[], OUTPUT = never> = TYPES extends [
  infer TYPES_HEAD,
  ...infer TYPES_TAIL
]
  ? Loosest<
      TYPES_TAIL,
      [TYPES_HEAD] extends [OUTPUT]
        ? OUTPUT
        : [OUTPUT] extends [TYPES_HEAD]
          ? TYPES_HEAD
          : never
    >
  : OUTPUT

const composeTwo =
  (layerA: Layer, layerB: Layer) =>
  (arg: unknown): unknown =>
    layerA(layerB(arg))

const identity: Layer = (arg: unknown): unknown => arg

export type ComposeUpLayers<LAYERS extends Layer[]> = Layer<
  Loosest<Types<LAYERS>>,
  ComposeUp<OutwardFns<LAYERS>>,
  ComposeDown<InwardFns<LAYERS>>
>

export const composeUp = <LAYERS extends Layer[]>(
  ...layers: LAYERS
): ComposeUpLayers<LAYERS> =>
  layers.reduce(composeTwo, identity) as ComposeUpLayers<LAYERS>

export type ComposeDownLayers<LAYERS extends Layer[]> = Layer<
  Loosest<Types<LAYERS>>,
  ComposeDown<OutwardFns<LAYERS>>,
  ComposeUp<InwardFns<LAYERS>>
>

export const composeDown = <LAYERS extends Layer[]>(
  ...layers: LAYERS
): ComposeDownLayers<LAYERS> =>
  [...layers]
    .reverse()
    .reduce(composeTwo, identity) as ComposeDownLayers<LAYERS>
