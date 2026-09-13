/**
 * Thin EIP-1193 wallet adapter. All signing happens in the user's wallet; this module never
 * touches private keys. Gas values come from the wallet's provider (`eth_estimateGas`,
 * `eth_gasPrice`) — they are real network responses, never fabricated.
 */

export function getInjectedProvider() {
  if (typeof window === 'undefined') return null
  return window.ethereum ?? null
}

export function hasInjectedProvider() {
  return Boolean(getInjectedProvider())
}

async function rpc(method, params = []) {
  const provider = getInjectedProvider()
  if (!provider) throw new WalletError('no_provider', 'No wallet detected. Install a browser wallet to continue.')
  return provider.request({ method, params })
}

export class WalletError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}

export function normalizeWalletError(err) {
  if (err instanceof WalletError) return err
  const code = err?.code
  if (code === 4001 || err?.message?.toLowerCase?.().includes('user rejected')) {
    return new WalletError('rejected', 'Request rejected in wallet.')
  }
  if (code === -32002) return new WalletError('pending', 'A wallet request is already pending. Open your wallet to continue.')
  if (code === 4902) return new WalletError('unknown_chain', 'This network is not available in your wallet.')
  return new WalletError('unknown', err?.message || 'Wallet request failed.')
}

export async function requestAccounts() {
  const accounts = await rpc('eth_requestAccounts')
  return Array.isArray(accounts) ? accounts : []
}

export async function getAccounts() {
  const accounts = await rpc('eth_accounts')
  return Array.isArray(accounts) ? accounts : []
}

export async function getChainId() {
  const hex = await rpc('eth_chainId')
  return typeof hex === 'string' ? parseInt(hex, 16) : null
}

export async function switchChain(chainId) {
  return rpc('wallet_switchEthereumChain', [{ chainId: `0x${Number(chainId).toString(16)}` }])
}

/** Returns { gasLimit, gasPriceWei, totalWei } as decimal strings from the live network. */
export async function estimateGas(tx) {
  const [gasHex, priceHex] = await Promise.all([rpc('eth_estimateGas', [tx]), rpc('eth_gasPrice')])
  const gasLimit = BigInt(gasHex)
  const gasPriceWei = BigInt(priceHex)
  return {
    gasLimit: gasLimit.toString(),
    gasPriceWei: gasPriceWei.toString(),
    totalWei: (gasLimit * gasPriceWei).toString(),
  }
}

export async function sendTransaction(tx) {
  const hash = await rpc('eth_sendTransaction', [tx])
  if (typeof hash !== 'string') throw new WalletError('unknown', 'Wallet did not return a transaction hash.')
  return hash
}

export async function getTransactionReceipt(hash) {
  return rpc('eth_getTransactionReceipt', [hash])
}

/**
 * Poll for a receipt. Resolves with { status: 'confirmed'|'failed', receipt }.
 * Rejects only on provider errors or abort.
 */
export async function waitForReceipt(hash, { intervalMs = 3000, signal } = {}) {
  for (;;) {
    if (signal?.aborted) throw new WalletError('aborted', 'Stopped waiting for confirmation.')
    const receipt = await getTransactionReceipt(hash)
    if (receipt) {
      const okStatus = receipt.status === '0x1' || receipt.status === 1
      return { status: okStatus ? 'confirmed' : 'failed', receipt }
    }
    await new Promise((r) => setTimeout(r, intervalMs))
  }
}

export function onAccountsChanged(handler) {
  const p = getInjectedProvider()
  if (!p?.on) return () => {}
  p.on('accountsChanged', handler)
  return () => p.removeListener?.('accountsChanged', handler)
}

export function onChainChanged(handler) {
  const p = getInjectedProvider()
  if (!p?.on) return () => {}
  const wrapped = (hex) => handler(typeof hex === 'string' ? parseInt(hex, 16) : null)
  p.on('chainChanged', wrapped)
  return () => p.removeListener?.('chainChanged', wrapped)
}
