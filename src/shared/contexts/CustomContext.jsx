import React , {createContext, useState} from 'react';

/*
    - Context pour gerer l'état du loader
*/

export const CustomContext = createContext();

const CustomProvider = (props) => {
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');
    const [heureDebut, setHeureDebut] = useState('');
    const [heureFin, setHeureFin] = useState('');
    const [grandGroupeData, setGrandGroupeData] = useState([]);
    const [rubriqueSelected, setRubriqueSelected] = useState('');


    const handleChangeRubrique = (e) => {
        setRubriqueSelected(e.target.value)
    }    

    const handleDateDebut = (e) => {
        setDateDebut(e.target.value)
    }

    const handleDateFin = (e) => {
        setDateFin(e.target.value)
    }

    const handleHeureDebut = (e) => {
        setHeureDebut(e.target.value)
    }

    const handleHeureFin = (e) => {
        setHeureFin(e.target.value)
    }

    const handleGrandGroupeData = (data) => {
        setGrandGroupeData(data)
    }
    
    return (
        <CustomContext.Provider value={{dateDebut, handleDateDebut, dateFin, handleDateFin, heureDebut, handleHeureDebut, heureFin, handleHeureFin, grandGroupeData, handleGrandGroupeData, rubriqueSelected, handleChangeRubrique}}>
            {props.children}
        </CustomContext.Provider>
    )
}

export default CustomProvider;