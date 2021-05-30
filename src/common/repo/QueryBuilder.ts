export type ResultTransformation<T> = {
  (arr: T[]) : Promise<T[]> | T[]
}

export default abstract class QueryBuilder<T> {
  private data: Promise<T[]> | T []
  private tx: ResultTransformation<T>[]
  constructor(data : Promise<T[]> | T [], tx: ResultTransformation<T>[] = []) {
    this.data = data
    this.tx = tx
  }

  protected queue (tx: ResultTransformation<T>): QueryBuilder<T> {
    return this.copy(this.data, [...this.tx, tx])
  }
  protected queueFilter(fn: (value: T, index: number, array: T[]) => boolean): QueryBuilder<T> {
    return this.queue(arr => arr.filter(fn))
  }
  protected queueSort(comparator: ((a: T, b: T) => number)): QueryBuilder<T> {
    return this.queue(arr => arr.sort(comparator))
  }

  protected abstract copy(data: Promise<T[]> | T [], tx: ResultTransformation<T>[]): QueryBuilder<T>;

  async apply (): Promise<T[]> {
    const allData = await this.data
    if (this.tx.length === 0) return [...allData]

    const arr = await this.tx.reduce(async (arr, fn) => {
      const newArr = await arr
      return fn(newArr)
    }, Promise.resolve(allData))
    return arr
  }

}