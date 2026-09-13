import { Router } from 'express'
import { configuredAssets, configError, erc20Abi, publicClient, rewardChainId, rewardRpcUrl, validWallet } from '../config/rewards.js'

export const rewards = Router()

rewards.get('/assets', async (_req, res) => {
  const assets = configuredAssets()
  if (!publicClient) return res.json({ status: 'unavailable', reason: 'not_configured', chainId: rewardChainId || null, assets })
  const out = []
  for (const asset of assets) {
    if (!asset.configured) { out.push(asset); continue }
    try {
      const [symbol, name, decimals] = await Promise.all([
        publicClient.readContract({ address: asset.contractAddress, abi: erc20Abi, functionName: 'symbol' }),
        publicClient.readContract({ address: asset.contractAddress, abi: erc20Abi, functionName: 'name' }),
        publicClient.readContract({ address: asset.contractAddress, abi: erc20Abi, functionName: 'decimals' }),
      ])
      out.push({ ...asset, symbol: String(symbol), name: String(name), decimals: Number(decimals) })
    } catch (error) {
      out.push({ ...asset, status: 'unavailable', error: error?.shortMessage || 'ERC-20 metadata unavailable.' })
    }
  }
  res.json({ status: 'ok', chainId: rewardChainId, assets: out })
})

rewards.get('/balances/:wallet', async (req, res) => {
  const wallet = validWallet(req.params.wallet)
  if (!wallet) return res.status(400).json({ status: 'invalid', error: 'Invalid wallet address.' })
  const assets = configuredAssets()
  if (!publicClient) return res.json({ status: 'unavailable', reason: 'not_configured', balances: [] })
  const balances = []
  for (const asset of assets) {
    if (!asset.configured) { balances.push({ ...asset }); continue }
    try {
      const [raw, decimals, symbol] = await Promise.all([
        publicClient.readContract({ address: asset.contractAddress, abi: erc20Abi, functionName: 'balanceOf', args: [wallet] }),
        publicClient.readContract({ address: asset.contractAddress, abi: erc20Abi, functionName: 'decimals' }),
        publicClient.readContract({ address: asset.contractAddress, abi: erc20Abi, functionName: 'symbol' }),
      ])
      balances.push({ ...asset, symbol: String(symbol), decimals: Number(decimals), balance: raw.toString(), status: 'configured' })
    } catch (error) {
      balances.push({ ...asset, status: 'unavailable', error: error?.shortMessage || 'Blockchain balance unavailable.' })
    }
  }
  res.json({ status: 'ok', wallet, chainId: rewardChainId, balances })
})

rewards.get('/history/:wallet', (_req, res) => res.json({ available: false, reason: 'Reward distributor contract is not configured.' }))
rewards.get('/protocol/status', async (_req, res) => {
  let rpc = false
  let rpcError = null
  if (publicClient) { try { await publicClient.getChainId(); rpc = true } catch (e) { rpcError = e?.shortMessage || 'RPC unavailable.' } }
  res.json({ chainId: rewardChainId || null, rpc, rpcError, configuredRewardAssets: configuredAssets().filter((x) => x.configured).length, totalRewardAssets: configuredAssets().length, rewardDistributor: { configured: false }, keeper: { configured: false }, status: publicClient ? (rpc ? 'read_only' : 'unavailable') : 'not_configured' })
})

rewards.post('/claims/prepare', (_req, res) => res.status(503).json({ status: 'not_configured', error: 'Reward distributor contract is not configured.' }))
rewards.get('/claims/:txHash', (_req, res) => res.status(503).json({ status: 'not_configured', error: 'Reward distributor contract is not configured.' }))

rewards.get('/_config-errors', (_req, res) => res.json(configuredAssets().filter((a) => !a.configured).map((a) => ({ symbol: a.symbol, error: configError(a) }))))
