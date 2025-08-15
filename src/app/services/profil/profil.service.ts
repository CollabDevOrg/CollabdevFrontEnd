import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

export interface Utilisateur {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  genre: string;
  role: string;
  etat: boolean;
  preferences: string[];
  // autres champs si besoin
}

export interface ReponseProfil {
  id: number;
  utilisateur: Utilisateur;
  uriCv?: string;
  estValide?: boolean;
  projets: any[];
  profilId?: number;
}
export interface Projet {
  id: number;
  titre: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class UtilisateurService {
  private baseUrl = 'http://localhost:8180/utilisateurs';
  private apiRoot = 'http://localhost:8180';

  constructor(private http: HttpClient) {}

  getUtilisateurById(id: number, role: string): Observable<ReponseProfil> {
    return this.http.get<any>(`${this.baseUrl}/${id}?role=${role}`).pipe(
      map((response: any) => {
        const utilisateur: Utilisateur = {
          id: response.id,
          prenom: response.prenom,
          nom: response.nom,
          email: response.email,
          genre: response.genre,
          role: role,
          etat: true,
          preferences: Array.isArray(response.preferences)
            ? response.preferences
            : [],
        };

        const reponseProfil: ReponseProfil = {
          id: response.id,
          utilisateur,
          uriCv: response.uriCv,
          estValide: response.estValide,
          projets: Array.isArray(response.projets) ? response.projets : [],
          profilId:
            // Contributeur
            response.idContributeur ||
            response.contributeurId ||
            response.id_contributeur ||
            // Gestionnaire
            response.idGestionnaire ||
            response.gestionnaireId ||
            response.id_gestionnaire ||
            // Porteur de projet
            response.idPorteurProjet ||
            response.porteurProjetId ||
            response.id_porteur_projet ||
            undefined,
        };
        return reponseProfil;
      })
    );
  }

  updatePreferences(id: number, preferences: string[]): Observable<string[]> {
    return this.http.put<string[]>(`${this.baseUrl}/${id}`, preferences);
  }

  getContributionsByUser(
    id: number,
    role: string,
    profilId?: number
  ): Observable<Projet[]> {
    let url = '';
    switch (role) {
      case 'GESTIONNAIRE':
        url = `${this.apiRoot}/gestionnaires/${id}/projets`;
        break;
      case 'CONTRIBUTEUR':
        if (!profilId) {
          return of([]);
        }
        url = `${this.apiRoot}/utilisateurs/contributeurs/projets/${profilId}`;
        break;

      case 'PORTEUR_PROJET':
        //  On va chercher ses idées de projets proposées
        url = `${this.apiRoot}/utilisateurs/${id}/idees-projet`;
        break;

      default:
        return of([]);
    }
    return this.http.get<Projet[]>(url).pipe(catchError(() => of([])));
  }

  // Mise à jour des infos utilisateur selon le rôle (sans changer le rôle)
  updateContributeur(profilId: number, payload: any) {
    const url = `${this.apiRoot}/utilisateurs/contributeurs/${profilId}`;
    return this.http.put<any>(url, payload);
  }

  updatePorteurProjet(profilId: number, utilisateurPayload: any) {
    const url = `${this.apiRoot}/utilisateurs/porteurs-projet/${profilId}`;
    return this.http.put<any>(url, utilisateurPayload);
  }

  //logique pour afficher les badges d'accomplissement:
  getBadgesByContributeur(idContributeur: number): Observable<any[]> {
    const url = `${this.apiRoot}/utilisateurs/contributeurs/${idContributeur}/obtentions-badge`;
    return this.http.get<any[]>(url).pipe(catchError(() => of([])));
  }
}
