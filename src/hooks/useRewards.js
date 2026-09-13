import { useCallback, useMemo } from 'react'
import * as rewardsApi from '../api/rewardsApi.js'
import * as protocolApi from '../api/protocolApi.js'
import { useAsyncResource } from './useAsyncResource.js'
import { useWallet } from './useWallet.jsx'

const BALANCE_REFRESH_MS = 30_000

/** Reward assets configured by the backend / contract. */
export function useRewardAssets() {
  return useAsyncResource((signal) => rewardsApi.getRewardAssets(signal))
}

/**
 * Claimable balances for the connected wallet, joined with the asset registry.
 * Returns `rows` only when both assets and balances resolved from live sources.
 */
export function useRewardBalances() {
  const { address, isConnected } = useWallet()
  const assets = useRewardAssets()
  const fetcher = useCallback((signal) => rewardsApi.getRewardBalances(address, signal), [address])
  const balances = useAsyncResource(fetcher, {
    enabled: isConnected && Boolean(address),
    refreshMs: BALANCE_REFRESH_MS,
    deps: [address],
  })

  const rows = useMemo(() => {
    if (assets.state !== 'ok' || balances.state !== 'ok') return null
    const bySymbol = new Map((Array.isArray(balances.data) ? balances.data : []).map((b) => [b.symbol?.toUpperCase(), b]))
    return (assets.data ?? [])
      .filter((a) => a.enabled)
      .map((asset) => {
        const bal = bySymbol.get(asset.symbol)
        return {
          asset,
          claimable: bal?.claimable ?? null,
          decimals: bal?.decimals ?? asset.decimals,
          claimableUsd: bal?.claimableUsd ?? null,
        }
      })
  }, [assets.state, assets.data, balances.state, balances.data])

  return { assets, balances, rows, refresh: () => { assets.refresh(); balances.refresh() } }
}

export function useRewardHistory() {
  const { address, isConnected } = useWallet()
  const fetcher = useCallback((signal) => rewardsApi.getRewardHistory(address, signal), [address])
  return useAsyncResource(fetcher, { enabled: isConnected && Boolean(address), deps: [address] })
}

export function useProtocolStatus() {
  return useAsyncResource((signal) => protocolApi.getProtocolStatus(signal), { refreshMs: 60_000 })
}
