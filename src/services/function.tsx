export const afficherSexe = (sexe: string) => {
    if (sexe) {
        return sexe === 'H' ? 'Homme' : 'Femme';
    } else {
        return 'N/A';
    }
};