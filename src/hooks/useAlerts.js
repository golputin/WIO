import { useCallback, useState } from 'react'
import * as alertsApi from '../api/alertsApi.js'
import { providers } from '../config/environment.js'
import { useAsyncResource } from './useAsyncResource.js'

/**
 * Alert rules live in the alerts backend. Without a backend the builder still validates input but
 * clearly reports that notifications are not active.
 */
export function useAlerts() {
  const list = useAsyncResource((signal) => alertsApi.listAlerts(signal), { enabled: providers.alerts })
  const [mutation, setMutation] = useState({ state: 'idle', message: null })

  const create = useCallback(
    async (rule) => {
      if (!providers.alerts) {
        setMutation({ state: 'unavailable', message: 'Alert service unavailable. Connect the alert backend to enable notifications.' })
        return false
      }
      setMutation({ state: 'saving', message: null })
      const res = await alertsApi.createAlert(rule)
      if (res.status === 'ok') {
        setMutation({ state: 'ok', message: 'Alert created.' })
        list.refresh()
        return true
      }
      setMutation({ state: 'error', message: res.message })
      return false
    },
    [list],
  )

  const remove = useCallback(
    async (id) => {
      const res = await alertsApi.deleteAlert(id)
      if (res.status === 'ok') list.refresh()
      return res.status === 'ok'
    },
    [list],
  )

  return { list, create, remove, mutation, serviceConfigured: providers.alerts }
}
