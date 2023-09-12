import { For, createResource } from "solid-js";
import supabase from "../utils/supabaseClient.js";

async function fetchProfileData() {
    let { data, error } = await supabase
        .from("users_weight")
        .select("id, user_id, timestamp, weight");
    if (error) {
        throw error;
    }
    return data;
}
const [profileLogs, { refetch: refetchLogs }] =
    createResource(fetchProfileData);
async function deleteLog(profileId: string) {
    const { error } = await supabase
        .from("users_weight")
        .delete()
        .eq("id", profileId);
    if (error) {
        throw error;
    }
    refetchLogs();
}

export { refetchLogs };
export default function ProfileLogs() {
    return (
        <div>
            <table class="table-auto">
                <thead>
                    <tr class="bg-gray-300">
                        <th class="border border-gray-400 p-1">
                            date and time
                        </th>
                        <th class="border border-gray-400 p-1">weight (kg)</th>
                        <th class="border border-gray-400 p-1"> delete</th>
                    </tr>
                </thead>
                <tbody>
                    <For each={profileLogs()}>
                        {(profile, i) => {
                            const date = new Date(profile.timestamp);
                            return (
                                <tr
                                    class={
                                        i() % 2 === 0
                                            ? "bg-gray-100"
                                            : "bg-gray-200"
                                    }
                                >
                                    <td class="border border-gray-400 p-1">
                                        {date.toLocaleDateString("lt")} &nbsp;
                                        {date.toLocaleTimeString("lt")}
                                    </td>
                                    <td class="border border-gray-400 p-1">
                                        {profile.weight}
                                    </td>
                                    <td class="border border-gray-400 p-1">
                                        <button
                                            class="w-full text-lg text-red-600"
                                            onClick={() =>
                                                deleteLog(profile.id)
                                            }
                                        >
                                            X
                                        </button>
                                    </td>
                                </tr>
                            );
                        }}
                    </For>
                </tbody>
            </table>
        </div>
    );
}
