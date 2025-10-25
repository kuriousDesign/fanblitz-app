import { getUser } from '@/actions/getActions';
import { useState, useEffect } from 'react';

interface User {
    // Define your user interface here
    id?: string | null | undefined;
    email?: string | null | undefined;
    name?: string | null | undefined;
    image?: string | null | undefined;
}

export const useGetUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getUser();
                setUser(userData);
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    const isLoggedIn = user !== null;

    return {
        user,
        isLoggedIn,
        isLoading
    };
};