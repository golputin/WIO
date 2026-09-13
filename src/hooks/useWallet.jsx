import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { env } from '../config/environment.js'
import * as wallet from '../services/wallet.js'

const WalletContext = createContext(null)

/**
 * Wallet state shared across the app.
 *
 * status: 'no_provider' | 'disconnected' | 'connecting' | 'connected'
 */
export function WalletProvider({ children }) {
  const [status, setStatus] = useState(wallet.hasInjectedProvider() ? 'disconnected' : 'no_provider')
  const [address, setAddress] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [error, setError] = useState(null)

  // Silent reconnect if the wallet already authorised this origin.
  useEffect(() => {
    if (!wallet.hasInjectedProvider()) return
    let cancelled = false
    ;(async () => {
      try {
        const [accounts, cid] = await Promise.all([wallet.getAccounts(), wallet.getChainId()])
        if (cancelled) return
        setChainId(cid)
        if (accounts[0]) {
          setAddress(accounts[0])
          setStatus('connected')
        }
      } catch {
        /* provider not ready; stay disconnected */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const offAccounts = wallet.onAccountsChanged((accounts) => {
      if (accounts?.[0]) {
        setAddress(accounts[0])
        setStatus('connected')
      } else {
        setAddress(null)
        setStatus('disconnected')
      }
    })
    const offChain = wallet.onChainChanged((cid) => setChainId(cid))
    return () => {
      offAccounts()
      offChain()
    }
  }, [])

  const connect = useCallback(async () => {
    if (!wallet.hasInjectedProvider()) {
      setStatus('no_provider')
      setError(new wallet.WalletError('no_provider', 'No wallet detected. Install a browser wallet to continue.'))
      return false
    }
    setError(null)
    setStatus('connecting')
    try {
      const accounts = await wallet.requestAccounts()
      const cid = await wallet.getChainId()
      setChainId(cid)
      if (accounts[0]) {
        setAddress(accounts[0])
        setStatus('connected')
        return true
      }
      setStatus('disconnected')
      return false
    } catch (err) {
      setError(wallet.normalizeWalletError(err))
      setStatus('disconnected')
      return false
    }
  }, [])

  const disconnect = useCallback(() => {
    // EIP-1193 has no standard disconnect; we drop local session state.
    setAddress(null)
    setStatus(wallet.hasInjectedProvider() ? 'disconnected' : 'no_provider')
  }, [])

  const expectedChainId = env.chainId ? Number(env.chainId) : null
  const wrongNetwork = Boolean(expectedChainId && chainId && expectedChainId !== chainId)

  const switchToExpected = useCallback(async () => {
    if (!expectedChainId) return
    try {
      await wallet.switchChain(expectedChainId)
    } catch (err) {
      setError(wallet.normalizeWalletError(err))
    }
  }, [expectedChainId])

  const value = useMemo(
    () => ({
      status,
      address,
      chainId,
      expectedChainId,
      wrongNetwork,
      error,
      isConnected: status === 'connected' && Boolean(address),
      connect,
      disconnect,
      switchToExpected,
      clearError: () => setError(null),
    }),
    [status, address, chainId, expectedChainId, wrongNetwork, error, connect, disconnect, switchToExpected],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within <WalletProvider>')
  return ctx
}
