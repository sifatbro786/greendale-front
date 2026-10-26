/**
 * Renders CMS HTML. Phase 1: our own static strings. Phase 2: HTML is sanitised on the API
 * (sanitize-html allowlist) BEFORE it is saved, so the web app can render it as-is.
 */
export default function RichText({ html, className = "" }) {
    return <div className={`prose-school ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
