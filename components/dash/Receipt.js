import Image from "next/image";

import { school } from "@/config/school";
import { formatDateTime, formatMoney } from "@/lib/format";

/** Printable money receipt (same template the worker will render to PDF in Phase 2). */
export default function Receipt({ data }) {
    const { payment: p, student, lines, collectedBy } = data;
    return (
        <article className="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-6 sm:p-8 print:border-0 print:p-0">
            <header className="flex items-start gap-4 border-b-2 border-brand pb-4">
                <Image src={school.logo.crest} alt="" width={school.logo.width} height={school.logo.height} className="h-14 w-auto" />
                <div className="flex-1">
                    <p className="text-lg font-bold tracking-wide text-brand-deep">GREENDALE ENGLISH VERSION SCHOOL</p>
                    <p className="text-[13px] text-ink-soft">
                        {school.contact.addressShort} · {school.contact.phone} · EIIN {school.eiin}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[12px] font-semibold tracking-widest text-ink-soft uppercase">Money receipt</p>
                    <p className="font-semibold text-ink">{p.receiptNo}</p>
                </div>
            </header>
            {p.status === "REVERSED" && <p className="mt-4 rounded-xl bg-coral-soft px-4 py-2.5 text-[14px] font-medium text-[#b4432a]">Reversed: {p.reversalReason}</p>}
            <dl className="mt-5 grid grid-cols-2 gap-3 text-[14px] sm:grid-cols-4">
                <div>
                    <dt className="text-ink-soft">Student</dt>
                    <dd className="font-semibold">{student.name}</dd>
                </div>
                <div>
                    <dt className="text-ink-soft">ID</dt>
                    <dd className="font-semibold">{student.studentUid}</dd>
                </div>
                <div>
                    <dt className="text-ink-soft">Class · Roll</dt>
                    <dd className="font-semibold">
                        {student.section} · {student.roll}
                    </dd>
                </div>
                <div>
                    <dt className="text-ink-soft">Date</dt>
                    <dd className="font-semibold">{formatDateTime(p.paidAt)}</dd>
                </div>
            </dl>
            <table className="mt-6 w-full text-[14.5px]">
                <thead>
                    <tr className="border-b border-line text-left text-[12.5px] tracking-wide text-ink-soft uppercase">
                        <th className="py-2 font-semibold">Description</th>
                        <th className="py-2 text-right font-semibold">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {lines.map((l, i) => (
                        <tr key={i} className="border-b border-line">
                            <td className="py-2.5">
                                {l.head} <span className="text-ink-soft">· {l.period}</span>
                            </td>
                            <td className="py-2.5 text-right tabular-nums">{formatMoney(l.amount)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td className="py-3 font-semibold">Total paid ({p.method === "BKASH" ? "bKash" : p.method === "CARD" ? "Card" : "Cash"})</td>
                        <td className="py-3 text-right text-lg font-semibold tabular-nums">{formatMoney(p.amount)}</td>
                    </tr>
                </tbody>
            </table>
            {p.tranId && <p className="text-[13px] text-ink-soft">Gateway transaction: {p.tranId}</p>}
            <footer className="mt-10 flex items-end justify-between text-[12.5px] text-ink-soft">
                <span>Received by: {collectedBy}</span>
                <span className="border-t border-ink/30 pt-1">Authorised signature</span>
            </footer>
        </article>
    );
}
