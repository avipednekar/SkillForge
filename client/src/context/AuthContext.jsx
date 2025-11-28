import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api'; // Your axios instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            try {
                const { data } = await api.get('/auth/me');
                setUser(data.user);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUserLoggedIn();
    }, []);

    const login = async (formData) => {
        const { data } = await api.post('/auth/login', formData);
        // Assuming your login response returns the user object
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const register = async (formData) => {
        const { data } = await api.post('/auth/register', formData);
        setUser(data.user);
        return data;
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);