import { createEffect, createResource } from "solid-js";
import supabase from "../utils/supabaseClient.js";

const Name = () => {
    const [email, { mutate, refetch }] = createResource(
        async () => await supabase.auth.getSession()
    );

    return <>{email()?.data.session?.user.email}</>;
};

export default Name;
