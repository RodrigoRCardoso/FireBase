import React, {
  useContext,
  useEffect,
  useState
} from 'react';

import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import auth from '@react-native-firebase/auth';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import UserContext, { UserProvider } from './UserContext';

const Stack = createStackNavigator();

const Login = (props) => {
  const { setUsuarioLogado } = useContext(UserContext);

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const [phonenumber, setPhonenumber] = useState('');
  const [isPhone, setIsPhone] = useState(false);
  const [confirm, setConfirm] = useState();
  const [code, setCode] = useState('');

  const cleanState = () => {
    setUsuario('');
    setSenha('');
    setPhonenumber('');
    setIsPhone(false);
    setConfirm(null);
    setCode('');
  }

  useEffect(() => {
    auth().onAuthStateChanged((user) => {
      setUsuarioLogado(user);
      if ( user?.uid?.trim().length > 0 ) {
        cleanState();
        props.navigation.navigate('AreaRestrita');
      }
    })
  });

  const handleLogin = () => {
    if ( usuario.trim().length === 0 || senha.length === 0) {
      alert('Informe os dados corretamente!');
      return;
    }

    auth()
      .signInWithEmailAndPassword(usuario, senha)
      .then(() => {
        setUsuario('');
        setSenha('');
      })
      .catch((error) => {
        alert('Não foi possível autenticar. Verifique usuário e senha!');
      })
  }

  const handlePhoneLogin = async () => {

    if ( phonenumber.trim().length == 0 ) {
      alert('Informe corretamente o número do celular!');
      return;
    }

    let confirmation = await auth().signInWithPhoneNumber(phonenumber);
    setConfirm(confirmation);
  }

  const handleConfirm = async () => {
    try {
      if ( code.trim().length < 6 ) {
        alert('Informe o código corretamente!');
        return;
      }

      await confirm.confirm(code);
    } catch ( e ) {
      alert('Código de confirmação inválido!');
    }
  }

  return (
    <SafeAreaView style={ styles.container }>
      
      { ! isPhone && (
        <>
          <TextInput
            onChangeText={ (txt) => setUsuario(txt) }
            placeholder="Digite seu e-mail:"
            style={ styles.input }
            value={ usuario } />

          <TextInput 
            onChangeText={ (txt) => setSenha(txt) }
            placeholder="Digite sua senha:"
            secureTextEntry
            style={ styles.input }
            value={ senha } />

          <Button 
            onPress={ () => handleLogin() }
            title="Login"/>
        </>
      )}

      { isPhone && (
        <>
          { ! confirm && (
            <>
              <TextInput
                onChangeText={ (txt) => setPhonenumber(txt) } 
                placeholder="Informe seu celular:"
                style={ styles.input }
                value={ phonenumber } />

              <Button 
                onPress={ () => handlePhoneLogin() }
                title="Enviar SMS" />
            </>
          )}

          { confirm && (
            <>
              <TextInput
                onChangeText={ (txt) => setCode(txt) }
                placeholder="Digite o código de confirmação:"
                style={ styles.input }
                value={ code } />

              <Button 
                onPress={ () => handleConfirm() }
                title="Confirmar"/>
            </>
          )}
        </>
      )}

      <TouchableOpacity
        onPress={ () => setIsPhone( ! isPhone ) }
        style={ styles.linkCenter }>
        <Text>Faça login usando seu { isPhone ? 'e-mail' : 'celular'}</Text>
      </TouchableOpacity>
      

      <TouchableOpacity
        onPress={ () => props.navigation.navigate('Cadastro') }
        style={ styles.linkCenter }>
        <Text>Cadastre-se</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const Cadastro = (props) => {
  const { setUsuarioLogado } = useContext(UserContext);

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  useEffect(() => {
    auth().onAuthStateChanged((user) => {
      setUsuarioLogado(user);
      if ( user ) {
        props.navigation.navigate('AreaRestrita');
      }
    });
  }, []);

  const validarForm = () => {
    if ( usuario.trim().length === 0 ) {
      alert('Informe corretamente o usuário!');
      return false;
    }

    if ( senha.length === 0 ) {
      alert('Informe corretamente a senha!');
      return false;
    }

    if ( senha !== confirmarSenha ) {
      alert('Senhas não conferem!');
      return false;
    }

    return true;
  }

  const handleCadastro = () => {
    if ( validarForm() ) {
      auth().createUserWithEmailAndPassword(usuario, senha)
                .then(() => {
                  alert('Cadastro realizado com sucesso!');
                })
                .catch((error) => {
                  if (error.code === 'auth/email-already-in-use') {
                    alert('E-mail já cadastrado!');
                  }
              
                  if (error.code === 'auth/invalid-email') {
                    alert('E-mail inválido!');
                  }
                });
    }
  }

  return (
    <SafeAreaView style={ styles.container }>
      <TextInput 
        onChangeText={ (txt) => setUsuario(txt) }
        placeholder="Digite seu e-mail:"
        style={ styles.input }
        value={ usuario } />

      <TextInput 
        onChangeText={ (txt) => setSenha(txt) }
        placeholder="Digite sua senha:"
        secureTextEntry
        style={ styles.input }
        value={ senha } />

      <TextInput 
        onChangeText={ (txt) => setConfirmarSenha(txt) }
        placeholder="Confirme sua senha:"
        secureTextEntry
        style={ styles.input }
        value={ confirmarSenha } />

      <Button 
        onPress={ () => handleCadastro() }
        title="Salvar"/>
    </SafeAreaView>
  );
}

const AreaRestrita = (props) => {

  const { usuarioLogado, setUsuarioLogado } = useContext(UserContext);

  useEffect(() => {
    auth().onAuthStateChanged((user) => {
      setUsuarioLogado(user);
    });
  }, []);

  if ( ! usuarioLogado ) {
    props.navigation.navigate('Login');
    return null;
  }

  return (
    <SafeAreaView style={ styles.container }>
      <Text>
        Olá { 
          usuarioLogado.email 
            ?? usuarioLogado.phoneNumber 
            ?? 'usuário' 
        }
      </Text>

      <Button 
        onPress={ () => auth().signOut() }
        title="Sair" />
    </SafeAreaView>
  );
}

const App = (props) => {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen component={ Login } name="Login" />
          <Stack.Screen component={ Cadastro } name="Cadastro" />
          <Stack.Screen component={ AreaRestrita } name="AreaRestrita" />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

export default App;

const styles = StyleSheet.create({
  container : {
    flex : 1,
    padding : 16
  },
  input : {
    borderColor : '#CCC',
    borderWidth : 1,
    marginBottom : 8,
    paddingHorizontal : 8    
  },
  linkCenter : {
    alignItems : 'center',
    marginTop : 8
  }
});