export type ValueTag = { id: string; value: string; label?: string }
export type ValueTagState = { tags: ValueTag[]; open: boolean }
export type ValueTagAction =
  | { type: "add"; tag: ValueTag }
  | { type: "remove"; id: string }
  | { type: "open"; open: boolean }

export const initialValueTagState: ValueTagState = { tags: [], open: false }

/** Identity belongs to the source field, never its position or displayed value. */
export function valueTagId(scope: string, field: string) {
  return JSON.stringify([scope, field])
}

export function valueTagReducer(state: ValueTagState, action: ValueTagAction): ValueTagState {
  switch (action.type) {
    case "add": {
      if (!action.tag.id.trim() || !action.tag.value.trim()) return state
      const existing = state.tags.findIndex(tag => tag.id === action.tag.id)
      const tag = { ...action.tag }
      return {
        open: true,
        tags: existing < 0 ? [...state.tags, tag] : state.tags.map((current, index) => index === existing ? tag : current),
      }
    }
    case "remove":
      return { ...state, tags: state.tags.filter(tag => tag.id !== action.id) }
    case "open":
      return { ...state, open: action.open }
  }
}

export function sampleTagReply(tags: readonly ValueTag[]) {
  if (!tags.length) return "This is a sample conversation. Tag a value anywhere in BrokerOS to include it in your next message."
  return `For this message, you selected ${tags.length === 1 ? "this value" : "these values"}: ${tags.map(tag => `“${tag.value}”`).join(", ")}. This is a sample reply; AI analysis isn’t connected yet.`
}
