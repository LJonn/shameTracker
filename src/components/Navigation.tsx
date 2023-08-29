import { Show } from "solid-js";
import supabase from "../utils/supabaseClient.js";

export default function Navigation() {
    const logOut = async () => {
        await supabase.auth.signOut();
        location.assign("/login");
    };
    return (
        <Show when={true}>
            <nav class="w-full bg-slate-200">
                <ul class="flex flex-row justify-end gap-4 p-4">
                    <li
                        class="cursor-pointer rounded-lg bg-slate-400 p-2"
                        onClick={() => location.assign("/exercises")}
                    >
                        Exercises
                    </li>
                    <li
                        class="cursor-pointer rounded-lg bg-slate-400 p-2"
                        onClick={() => location.assign("/profile")}
                    >
                        Profile
                    </li>
                    <li
                        class="cursor-pointer rounded-lg bg-slate-400 p-2"
                        onClick={logOut}
                    >
                        SignOut
                    </li>
                </ul>
            </nav>
        </Show>
    );
}
