import type { Pipe } from 'hotscript'

import type { Layer, OutwardFns } from './layer.js'

const $before = Symbol('$before')
type $before = typeof $before

export class Wrapper<BEFORE> {
  [$before]: BEFORE

  constructor(before: BEFORE) {
    this[$before] = before
  }

  with<LAYERS extends Layer[]>(
    ...layers: LAYERS
  ): Pipe<BEFORE, OutwardFns<LAYERS>> {
    return layers.reduce(
      (acc, layer) => layer(acc),
      this[$before] as unknown
    ) as Pipe<BEFORE, OutwardFns<LAYERS>>
  }
}
