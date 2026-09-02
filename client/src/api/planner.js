import { apiFetch } from './client.js'

export function askPlannerApi ({ text, prefs, history }) {
  return apiFetch('/api/planner/ask', {
    method: 'POST',
    body: JSON.stringify({ text, prefs, history })
  })
}

export function getPlannerStatus () {
  return apiFetch('/api/planner/status')
}
