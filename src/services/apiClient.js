/**
 * Simulates network/blockchain-call latency around mock data so components
 * consume services the same way they eventually will consume a real
 * REST/GraphQL API and real chain reads (loading states, async resolution)
 * without any of them importing from `data/` directly.
 */
export function resolveAfterDelay(value, delay = 350) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), delay)
  })
}
