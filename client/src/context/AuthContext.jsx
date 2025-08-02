import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/apiService';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const setAuthTokenInStorage = (token) => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    };

    const loadUser = useCallback(async () => {
        if (localStorage.getItem('token')) {
            try {
                const res = await authService.loadUser();
                setUser(res.data);
                setIsAuthenticated(true);
            } catch (err) {
                setAuthTokenInStorage(null);
                setIsAuthenticated(false);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = async (email, password) => {
        const res = await authService.login({ email, password });
        setAuthTokenInStorage(res.data.token);
        await loadUser();
    };
    const register = async (userData) => {
        return authService.register(userData);
    };

    const logout = () => {
        setAuthTokenInStorage(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        loadUser,
        setLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};