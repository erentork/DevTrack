import { useRef, useState } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
    onCreate: (name: string, description: string) => Promise<void>;
};

export default function CreateProjectModal({
    open,
    onClose,
    onCreate,
}: Props) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    if (!open) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (isSubmittingRef.current) {
            return;
        }

        isSubmittingRef.current = true;
        setIsSubmitting(true);

        try {
            await onCreate(name.trim(), description.trim());

            setName("");
            setDescription("");

            onClose();
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl"
            >

                <h2 className="mb-6 text-2xl font-bold">
                    Create Project
                </h2>

                <div className="mb-5">

                    <label>Name</label>

                    <input
                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSubmitting}
                        required
                    />

                </div>

                <div>

                    <label>Description</label>

                    <textarea
                        rows={4}
                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting}
                    />

                </div>

                <div className="mt-8 flex justify-end gap-3">

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-lg border border-slate-700 px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting || !name.trim()}
                        className="rounded-lg bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "Creating..." : "Create"}
                    </button>

                </div>

            </form>

        </div>
    );
}