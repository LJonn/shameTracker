import {
    Show,
    createEffect,
    createSignal,
    onCleanup,
    For,
    createResource,
} from "solid-js";
import supabase from "../../utils/supabaseClient.js";
import SuccessMessage from "../SuccessMessage.jsx";
import type { ExerciseType } from "../../utils/ExerciseType";

type ExerciseProps = {
    title: string;
    exercise: ExerciseType;
};

export default function Exercise(props: ExerciseProps) {
    const [running, setRunning] = createSignal(false);
    const [timeStart, setTimeStart] = createSignal(now());
    const [currentTime, setCurrentTime] = createSignal(now());
    const [showSuccess, setShowSuccess] = createSignal(false);
    const [extraWeight, setExtraWeight] = createSignal(0);
    // const [, setExercisesLog] = createSignal([]);
    const [exercisesLog, { refetch: refetchResource }] =
        createResource(showExerciseLogs);

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
                    exercise_id: props.exercise,
                },
            ])
            .select();
        if (error) {
            throw error;
        }
        refetchResource();
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);
    };

    async function showExerciseLogs() {
        const userId = (await supabase.auth.getSession()).data.session?.user.id
        console.log(userId)
        let { data: exercises, error } = await supabase
            .from("exercises")
            .select(
                "exercise, exercises_log(id, user_id, started_at, reps, extra_weight, ended_at, exercise_id)"
            )
            .eq("id", props.exercise)
            .eq("user_id", userId)
            .limit(10, { foreignTable: "exercises_log" });
        if (error) {
            throw error;
        }
        return exercises;
    }

    async function deleteExerciseLog(id: number) {
        let { error } = await supabase
            .from("exercises_log")
            .delete()
            .eq("id", id);
        if (error) {
            throw error;
        }
        refetchResource();
    }

    return (
        <>
            <h2 class="font-bold">{props.title}</h2>
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

            <For
                each={exercisesLog()?.[0].exercises_log}
                fallback={<div>Loading...</div>}
            >
                {(item) => (
                    <div>
                        <span class="m-2">reps: {item.reps}</span>
                        <span class="m-2">weight: {item.extra_weight}</span>
                        <span class="m-2">
                            time:{" "}
                            {(new Date(item.ended_at).valueOf() -
                                new Date(item.started_at).valueOf()) /
                                1000}
                        </span>
                        <button
                            class="mx-4"
                            onClick={() => deleteExerciseLog(item.id)}
                        >
                            X
                        </button>
                    </div>
                )}
            </For>
        </>
    );
}
