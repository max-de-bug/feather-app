"use client";
import { jwtDecode } from "jwt-decode";
import { createContext, useReducer } from "react";
import { parseCookies, destroyCookie, setCookie } from "nookies";
const initialState = {
  user: null,
};
const cookies = parseCookies();

if (cookies.token) {
  const decodedToken = jwtDecode(cookies.token);
  if (decodedToken.exp * 1000 < Date.now) {
    destroyCookie(null, "token");
  } else {
    initialState.user = decodedToken;
  }
}
const AuthContext = createContext({
  user: null,
  login: (userData) => {},
  logout: () => {},
});

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
}

function AuthProvider(props) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = (userData) => {
    setCookie(null, "token", userData.token, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });
    dispatch({
      type: "LOGIN",
      payload: userData,
    });
  };
  const logout = () => {
    destroyCookie(null, "token");
    dispatch({ type: "LOGOUT" });
  };
  return (
    <AuthContext.Provider
      value={{ user: state.user, login, logout }}
      {...props}
    ></AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
