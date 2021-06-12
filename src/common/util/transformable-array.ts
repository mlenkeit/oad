
export type ArrayTransformation<Type> = {
  (arr: Type[]) : Promise<Type[]> | Type[]
}

export default class TransformableArray<Type> {

  items: Type[] = []

  constructor(items: Type[]) {
    this.items = items
  }

  static from<Type>(array: Type[]): TransformableArray<Type> {
    const arr = new TransformableArray(array)
    return arr
  }

  async transform(...tx: ArrayTransformation<Type>[]): Promise<TransformableArray<Type>> {
    if (tx.length === 0) return TransformableArray.from(this.items)

    const arr = await tx.reduce(async (arr, fn) => {
      const newArr = await arr
      return fn(newArr)
    }, Promise.resolve(this.items))
    
    return TransformableArray.from(arr)
  }

  toArray(): Type[] {
    return [...this.items]
  }
}