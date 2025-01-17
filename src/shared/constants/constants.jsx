const serverPath = 'http://serveur/hdmbanga/';
// const serverPath = 'http://localhost:8080/';

export const dnsPath = serverPath;

export const pathsOfUrls = {
    layoutNavBar: '/philmedical/compta/layoutnav/',
    comptable: 'comptable',
    editRubrique: 'editrubrique/:rubriqueId',
    editGrandGroupe: 'editgrandgroupe/:grandGroupeId',
    prescripteurs: 'prescripteurs',
    prescripteursManager: 'prescripteursmanager',
    detailsPrescriber: 'details/:id',
    prestataires: 'prestataires',
    signIn: 'signin',
    notFound: '*'
}