import React, {
    createContext,
    useState
} from 'react';

const UserContext = createContext();

const UserProvider = (props) => {
    const [usuarioLogado, setUsuarioLogado] = useState();

    return (
        <UserContext.Provider value={ { usuarioLogado, setUsuarioLogado } }>
            { props.children }
        </UserContext.Provider>
    );
}

export {UserProvider};

export default UserContext;