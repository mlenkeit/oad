import TransformableArray, { ArrayTransformation } from './../util/transformable-array'

type HutID = number;

interface Hut {
  hutId: HutID,
  name: string
}


type HutArrayTransformation = ArrayTransformation<Hut>

const getAll = async (): Promise<TransformableArray<Hut>> => {
  return TransformableArray.from([
    {
      hutId: 1,
      name: 'Beispiel-Hütte 1'
    },
    {
      hutId: 2,
      name: 'Beispiel-Hütte 2'
    },
    {
      hutId: 3,
      name: 'Beispiel-Hütte 3'
    }
  ])
}

const getById = async (hutId: HutID): Promise<Hut|null> => {
  const allHuts = await getAll()
  const hut = allHuts.toArray().find(it => it.hutId === hutId)
  return hut ?? null
}

const hutRepo = () => {
  return {
    getAll,
    getById,
    tx: {
      filterByName: (query: string): HutArrayTransformation => arr => {
        const pattern = new RegExp(query, 'gi')
        const res = arr.filter(hut => {
          return pattern.test(hut.name)
        })
        return res
      }
    }
  }
}

export default hutRepo