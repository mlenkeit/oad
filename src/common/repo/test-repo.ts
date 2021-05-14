interface Inp {
  store: number;
}
const testRepo = (obj: Inp) => {
  console.log('testRepo', obj.store)
  return {
    getAll: () => {
      return [ 1, 5, 89, obj.store ]
    }
  }
}

export default testRepo