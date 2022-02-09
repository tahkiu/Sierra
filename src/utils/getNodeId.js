let curAvailId = 0
let undoResetCache = 0

export const getNodeId = () => {
  const res = `${curAvailId}`
  curAvailId++
  return res
}

export const resetCurAvailId = () => {
  undoResetCache = curAvailId;
  curAvailId = 0
}

export const undoResetNodeId = () => {
  curAvailId = undoResetCache
  undoResetCache = 0
}
