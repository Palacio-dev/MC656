import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Hook customizado para gerenciar o estado de autenticação do Firebase
 * Escuta mudanças no estado de autenticação e retorna o usuário atual
 */
export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listener para mudanças no estado de autenticação
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
            
            if (user) {
                console.log('Usuário autenticado:', user.uid, user.email);
            } else {
                console.log('Nenhum usuário autenticado');
            }
        });

        // Cleanup: remove o listener quando o componente desmontar
        return () => unsubscribe();
    }, []);

    return {
        currentUser,
        loading,
        isAuthenticated: !!currentUser,
        userId: currentUser?.uid || null
    };
};
