import type { Session, User } from "@supabase/supabase-js";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import { supabase } from "../lib/supabase";

type AuthContextType = {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadSession() {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();

            if (!isMounted) {
                return;
            }

            if (error) {
                console.error("Failed to load Supabase session:", error.message);
            }

            setSession(session);
            setIsLoading(false);
        }

        loadSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
            if (!isMounted) {
                return;
            }

            setSession(updatedSession);
            setIsLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
        }, []);

        return (
            <AuthContext.Provider
            value={{
                session, user: session?.user ?? null,
                isLoading,
            }}
            >
                {children}
            </AuthContext.Provider>
        );
    }

    export function useAuth() {
        const context = useContext(AuthContext);

        if (context === undefined) {
            throw new Error("useAuth must be used inside AuthProvider");
        }

        return context;
    }
