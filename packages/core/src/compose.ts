import type { Compose, ComposeLeft } from 'hotscript'

import type { InwardFns, Layer, OutwardFns, Types } from './layer.js'

type Widest<TYPES extends unknown[], OUTPUT = never> = TYPES extends [
  infer TYPES_HEAD,
  ...infer TYPES_TAIL
]
  ? Widest<
      TYPES_TAIL,
      [TYPES_HEAD] extends [OUTPUT]
        ? OUTPUT
        : [OUTPUT] extends [TYPES_HEAD]
          ? TYPES_HEAD
          : never
    >
  : OUTPUT

export type ComposeLayers<LAYERS extends Layer[]> = Layer<
  Widest<Types<LAYERS>>,
  Compose<OutwardFns<LAYERS>>,
  ComposeLeft<InwardFns<LAYERS>>
>

const composeTwo =
  (layerA: Layer, layerB: Layer) =>
  (arg: unknown): unknown =>
    layerA(layerB(arg))

const identity: Layer = (arg: unknown): unknown => arg

export const compose = <LAYERS extends Layer[]>(
  ...layers: LAYERS
): ComposeLayers<LAYERS> =>
  layers.reduce(composeTwo, identity) as ComposeLayers<LAYERS>
