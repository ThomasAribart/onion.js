import type { Pipe } from 'hotscript'

import type { InwardFns, Layer, OutwardFns } from './layer.js'

const $layers = Symbol('$layers')
type $layers = typeof $layers

type OnionWrap<CORE extends object> = CORE & {
  with<LAYERS extends Layer[]>(
    ...layers: LAYERS
  ): Pipe<CORE, OutwardFns<LAYERS>> extends object
    ? OnionWrap<Pipe<CORE, OutwardFns<LAYERS>>>
    : never
}

export class Onion<SKIN extends object, LAYERS extends Layer[] = Layer[]> {
  static wrap<CORE extends object>(core: CORE): OnionWrap<CORE> {
    Object.assign(core, {
      with: (...layers: Layer[]): unknown =>
        Onion.wrap(layers.reduce((acc, layer) => layer(acc) as object, core as object))
    })

    return core as OnionWrap<CORE>
  }

  static produce<_SKIN extends object>(): Onion<_SKIN> {
    return new Onion<_SKIN>()
  }

  [$layers]: LAYERS

  constructor(...layers: LAYERS) {
    this[$layers] = layers
  }

  with<NEXT_LAYERS extends Layer[]>(...layers: NEXT_LAYERS): Onion<SKIN, NEXT_LAYERS> {
    return new Onion(...layers)
  }

  from(core: Pipe<SKIN, InwardFns<LAYERS>>): SKIN {
    return [...this[$layers]].reverse().reduce((acc, hof) => hof(acc), core as unknown) as SKIN
  }
}
