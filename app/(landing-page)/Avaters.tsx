import Image from "next/image"
import { Plus } from "lucide-react"

export default function AvatarGroup({ avatars, title, addButton }: { avatars: { id: string | number; src: string; alt?: string, name?: string }[], title?: string, addButton?: boolean }) {

    return (
        <div>
            <div className="flex items-center justify-center max-w-min ml-auto">
                <div className="flex items-center">
                    {/* Avatar Images */}
                    {avatars.map((avatar, index) => (
                        <div
                            key={avatar.id}
                            className={`relative ${index > 0 ? "-ml-5" : ""}`}
                            style={{ zIndex: index }}
                        >
                            <div className="w-12 h-12 rounded-full border-2 border-black  bg-white overflow-hidden">
                                <Image
                                    src={avatar.src}
                                    alt={avatar?.alt ?? "Avatar"}
                                    width={60}
                                    height={60}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    ))}

                    {/* Add More Button */}
                    {addButton && <div
                        className="relative -ml-5 w-12 h-12 rounded-full border-2 border-black bg-black flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors"
                        style={{ zIndex: avatars.length }}
                    >
                        <Plus className="w-6 h-6 text-white" />
                    </div>}
                </div>
            </div>
            {title && <p className="text-right">{title}</p>}
        </div>
    )
}
