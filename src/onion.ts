import { Producer } from './producer'
import { Wrapper } from './wrapper'

export class Onion {
  static wrap<BEFORE>(before: BEFORE): Wrapper<BEFORE> {
    return new Wrapper(before)
  }

  static produce<AFTER>(): Producer<AFTER> {
    return new Producer<AFTER>()
  }
}
