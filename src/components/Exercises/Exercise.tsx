import {
    Show,
    createEffect,
    createSignal,
    onCleanup,
    For,
    createResource,
    mergeProps,
} from "solid-js";
import supabase from "../../utils/supabaseClient.js";
import SuccessMessage from "../SuccessMessage.jsx";
import ScreenDimController from "../../utils/ScreenDimController";
import type { ExerciseType } from "../../utils/ExerciseType";

type ExerciseProps = {
    title: string;
    exercise: ExerciseType;
    timer?: boolean;
    reps?: boolean;
};

export default function Exercise(props: ExerciseProps) {
    const mergedProps = mergeProps(
        { title: "Title", exercise: "Exercise", timer: true, reps: true },
        props
    );
    const [running, setRunning] = createSignal(false);
    const [timeStart, setTimeStart] = createSignal(now());
    const [currentTime, setCurrentTime] = createSignal(now());
    const [showSuccess, setShowSuccess] = createSignal(false);
    const [extraWeight, setExtraWeight] = createSignal(0);
    const [timerStarted, setTimerStarted] = createSignal(false);
    const [deleteMode, setDeleteMode] = createSignal(false);
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

    const startTimer = async () => {
        setRunning(true);
        setCurrentTime(now());
        setTimeStart(now());
        setTimerStarted(true);
        ScreenDimController.disableScreenDim();
    };

    const stopTimer = () => {
        setRunning(false);
        setTimerStarted(false);
        ScreenDimController.enableScreenDim();
    };

    const submit = async () => {
        let presentTime;
        if (!mergedProps.timer) {
            presentTime = new Date();
        }
        const { data, error } = await supabase
            .from("exercises_log")
            .insert([
                {
                    user_id: (
                        await supabase.auth.getSession()
                    ).data.session?.user.id,
                    started_at: mergedProps.timer
                        ? new Date(timeStart())
                        : presentTime,
                    ended_at: mergedProps.timer
                        ? new Date(currentTime())
                        : presentTime,
                    reps: mergedProps.reps ? reps() : 1,
                    extra_weight: extraWeight(),
                    exercise_id: mergedProps.exercise,
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
        const userId = (await supabase.auth.getSession()).data.session?.user.id;
        let { data: exercises, error } = await supabase
            .from("exercises")
            .select(
                "exercise, exercises_log(id, user_id, started_at, reps, extra_weight, ended_at, exercise_id)"
            )
            .eq("id", mergedProps.exercise)
            .eq("exercises_log.user_id", userId)
            .order("started_at", {
                foreignTable: "exercises_log",
                ascending: false,
            })
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
            <h2 class="font-bold">{mergedProps.title}</h2>

            <Show when={mergedProps.timer}>
                <div class="">
                    <Show
                        when={timerStarted()}
                        fallback={
                            <button
                                class="my-2 w-full rounded-lg bg-green-300 p-4"
                                onClick={startTimer}
                            >
                                Start
                            </button>
                        }
                    >
                        <button
                            class="my-2 w-full rounded-lg bg-red-300 p-4"
                            onClick={stopTimer}
                        >
                            End
                        </button>
                    </Show>
                    <div class="w-full rounded-lg bg-slate-200 p-2 text-center text-3xl">
                        {getMinutes(currentTime() - timeStart())
                            .toString()
                            .padStart(2, "0")}{" "}
                        :&nbsp;
                        {getSeconds(currentTime() - timeStart())
                            .toString()
                            .padStart(2, "0")}{" "}
                        :&nbsp;
                        {getDiv100Seconds(currentTime() - timeStart())
                            .toString()
                            .padStart(2, "0")}{" "}
                    </div>
                </div>
            </Show>
            <Show when={mergedProps.reps}>
                <label class="flex w-32 flex-col">
                    Reps:
                    <input
                        onInput={(e) => setReps(Number(e.target.value))}
                        class="rounded-lg bg-slate-200 px-2 py-1.5 shadow-sm shadow-slate-400 outline-none"
                        type="number"
                        autocomplete="reps"
                        value={reps()}
                    />
                </label>
            </Show>

            <label class="flex w-32 flex-col">
                Extra weight:
                <input
                    onInput={(e) => setExtraWeight(Number(e.target.value))}
                    class="rounded-lg bg-slate-200 px-2 py-1.5 shadow-sm shadow-slate-400 outline-none"
                    type="number"
                    autocomplete="weight"
                    value={extraWeight()}
                />
            </label>

            <button
                class="mt-8 w-32 self-center rounded-full bg-gray-900 py-2 text-white hover:bg-gray-950"
                onClick={submit}
            >
                Submit
            </button>

            <input
                class="invisible"
                type="checkbox"
                onChange={(e) => setDeleteMode(e.target.checked)}
                id={mergedProps.exercise.toString()}
            >
                DeleteMode
            </input>
            <label
                class={
                    deleteMode()
                        ? "inline-block w-32 cursor-pointer rounded-full bg-red-700 py-2 text-center text-white"
                        : "inline-block w-32 cursor-pointer rounded-full bg-gray-300 py-2 text-center"
                }
                for={mergedProps.exercise.toString()}
            >
                DeleteMode
            </label>

            <Show when={showSuccess()}>
                <SuccessMessage message="Reps recorded, shame decreased!" />
            </Show>

            <div class="grid grid-cols-4">
                <span class="tebold">Reps (N)</span>
                <span>Weight (kg)</span>
                <span>Time (s)</span>
                <span>Delete</span>
                <For
                    each={exercisesLog()?.[0].exercises_log}
                    fallback={
                        <Show when={exercisesLog() == undefined}>
                            <div>Loading...</div>
                        </Show>
                    }
                >
                    {(item) => (
                        <>
                            <span class="border border-gray-700">
                                {item.reps}
                            </span>
                            <span class="border border-gray-700">
                                {item.extra_weight}
                            </span>
                            <span class="border border-gray-700">
                                {" "}
                                {(new Date(item.ended_at).valueOf() -
                                    new Date(item.started_at).valueOf()) /
                                    1000}
                            </span>
                            <div class="border border-gray-700 text-center">
                                <button
                                    class={
                                        deleteMode()
                                            ? "w-full text-red-600"
                                            : "invisible"
                                    }
                                    onClick={() => deleteExerciseLog(item.id)}
                                >
                                    X
                                </button>
                            </div>
                        </>
                    )}
                </For>
            </div>
        </>
    );
}
