export const afficherSexe = (sexe: string) => {
    if (sexe) {
        return sexe === 'H' ? 'Homme' : 'Femme';
    } else {
        return 'N/A';
    }
};

export const afficherAge = (age: number, ageUnit: string) => {
    if (age === 0) {
        return 'N/A';
    }
    if (ageUnit === "ans") {
        return age + " ans";
    }
    return age + " mois";
}

export function extraireCode(designation: string): string {
    let designation_extrait = '';
    const codes = ['RX ', 'LAB ', 'MA ', 'MED ', 'CHR ', 'CO ', 'UPEC ', 'SP ', 'CA '];

    codes.forEach(item => {
        if(designation.indexOf(item) === 0) {
            designation_extrait =  designation.slice(item.length);
        } else if (designation.toUpperCase().indexOf('ECHO') === 0)  {
            designation_extrait = designation;
        }
    });

    if (designation_extrait === '') designation_extrait = designation;

    return designation_extrait.toUpperCase();
}

export function convertDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function convertDateLong(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export const styleEntete = {
    color: 'black',
    borderBottom: '1px dotted #000',
    letterSpacing: '1px',
    fontSize: 7
}