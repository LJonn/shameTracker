import { mergeProps } from "solid-js";

type SuccessMessageProps = {
    message?: string;
};

export default function SuccessMessage(props: SuccessMessageProps) {
    const merged = mergeProps({ message: "Success!" }, props);

    return <div class="rounded-md bg-green-200 p-2">{merged.message}</div>;
}
