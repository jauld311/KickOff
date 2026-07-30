import { supabase } from "../lib/supabase";

export async function getCurrentProfile() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not found");
    }

    const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

    if (error) {
        throw error;
    }

    return {
        profile: data,
        email: user.email ?? "",
    };
}