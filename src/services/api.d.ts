export interface Agent {
    id: number;
    matricule: string;
    nom: string;
    prenoms: string;
    sexe: string;
    direction: string;
    fonction: string;
    telephone: string;
    email: string;
    date_embauche?: string;
    statut: string;
    jours_conge_annuel: number;
}

export interface Conge {
    id: number;
    employe_id: number;
    date_depart: string;
    date_retour: string;
    nombre_jours: number;
    type: string;
    motif: string;
    statut: string;
    agent?: Agent;
}

const api: {
    login: (matricule: string, password: string) => Promise<{ token: string; user: any }>;
    getAgents: () => Promise<Agent[]>;
    addAgent: (agentData: any) => Promise<Agent>;
    updateAgent: (id: number | string, agentData: any) => Promise<any>;
    deleteAgent: (id: number | string) => Promise<any>;
    getConges: () => Promise<Conge[]>;
    addConge: (congeData: any) => Promise<Conge>;
    updateCongeStatus: (id: number | string, statut: string) => Promise<any>;
};

export default api;
