import { createSignal, createEffect, Show, createResource } from "solid-js";
import supabase from "../utils/supabaseClient.js";
import { AuthError } from "@supabase/supabase-js";

const [email, setEmail] = createSignal("");
const [password, setPassword] = createSignal("");
const [errorMsg, setErrorMsg] = createSignal("");
const [isLoading, setIsLoading] = createSignal(false);
const [loggedIn, setLoggedIn] = createSignal();
// const woot = createResource(async () => await supabase.auth.getUser())
// console.log(await supabase.auth.getUser());
// console.log(await supabase.auth.getSession());
const [loggedData, { mutate, refetch }] = createResource(
    async () => await supabase.auth.getUser()
);

const login = async (e: SubmitEvent) => {
    setIsLoading(true);
    e.preventDefault();
    try {
        if (await getIsRegisteredByEmail()) {
            await signIn();
        } else {
            await signUp();
        }
        refetch();
        setErrorMsg("");
    } catch (error) {
        if (error instanceof AuthError) {
            setErrorMsg(error.message);
        } else {
            setIsLoading(false);
            throw error;
        }
    }
    setIsLoading(false);
};

async function signUp() {
    const { error } = await supabase.auth.signUp({
        email: email(),
        password: password(),
    });
    if (error) {
        throw error;
    }
}

async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
        email: email(),
        password: password(),
    });
    if (error) {
        throw error;
    }
}

async function getIsRegisteredByEmail() {
    let { error } = await supabase.rpc("get_user_id_by_email", {
        user_email: email(),
    });

    if (error) throw error;
    else return true;
}

const Login = () => {
    createEffect(() => {
        if (loggedData()?.data.user) {
            // console.log(loggedData()?.data);
            location.assign("/test");
        }
    });
    return (
        <>
            <form
                onSubmit={login}
                class=" bg mx-auto flex max-w-md flex-col rounded-lg border border-slate-400 px-16 py-8 shadow-sm shadow-slate-400"
            >
                <div class="flex flex-col gap-4">
                    <label class="flex flex-col">
                        Enter e-mail:
                        <input
                            onInput={(e) => setEmail(e.target.value)}
                            class="rounded-lg bg-slate-200 px-2 py-1.5 shadow-sm shadow-slate-400 outline-none"
                            type="email"
                            autocomplete="email"
                        />
                    </label>
                    <label class="flex flex-col">
                        Enter password:
                        <input
                            onInput={(e) => setPassword(e.target.value)}
                            class="rounded-lg bg-slate-200 px-2 py-1.5 shadow-sm shadow-slate-400 outline-none"
                            type="password"
                            autocomplete="new-password"
                        />
                    </label>
                </div>
                <button
                    class="mt-8 w-32 self-center rounded-full bg-gray-900 py-2 text-white hover:bg-gray-950"
                    type="submit"
                >
                    <Show
                        when={isLoading()}
                        fallback={<span>SignUp/LogIn</span>}
                    >
                        <div class="grid grid-cols-3 place-items-center">
                            <span class="h-6 w-6 animate-spin rounded-full border-4 border-white border-r-transparent"></span>
                            <span>Loading...</span>
                        </div>
                    </Show>
                </button>
                <Show when={errorMsg() != ""}>
                    <div class="mt-8 border border-red-400 bg-red-100 px-4 py-3 text-red-700">
                        <p>{errorMsg()}</p>
                    </div>
                </Show>
            </form>
            <a
                class="mt-8 w-1/2 self-center rounded-full bg-gray-900 px-2 py-2 text-white hover:bg-gray-950"
                href="/test"
            >
                test
            </a>
        </>
    );
};

export default Login;
