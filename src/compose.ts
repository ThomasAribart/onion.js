import type { Compose, ComposeLeft } from 'hotscript'

import type { InwardResolvers, Layer, OutwardResolvers, Types } from './layer.js'

type Widest<TYPES extends object[], OUTPUT extends object = never> = TYPES extends [
  infer TYPES_HEAD,
  ...infer TYPES_TAIL
]
  ? TYPES_HEAD extends object
    ? TYPES_TAIL extends object[]
      ? Widest<
          TYPES_TAIL,
          [TYPES_HEAD] extends [OUTPUT]
            ? OUTPUT
            : [OUTPUT] extends [TYPES_HEAD]
              ? TYPES_HEAD
              : never
        >
      : never
    : never
  : OUTPUT

type ComposeLayers<LAYERS extends Layer[]> = Layer<
  Widest<Types<LAYERS>>,
  Compose<OutwardResolvers<LAYERS>>,
  ComposeLeft<InwardResolvers<LAYERS>>
>

const composeTwo = (layerA: Layer, layerB: Layer) => (arg: object) => layerA(layerB(arg)) as object

const identity: Layer = (arg: unknown): unknown => arg

export const compose = <LAYERS extends Layer[]>(...layers: LAYERS): ComposeLayers<LAYERS> =>
  layers.reduce(composeTwo, identity) as ComposeLayers<LAYERS>
