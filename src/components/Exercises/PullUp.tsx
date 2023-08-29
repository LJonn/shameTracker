import { Show, createEffect, createSignal, onCleanup } from "solid-js";
import supabase from "../../utils/supabaseClient.js";
import SuccessMessage from "../SuccessMessage.jsx";

export default function PullUp() {
    const [running, setRunning] = createSignal(false);
    const [timeStart, setTimeStart] = createSignal(now());
    const [currentTime, setCurrentTime] = createSignal(now());
    const [showSuccess, setShowSuccess] = createSignal(false);
    const [extraWeight, setExtraWeight] = createSignal(0);

    const [reps, setReps] = createSignal(0);
    function now() {
        return Date.now();
    }

    function getDiv100Seconds(ms: number) {
        return Math.floor((ms % 1000) / 10);
    }
    function getSeconds(ms: number) {
        return Math.floor(ms / 1000) % 60;
    }
    function getMinutes(ms: number) {
        return Math.floor(ms / 1000 / 60);
    }
    createEffect(() => {
        let iid: NodeJS.Timeout;
        if (running()) {
            iid = setInterval(() => {
                setCurrentTime(now());
            }, 10);
        }
        onCleanup(() => {
            if (iid) {
                clearInterval(iid);
            }
        });
    });

    const startTimer = () => {
        setRunning(true);
        setCurrentTime(now());
        setTimeStart(now());
    };

    const stopTimer = () => {
        setRunning(false);
    };

    const submit = async () => {
        const { data, error } = await supabase
            .from("exercises_log")
            .insert([
                {
                    user_id: (
                        await supabase.auth.getSession()
                    ).data.session?.user.id,
                    started_at: new Date(timeStart()),
                    ended_at: new Date(currentTime()),
                    reps: reps(),
                    extra_weight: extraWeight(),
                    exercise_id: 1,
                },
            ])
            .select();
        if (error) {
            throw error;
        }
        console.log(data);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);
    };
    return (
        <div>
            <h2>Pull Up! My favorite!</h2>
            <button
                class="m-4 rounded-lg bg-slate-200 p-4"
                onClick={startTimer}
            >
                Start
            </button>
            <span class="m-2 bg-slate-200 p-1">
                {getMinutes(currentTime() - timeStart())}
            </span>
            <span class="m-2 bg-slate-200 p-1">
                {getSeconds(currentTime() - timeStart())}
            </span>
            <span class="m-2 bg-slate-200 p-1">
                {getDiv100Seconds(currentTime() - timeStart())}
            </span>
            <button class="m-4 rounded-lg bg-slate-200 p-4" onClick={stopTimer}>
                End
            </button>

            <label class="flex w-32 flex-col">
                Reps:
                <input
                    onInput={(e) => setReps(Number(e.target.value))}
                    class="rounded-lg bg-slate-200 px-2 py-1.5 shadow-sm shadow-slate-400 outline-none"
                    type="number"
                    autocomplete="reps"
                />
            </label>

            <label class="flex w-32 flex-col">
                Extra weight:
                <input
                    onInput={(e) => setExtraWeight(Number(e.target.value))}
                    class="rounded-lg bg-slate-200 px-2 py-1.5 shadow-sm shadow-slate-400 outline-none"
                    type="number"
                    autocomplete="weight"
                />
            </label>

            <button
                class="mt-8 w-32 self-center rounded-full bg-gray-900 py-2 text-white hover:bg-gray-950"
                onClick={submit}
            >
                Submit
            </button>
            <Show when={showSuccess()}>
                <SuccessMessage message="Reps recorded, shame decreased!" />
            </Show>
        </div>
    );
}
