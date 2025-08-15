import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UtilisateurService,
  Utilisateur,
  ReponseProfil,
} from '../../services/profil/profil.service';

@Component({
  selector: 'app-profil-contributeur',
  imports: [CommonModule, FormsModule],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css',
})
export class ProfilComponent implements OnInit {
  utilisateur!: Utilisateur;
  idUtilisateur = 1; // valeur par défaut, sera remplacée par l'ID du localStorage
  // Préférences retirées du flux d'édition
  badges: any[] = [];
  badgeImages: { [key: string]: string } = {
    NOOB: 'Badge 1.png',
    'PETIT CONTRIBUTEUR': 'Badge 2.png',
    CONTRIBUTEUR: 'Badge 3.png',
    EXPERT: 'Badge 4.png',
    MAÎTRE: 'Badge 5.png',
  };
  projets: any[] = []; // <-- initialisation du tableau projets
  role: string | null = '';
  profilId?: number;
  isEditOpen = false;
  // Champs de saisie pour l'édition
  formEdit: { prenom: string; nom: string; genre?: string } = {
    prenom: '',
    nom: '',
    // email: '',
    genre: undefined,
  };

  constructor(private utilisateurService: UtilisateurService) {}

  ngOnInit(): void {
    const idFromStorage = localStorage.getItem('user_id');
    const roleFromStorage = localStorage.getItem('user_role');
    this.role = roleFromStorage;
    if (idFromStorage) {
      this.idUtilisateur = isNaN(Number(idFromStorage))
        ? this.idUtilisateur
        : Number(idFromStorage);
    }

    this.utilisateurService
      .getUtilisateurById(this.idUtilisateur, this.role || '')
      .subscribe({
        next: (data: ReponseProfil) => {
          this.utilisateur = data.utilisateur;
          this.formEdit = {
            prenom: this.utilisateur.prenom,
            nom: this.utilisateur.nom,
            //email: this.utilisateur.email,
            genre: this.toShortGenre(this.utilisateur.genre),
          };
          // Préférences non éditées ici
          this.profilId = data.profilId;
          this.projets = Array.isArray(data.projets) ? data.projets : [];
          if (!this.projets.length) {
            this.utilisateurService
              .getContributionsByUser(
                this.idUtilisateur,
                this.role || '',
                this.profilId
              )
              .subscribe({
                next: (projets) => (this.projets = projets || []),
                error: () => (this.projets = []),
              });
            if (this.role === 'CONTRIBUTEUR' && this.profilId) {
              this.utilisateurService
                .getBadgesByContributeur(this.profilId)
                .subscribe({
                  next: (data) => {
                    this.badges = data.map((b) => ({
                      nom: b.titreBadge,
                      imageUrl: this.badgeImages[b.titreBadge.trim()],
                    }));
                  },
                  error: (err) => {
                    console.error('Erreur chargement badges', err);
                    this.badges = [];
                  },
                });
            }
          }
        },
        error: (err) => console.error(err),
      });
  }

  modifierProfil(): void {}
  // Retrait de la mise à jour des préférences dans ce modal

  ouvrirEdition(): void {
    this.isEditOpen = true;
  }

  fermerEdition(): void {
    this.isEditOpen = false;
  }

  // Retiré: ajout/suppression de préférences dans ce composant

  enregistrerModifications(): void {
    // Mettre à jour les infos utilisateur selon le rôle
    const baseUser = {
      id: this.utilisateur.id,
      prenom: this.formEdit.prenom,
      nom: this.formEdit.nom,
      //email: this.formEdit.email,
      genre: this.toLongGenre(this.formEdit.genre || ''),
    } as any;

    const role = this.role;
    // Pour CONTRIBUTEUR et PORTEUR_PROJET, l'API attend l'ID du profil (pas l'ID utilisateur)
    const profilId =
      role === 'CONTRIBUTEUR' || role === 'PORTEUR_PROJET'
        ? this.profilId
        : this.idUtilisateur;

    if (!profilId) {
      alert('Identifiant du profil introuvable. Impossible de mettre à jour.');
      return;
    }

    let update$;
    if (role === 'CONTRIBUTEUR') {
      // Hypothèse: ContributeurDto contient un champ utilisateur
      const contributeurDto = { utilisateur: baseUser };
      update$ = this.utilisateurService.updateContributeur(
        profilId,
        contributeurDto
      );
    } else if (role === 'PORTEUR_PROJET') {
      // Le backend attend un Utilisateur
      update$ = this.utilisateurService.updatePorteurProjet(profilId, baseUser);
    } else {
      // Pour GESTIONNAIRE ou autres rôles non fournis, on n'implémente pas ici
      update$ = undefined;
    }

    if (update$) {
      update$.subscribe({
        next: () => {
          // Rafraîchir l'affichage des infos locales
          this.utilisateur = {
            ...this.utilisateur,
            ...baseUser,
          } as any;
          this.fermerEdition();
        },
        error: (err: any) => {
          console.error(
            'Erreur lors de la mise à jour du profil:',
            err?.error || err
          );
          alert(
            typeof err?.error === 'string'
              ? err.error
              : 'Echec de la mise à jour.'
          );
        },
      });
    }
  }

  private toShortGenre(backendValue?: string): string | undefined {
    if (!backendValue) return backendValue;
    switch ((backendValue || '').toUpperCase()) {
      case 'HOMME':
        return 'H';
      case 'FEMME':
        return 'F';
      default:
        return backendValue;
    }
  }

  private toLongGenre(short?: string): string {
    switch ((short || '').toUpperCase()) {
      case 'H':
        return 'HOMME';
      case 'F':
        return 'FEMME';
      default:
        return short || '';
    }
  }
  // ✅ Ajout de la propriété badges
}
