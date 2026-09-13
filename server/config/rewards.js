import { getAddress, http, createPublicClient } from 'viem'
import { defineChain } from 'viem'

const symbols = ['AAPL', 'SPY', 'SPCX', 'AMZN', 'NVDA', 'TSLA']
const chainId = Number(process.env.REWARD_CHAIN_ID || 0)
const rpcUrl = String(process.env.REWARD_RPC_URL || '').trim()

export const rewardChainId = chainId
export const rewardRpcUrl = rpcUrl
export const rewardSymbols = symbols

export const rewardChain = chainId > 0 ? defineChain({
  id: chainId,
  name: process.env.REWARD_CHAIN_NAME || `Configured chain ${chainId}`,
  nativeCurrency: { name: 'Native', symbol: 'NATIVE', decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl || 'http://127.0.0.1:0'] } },
}) : null

export const publicClient = rewardChain && rpcUrl ? createPublicClient({ chain: rewardChain, transport: http(rpcUrl) }) : null

export function configuredAssets() {
  return symbols.map((symbol) => {
    const raw = String(process.env[`REWARD_${symbol}_CONTRACT`] || '').trim()
    if (!raw) return { symbol, configured: false, status: 'not_configured', contractAddress: null, chainId: chainId || null }
    try {
      return { symbol, configured: true, status: 'configured', contractAddress: getAddress(raw), chainId }
    } catch {
      return { symbol, configured: false, status: 'invalid', contractAddress: raw, chainId: chainId || null, error: 'Invalid EVM contract address.' }
    }
  })
}

export const erc20Abi = [
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'name', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
]

export function validWallet(value) {
  try { return getAddress(String(value || '')) } catch { return null }
}

export function configError(asset) {
  return asset.error ? asset.error : 'Asset contract is not configured.'
}
