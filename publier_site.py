"""Publie le site JawadProjet sur le dépôt GitHub Pages.

Aucun Git n'est nécessaire : le script utilise l'API GitHub.
Il compare les fichiers locaux au dépôt et n'envoie que ceux qui ont changé.

Utilisation :
    python publier_site.py

Un Personal Access Token avec le droit « Contents: write » sur le dépôt
JAWADSOSMAJED/chantierpro est demandé (ou lu depuis GITHUB_TOKEN).
Le token n'est jamais écrit dans un fichier ni affiché.

Il est possible de cibler un autre dépôt :
    python publier_site.py JAWADSOSMAJED/autre-depot
"""

import base64
import getpass
import hashlib
import os
import pathlib
import sys
from urllib.parse import quote

import requests

REPO = "JAWADSOSMAJED/chantierpro"
BRANCHE = "main"
SITE = "https://jawadsosmajed.github.io/chantierpro/"
if len(sys.argv) > 1:
    REPO = sys.argv[1]
    SITE = "https://jawadsosmajed.github.io/" + REPO.split("/")[-1] + "/"
DOSSIER = pathlib.Path(__file__).resolve().parent
EXCLUS = {"publier_site.py", "site-a-publier.zip", "MISE_A_JOUR_GITHUB.md", "JawadProjet.apk"}
DOSSIERS_EXCLUS = {"android", "__pycache__", ".git"}


def sha_git(donnees):
    """Empreinte au format utilisé par Git/GitHub pour un fichier."""
    return hashlib.sha1(
        b"blob " + str(len(donnees)).encode("ascii") + b"\0" + donnees
    ).hexdigest()


def main():
    jeton = os.environ.get("GITHUB_TOKEN") or getpass.getpass(
        "Token GitHub (droit Contents: write) : ")
    if not jeton.strip():
        sys.exit("Token vide : publication annulée.")
    entetes = {
        "Authorization": "Bearer " + jeton.strip(),
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    api = "https://api.github.com/repos/" + REPO

    reponse = requests.get(
        api + "/git/trees/" + BRANCHE + "?recursive=1",
        headers=entetes, timeout=30)
    if reponse.status_code != 200:
        sys.exit(f"Lecture du dépôt impossible ({reponse.status_code}) : "
                 f"{reponse.text[:300]}")
    distants = {
        element["path"]: element["sha"]
        for element in reponse.json().get("tree", [])
        if element.get("type") == "blob"
    }

    fichiers = []
    for chemin in DOSSIER.rglob("*"):
        if not chemin.is_file():
            continue
        relatif = chemin.relative_to(DOSSIER).as_posix()
        if relatif in EXCLUS or set(chemin.relative_to(DOSSIER).parts) & DOSSIERS_EXCLUS:
            continue
        fichiers.append((relatif, chemin))

    envoyer = 0
    for relatif, chemin in sorted(fichiers):
        donnees = chemin.read_bytes()
        sha = sha_git(donnees)
        if distants.get(relatif) == sha:
            print("  =  " + relatif + " (inchangé)")
            continue
        charge = {
            "message": "Mise à jour du site : " + relatif,
            "content": base64.b64encode(donnees).decode("ascii"),
            "branch": BRANCHE,
        }
        if relatif in distants:
            charge["sha"] = distants[relatif]
        reponse = requests.put(
            api + "/contents/" + quote(relatif),
            headers=entetes, json=charge, timeout=120)
        if reponse.status_code not in (200, 201):
            print("  X  " + relatif + f" — erreur {reponse.status_code}")
            print(reponse.text[:300])
            continue
        envoyer += 1
        print("  +  " + relatif)

    print(f"\n{envoyer} fichier(s) envoyé(s).")
    print("Site : " + SITE)


if __name__ == "__main__":
    main()
