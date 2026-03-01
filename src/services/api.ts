/**
 * SERVICE API - Système DRH Mairie de Yopougon
 * Gère les appels backend avec authentification JWT
 */

const API_BASE = '/api';

// Login
export const login = async (matricule: string, password: string) => {
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
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
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
  
  addAgent: (data: any) => fetchWithAuth('/agents', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateAgent: (id: number, data: any) => fetchWithAuth(`/agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  deleteAgent: (id: number, password: string) => fetchWithAuth(`/agents/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ password })
  }),

  verifyPassword: (password: string) => fetchWithAuth('/verify-password', {
    method: 'POST',
    body: JSON.stringify({ password })
  }),

  // Solde congés d'un agent
  getAgentSolde: (id: number) => fetchWithAuth(`/employes/${id}/solde`),

  // Congés
  getConges: () => fetchWithAuth('/conges'),

  addConge: (data: any) => fetchWithAuth('/conges', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateCongeStatus: (id: number, statut: string) => fetchWithAuth(`/conges/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ statut })
  }),

  // Congés fin proche
  getCongesFinProche: () => fetchWithAuth('/conges/fin-proche'),

  // Historique congés (avant système)
  addHistoriqueConge: (employeId: number, data: any) => fetchWithAuth(`/agents/${employeId}/historique-conges`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getHistoriqueConges: (employeId: number) => fetchWithAuth(`/agents/${employeId}/historique-conges`),

  // Notifications
  getNotifications: () => fetchWithAuth('/notifications'),
  
  getNotificationsCount: () => fetchWithAuth('/notifications/count'),
  
  markNotificationRead: (id: number) => fetchWithAuth(`/notifications/${id}/read`, {
    method: 'PUT'
  }),
  
  markAllNotificationsRead: () => fetchWithAuth('/notifications/read-all', {
    method: 'PUT'
  }),
  
  notificationActionDone: (id: number) => fetchWithAuth(`/notifications/${id}/action-done`, {
    method: 'PUT'
  }),

  // Choix congés annuels
  getChoixConges: (annee: number) => fetchWithAuth(`/choix-conges/${annee}`),
  
  getChoixCongeAgent: (employeId: number, annee: number) => fetchWithAuth(`/choix-conges/agent/${employeId}/${annee}`),
  
  addChoixConge: (data: any) => fetchWithAuth('/choix-conges', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  updateChoixConge: (id: number, data: any) => fetchWithAuth(`/choix-conges/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  validerChoixConge: (id: number, data: any) => fetchWithAuth(`/choix-conges/${id}/valider`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  getAgentsManquantsChoix: (annee: number) => fetchWithAuth(`/choix-conges/${annee}/manquants`),
};

export default api;
