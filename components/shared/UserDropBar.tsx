import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function UserDropBar({
    userName,
    actions = [] }: {
        userName: string | React.ReactNode;
        actions?: {
            label: string;
            onClick?: () => void;
            Icon?: React.ComponentType<{ className?: string }>;
        }[]
    }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                {userName}
            </PopoverTrigger>
            <PopoverContent className="w-full mt-2 shadow-white bg-dashboard-foreground border px-2 py-2">
                <div className="">
                    {
                        actions.map(({
                            label,
                            onClick,
                            Icon
                        }, index) => (
                            <div key={index} onClick={() => onClick && onClick()} className="flex cursor-pointer px-4 hover:bg-primary/30 bg-dashboard-foreground justify-start items-center gap-4  py-1 rounded-xl select-none">
                                {
                                    Icon && <Icon className="h45 w-4 text-muted-foreground" />
                                }
                                <p className="text-muted-foreground text-sm leading-2">{label}</p>
                            </div>
                        ))
                    }
                </div>
            </PopoverContent>
        </Popover>
    )
}
