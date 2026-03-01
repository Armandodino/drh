/**
 * SERVICE API - Système DRH Mairie de Yopougon
 * Gère les appels backend avec authentification JWT
 */

const API_BASE = '/api';

// Login
export const login = async (matricule, password) => {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricule, password }),
    });
    return await response.json();
  } catch (error) {
    console.error("❌ Erreur connexion:", error);
    throw error;
  }
};

// Helper avec authentification
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('drh_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('drh_token');
    localStorage.removeItem('user_data');
    window.location.reload();
    return null;
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Erreur API');
  }

  return await response.json();
};

// API Object
const api = {
  login,
  
  // Dashboard
  getDashboard: () => fetchWithAuth('/dashboard'),
  
  // Agents
  getAgents: () => fetchWithAuth('/agents'),
  
  addAgent: (data) => fetchWithAuth('/agents', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateAgent: (id, data) => fetchWithAuth(`/agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  deleteAgent: (id, password) => fetchWithAuth(`/agents/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ password })
  }),

  verifyPassword: (password) => fetchWithAuth('/verify-password', {
    method: 'POST',
    body: JSON.stringify({ password })
  }),

  // Solde congés d'un agent
  getAgentSolde: (id) => fetchWithAuth(`/employes/${id}/solde`),

  // Congés
  getConges: () => fetchWithAuth('/conges'),

  addConge: (data) => fetchWithAuth('/conges', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateCongeStatus: (id, statut) => fetchWithAuth(`/conges/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ statut })
  }),

  // Historique congés (avant système)
  addHistoriqueConge: (employeId, data) => fetchWithAuth(`/agents/${employeId}/historique-conges`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getHistoriqueConges: (employeId) => fetchWithAuth(`/agents/${employeId}/historique-conges`)
};

export default api;
