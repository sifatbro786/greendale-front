"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api/client";

import { DEMO_SAVED, useToast } from "../Toast";

/**
 * Create / update / delete / reorder for a flat CMS collection, with the editor modal state.
 * @param {{ base: string, items: any[], demo?: boolean, noun: string }} opts  base e.g. "/api/cms/videos"
 */
export function useCollection({ base, items, demo = false, noun }) {
    const router = useRouter();
    const toast = useToast();
    const [list, setList] = useState(items);
    const [editing, setEditing] = useState(null); // null | "new" | item
    const [removing, setRemoving] = useState(null);
    const [state, setState] = useState({ busy: false, error: "", fieldErrors: {} });

    const close = () => {
        setEditing(null);
        setState({ busy: false, error: "", fieldErrors: {} });
    };

    async function save(body) {
        if (demo) return (close(), toast(DEMO_SAVED, { title: `${noun} saved`, tone: "info" }));
        setState({ busy: true, error: "", fieldErrors: {} });
        const isNew = editing === "new";
        const r = await api(isNew ? base : `${base}/${editing.id}`, { method: isNew ? "POST" : "PATCH", body });
        if (!r.ok) {
            const hasFields = Object.keys(r.fieldErrors).length > 0;
            return setState({ busy: false, error: hasFields ? "Please check the highlighted fields." : r.error.message, fieldErrors: r.fieldErrors });
        }
        close();
        toast("The website updates within a few seconds.", { title: `${noun} saved` });
        router.refresh();
    }

    async function remove() {
        const item = removing;
        setRemoving(null);
        if (demo) return toast(DEMO_SAVED, { title: `${noun} deleted`, tone: "info" });
        const r = await api(`${base}/${item.id}`, { method: "DELETE" });
        if (!r.ok) return toast(r.error.message, { title: "Not deleted", tone: "error" });
        setList((l) => l.filter((x) => x.id !== item.id));
        toast(`“${item.title}” was deleted.`, { title: `${noun} deleted` });
        router.refresh();
    }

    async function move(idx, dir) {
        const next = [...list];
        const j = idx + dir;
        if (j < 0 || j >= next.length) return;
        [next[idx], next[j]] = [next[j], next[idx]];
        setList(next);
        if (demo) return;
        const r = await api(`${base}/order`, { method: "PUT", body: { ids: next.map((x) => x.id) } });
        if (!r.ok) toast(r.error.message, { title: "Order not saved", tone: "error" });
    }

    return { list, setList, editing, setEditing, removing, setRemoving, state, save, remove, move, close };
}
