import { PropsBotaoBarraFerramentas } from "@/types/biblia";

export default function BotaoBarraFerramentas({ onClick, active, label, children }: PropsBotaoBarraFerramentas) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            title={label}
            aria-pressed={active}
            className={`p-2.5 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                active 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "hover:bg-primary/5 text-muted-foreground"
            }`}
        >
            {children}
        </button>
    );
}