import {
    Award, Bell, BookOpen, CalendarCheck, CalendarClock, ClipboardList, Globe, GraduationCap, HandCoins, History, House,
    IdCard, Layers, LayoutDashboard, Megaphone, MessageSquareText, ReceiptText, Settings, ShieldCheck, UserRound, Users, Wallet,
    TrendingUp, CircleAlert, Clock, UserPlus, Send, Printer,
} from "lucide-react";

/** Icon registry so server code can pass icon *names* (strings) to client components. */
export const ICONS = {
    Award, Bell, BookOpen, CalendarCheck, CalendarClock, ClipboardList, Globe, GraduationCap, HandCoins, History, House,
    IdCard, Layers, LayoutDashboard, Megaphone, MessageSquareText, ReceiptText, Settings, ShieldCheck, UserRound, Users, Wallet,
    TrendingUp, CircleAlert, Clock, UserPlus, Send, Printer,
};

export function Icon({ name, className = "size-4" }) {
    const C = ICONS[name];
    return C ? <C className={className} aria-hidden="true" /> : null;
}
