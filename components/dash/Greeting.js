"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};
const greet = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

/** Time-of-day greeting from the visitor's own clock (keeps the server render time-independent). */
export default function Greeting({ name }) {
    const text = useSyncExternalStore(noop, greet, () => "Welcome");
    return (
        <>
            {text}, {name}
        </>
    );
}
