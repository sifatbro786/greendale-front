"use client";

import { useToast, DEMO_SAVED } from "./Toast";

/**
 * Button for write actions in the demo. Phase 2: replace onClick with the real API call
 * (lib/client/api.js) and keep the same toast on success.
 */
export default function DemoButton({ children, className = "btn-primary", message = DEMO_SAVED, title = "Looks good!", type = "button", ...rest }) {
    const toast = useToast();
    return (
        <button type={type} className={className} onClick={() => toast(message, { title, tone: "info" })} {...rest}>
            {children}
        </button>
    );
}
