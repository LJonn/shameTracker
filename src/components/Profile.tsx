import { Show, createSignal } from "solid-js";
import supabase from "../utils/supabaseClient.js";
import SuccessMessage from "./SuccessMessage.jsx";
import ProfileLogs from "./ProfileLogs.jsx";
import { refetchLogs } from "./ProfileLogs.jsx";

export default function Profile() {
    const [username, setUsername] = createSignal("");
    const [inputWeight, setInputWeight] = createSignal("");
    const [showSuccess, setShowSuccess] = createSignal(false);

    const fetchInputs = async () => {
        const userSession = await supabase.auth.getSession();
        const username =
            userSession.data.session?.user.user_metadata.username || "";
        setUsername(username);
        const { data, error } = await supabase
            .from("users_weight")
            .select("weight")
            .order("timestamp", { ascending: false })
            .limit(1);
        const weight = data?.[0]?.weight;
        setInputWeight(weight);
    };
    fetchInputs();

    async function submit() {
        const { data, error } = await supabase.auth.updateUser({
            data: { username: username() },
        });
        if (error) {
            throw error;
        }
        await supabase
            .from("users_weight")
            .insert([{ weight: inputWeight() }])
            .select();

        refetchLogs();
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);
    }

    return (
        <div class="flex flex-col items-center">
            <label>
                Username:
                <input
                    onInput={(e) => setUsername(e.target.value)}
                    value={username()}
                    id="username"
                    type="text"
                    class="block rounded-lg bg-slate-200 px-2 py-1.5 shadow-sm shadow-slate-400 outline-none"
                />
            </label>
            <label>
                Weight:
                <input
                    onInput={(e) => setInputWeight(e.target.value)}
                    value={inputWeight()}
                    id="weight"
                    type="number"
                    class="block rounded-lg bg-slate-200 px-2 py-1.5 shadow-sm shadow-slate-400 outline-none"
                />
            </label>

            <button
                class="m-8 w-32 self-center rounded-full bg-gray-900 py-2 text-white hover:bg-gray-950"
                onClick={submit}
            >
                Submit changes
            </button>
            <Show when={showSuccess()}>
                <SuccessMessage message="Profile updated!" />
            </Show>
            <ProfileLogs />
        </div>
    );
}
