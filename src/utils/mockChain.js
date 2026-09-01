/**
 * Deterministic, dependency-free generators for mock on-chain identifiers.
 * Same seed always produces the same hash/wallet, so re-importing a data
 * file (or re-running the dev server) never reshuffles "who owns what" —
 * important once traceabilityService starts mutating batch state at
 * runtime and deriving its transaction log from these values.
 */
function hashString(input) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  // Avalanche finalizer (MurmurHash3 fmix32). Without this, seeds that differ
  // only in a trailing incrementing digit — "PHM-005:evt:0", "…:evt:1", … —
  // hash to nearly identical values (the loop above just adds the digit's
  // char code on the last iteration), so every generator that seeds by
  // index (event history, SHAP feature jitter, etc.) would produce
  // near-constant "random" output instead of a real spread.
  hash ^= hash >>> 16
  hash = Math.imul(hash, 0x85ebca6b)
  hash ^= hash >>> 13
  hash = Math.imul(hash, 0xc2b2ae35)
  hash ^= hash >>> 16
  return hash >>> 0
}

/** A 64-hex-char mock transaction hash, seeded so the same event always resolves to the same hash. */
export function generateTxHash(seed) {
  let out = ''
  let h = hashString(seed)
  for (let i = 0; i < 8; i++) {
    h = hashString(`${h}:${seed}:${i}`)
    out += h.toString(16).padStart(8, '0')
  }
  return `0x${out.slice(0, 64)}`
}

/** A 40-hex-char mock wallet address, seeded so the same actor always resolves to the same wallet. */
export function generateWalletAddress(seed) {
  return `0x${generateTxHash(`wallet:${seed}`).slice(2, 42)}`
}

/** A deterministic float in [0, 1), seeded — the building block for every mock AI score/confidence/SHAP value. */
export function seededRandom(seed) {
  return hashString(seed) / 0xffffffff
}

let counter = 0
/** Monotonic-looking id suffix for events created during a session (transfers, confirmations). */
export function nextEventSeed(prefix) {
  counter += 1
  return `${prefix}-${Date.now()}-${counter}`
}
