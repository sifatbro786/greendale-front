/** Asia/Dhaka is UTC+6 all year (no DST), so the conversion is a fixed offset. */
const OFFSET_MS = 6 * 3600 * 1000;

/** ISO instant → "YYYY-MM-DDTHH:mm" in Dhaka for <input type="datetime-local"> */
export const toDhakaInput = (iso) => (iso ? new Date(new Date(iso).getTime() + OFFSET_MS).toISOString().slice(0, 16) : "");

/** "YYYY-MM-DDTHH:mm" (Dhaka wall clock) → ISO with +06:00 */
export const fromDhakaInput = (v) => (v ? `${v}:00+06:00` : null);

export const nowDhakaInput = () => toDhakaInput(new Date().toISOString());
