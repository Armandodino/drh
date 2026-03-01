/**
 * SERVICE API - Système DRH Mairie de Yopougon
 * Gère les appels backend avec authentification JWT
 */

const API_BASE = '/api';

// 1. EXPORT NOMMÉ : Indispensable pour l'import { login } dans Login.jsx
export const login = async (matricule, password) => {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricule, password }),
    });
    
    return await response.json();
  } catch (error) {
    console.error("❌ Erreur connexion serveur:", error);
    throw error;
  }
};

/**
 * Helper interne pour les requêtes nécessitant le Token
 */
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('drh_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  try {
    const response = await fetch(`${API_BASE}${url}`, { ...options, headers });

    // Si le token est expiré ou invalide
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('drh_token');
      localStorage.removeItem('user_data');
      // On recharge pour déclencher le retour au Login proprement
      window.location.reload();
      return null;
    }

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Erreur API');
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Erreur API sur ${url}:`, error);
    throw error;
  }
};

// 2. EXPORT PAR DÉFAUT : Objet regroupant toutes les méthodes
const api = {
  login,
  
  // AGENTS
  getAgents: () => fetchWithAuth('/agents'),
  
  addAgent: (agentData) => fetchWithAuth('/agents', {
    method: 'POST',
    body: JSON.stringify(agentData)
  }),

  updateAgent: (id, agentData) => fetchWithAuth(`/agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(agentData)
  }),

  deleteAgent: (id) => fetchWithAuth(`/agents/${id}`, {
    method: 'DELETE'
  }),

  // CONGÉS
  getConges: () => fetchWithAuth('/conges'),

  addConge: (congeData) => fetchWithAuth('/conges', {
    method: 'POST',
    body: JSON.stringify(congeData)
  }),

  updateCongeStatus: (id, statut) => fetchWithAuth(`/conges/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ statut })
  })
};

export default api;