import { createEffect, createResource } from "solid-js";
import supabase from "../utils/supabaseClient.js";

// const {
//     data: { user },
// } = await supabase.auth.getUser();
// let metadata = user?.user_metadata;
// console.log(metadata);

export default function Name() {
    const [userSession, { mutate, refetch }] = createResource(
        async () => await supabase.auth.getSession()
    );

    return (
        <>
            <div>email: {userSession()?.data.session?.user.email}</div>
            <div>
                username:{" "}
                {userSession()?.data.session?.user.user_metadata.username}
            </div>
        </>
    );
}
