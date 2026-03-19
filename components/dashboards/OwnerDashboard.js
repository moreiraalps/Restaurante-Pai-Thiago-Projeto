'use client'

import ManagerDashboard from './ManagerDashboard'

// Owner dashboard inherits from Manager with additional features
// For MVP, we'll use the same interface. Can be extended later.
const OwnerDashboard = ({ user, onLogout }) => {
  return <ManagerDashboard user={user} onLogout={onLogout} />
}

export default OwnerDashboard