import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";


type AuthPorvider = {
  children: ReactNode;
}

type User = {
  id: string;
  name: string;
  login: string;
  avatar_url:string;
}

type AuthContextData = {
  user: User | null;
  signInUrl: string;
}

type AuthResponse = {
  token: string,
  user:{
    id:string,
    name:string;
    avatar_url:string,
    login: string
  }
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider(props: AuthPorvider)
{
  const [user, setUser] = useState<User | null>(null);

  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=b43abd59a9de85155a23`;

  async function signIn(githubCode: string){
    const response = await api.post<AuthResponse>('authenticate', {
      code:githubCode,
    });

    const {token, user} = response.data;

    localStorage.setItem('@dowile:token', token);
    setUser(user);
  }
  
  useEffect(()=>{
    const url = window.location.href;
    const hasGithubCode = url.includes('?code='); 
    
    if(hasGithubCode){
      const [urlWithoutCode, githubCode] = url.split('?code=');

      //console.log({urlWithoutCode, githubCode});

      window.history.pushState({}, '', urlWithoutCode );

      signIn(githubCode);
    }
  })

  return(
    <AuthContext.Provider value={{signInUrl, user}}> 
      {props.children}
    </AuthContext.Provider>
  );
}