import supabase from "../utils/supabaseClient.js";
import { createSignal, createEffect, createResource } from "solid-js";

const Redirect = () => {
    const [userData, { mutate, refetch }] = createResource(
        async () => await supabase.auth.getUser()
    );
    createEffect(() => {
        if (userData()?.data.user == null && userData() != null) {
            location.assign("/login");
        }
    });
    return;
};

export default Redirect;
