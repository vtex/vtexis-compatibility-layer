function distinct<T>(value: T, index: number, self: T[]) {
  return self.indexOf(value) === index
}

const objToNameValue = (
  keyName: string,
  valueName: string,
  record: Record<string, unknown> | null | undefined
) => {
  if (!record) {
    return []
  }
  return Object.keys(record).reduce((acc, key) => {
    const value = record[key]
    if (typeof value === 'string') {
      acc.push({ [keyName]: key, [valueName]: value })
    }
    return acc
  }, [] as Array<Record<string, string>>)
}

export { distinct, objToNameValue }
