export const formaterNombre = (nombre) => {
    return nombre.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

export function extraireCode (designation) {
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

export function not(a, b) {
    return a.filter((value) => b.indexOf(value) === -1);
}
  
export function intersection(a, b) {
    return a.filter((value) => b.indexOf(value) !== -1);
}

export function union(a, b) {
    return [...a, ...not(b, a)];
}

// convert aaaa-mm-dd date to dd month yyyy
export const convertDate = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-GB', options);
};