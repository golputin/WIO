import { useCallback, useRef, useState } from 'react'
import * as rewardsApi from '../api/rewardsApi.js'
import * as wallet from '../services/wallet.js'
import { useWallet } from './useWallet.jsx'

/**
 * Drives a real claim transaction.
 *
 * step:
 *   'idle' | 'estimating' | 'ready' | 'preparing' | 'awaiting_wallet' | 'submitted' | 'confirming'
 *   | 'success' | 'failed' | 'rejected' | 'unavailable'
 *
 * Every transition is caused by a real backend / wallet / network response.
 */
export function useClaim() {
  const { address } = useWallet()
  const [step, setStep] = useState('idle')
  const [prepared, setPrepared] = useState(null) // { to, data, value, gas }
  const [gas, setGas] = useState(null) // { gasLimit, gasPriceWei, totalWei, nativeSymbol? }
  const [txHash, setTxHash] = useState(null)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setStep('idle')
    setPrepared(null)
    setGas(null)
    setTxHash(null)
    setError(null)
  }, [])

  /** Ask backend for calldata and fetch a live gas estimate from the wallet's network. */
  const estimate = useCallback(
    async (symbols) => {
      if (!address) return
      setError(null)
      setStep('estimating')
      const res = await rewardsApi.prepareClaim(address, symbols)
      if (res.status !== 'ok' || !res.data?.to || !res.data?.data) {
        setError({ message: res.message ?? 'Reward data unavailable.', reason: res.reason })
        setStep('unavailable')
        return
      }
      setPrepared(res.data)
      try {
        const live = await wallet.estimateGas({ from: address, to: res.data.to, data: res.data.data, value: res.data.value })
        setGas({ ...live, nativeSymbol: res.data.gas?.nativeSymbol })
      } catch (err) {
        // Fall back to backend estimate if the wallet cannot estimate; still a real source.
        if (res.data.gas?.gasLimit && res.data.gas?.gasPriceWei) {
          setGas(res.data.gas)
        } else {
          setError(wallet.normalizeWalletError(err))
          setStep('unavailable')
          return
        }
      }
      setStep('ready')
    },
    [address],
  )

  const confirm = useCallback(async () => {
    if (!prepared || !address) return
    setError(null)
    setStep('preparing')
    const controller = new AbortController()
    abortRef.current = controller
    try {
      setStep('awaiting_wallet')
      const hash = await wallet.sendTransaction({
        from: address,
        to: prepared.to,
        data: prepared.data,
        value: prepared.value,
      })
      setTxHash(hash)
      setStep('submitted')
      setStep('confirming')
      const { status } = await wallet.waitForReceipt(hash, { signal: controller.signal })
      setStep(status === 'confirmed' ? 'success' : 'failed')
    } catch (err) {
      const normalized = wallet.normalizeWalletError(err)
      setError(normalized)
      setStep(normalized.code === 'rejected' ? 'rejected' : 'failed')
    }
  }, [prepared, address])

  return { step, prepared, gas, txHash, error, estimate, confirm, reset }
}

export const CLAIM_STEP_LABEL = Object.freeze({
  estimating: 'Estimating network fee...',
  preparing: 'Preparing transaction...',
  awaiting_wallet: 'Waiting for wallet confirmation...',
  submitted: 'Transaction submitted...',
  confirming: 'Confirming transaction...',
  success: 'Claim successful.',
  failed: 'Transaction failed.',
  rejected: 'Transaction rejected in wallet.',
  unavailable: 'Reward data unavailable.',
})
