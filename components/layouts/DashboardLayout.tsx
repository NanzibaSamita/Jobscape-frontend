"use client"
import { ReactNode, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { toggleSidebar } from "@/lib/store/slices/appSlice"
import { useUI } from "@/contexts/ui-context"
import { Bell, BookUser, ChevronDown, LogOutIcon, Menu, X } from "lucide-react"
import Link from "next/link"
import { logoutUser } from "@/lib/store/slices/authSlice"
import { logoutAction } from "@/lib/cookies"
import { usePathname, useRouter } from "next/navigation"
import SidebarData from "@/data/SidebarData"
import { AnimatePresence, motion } from "framer-motion"
import { shallowEqual } from "react-redux"
import { UserDropBar } from "../shared/UserDropBar"
import NextImage from "../custom-UI/NextImage"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch()
    const pathname = usePathname();
    const { user, isAuthenticated, roleWeight } = useAppSelector((state) => ({ user: state.auth.user, isAuthenticated: state.auth.isAuthenticated, roleWeight: state.auth.roleWeight }), shallowEqual)
    const [currentPathaname, setCurrentPathname] = useState("");
    const { sidebarOpen } = useAppSelector((state) => state.app, shallowEqual)
    const router = useRouter()
    const [highlightPath, setHighLightPath] = useState("");
    const { isLoading, } = useUI();
    const [menuItems, setMenuItems] = useState(SidebarData);
    const [, setIsHovered] = useState({
        state: false,
        position: { top: 0, left: 0 },
        name: "",
    });

    const submenuContainer = {
        hidden: {
            opacity: 0,
            y: -60,
            transition: {
                staggerChildren: 0,
            },
        },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const submenuItem = {
        hidden: { x: -10, opacity: 0, y: -20 },
        show: { x: 0, opacity: 1, y: 0 },
    };

    const handleItemClicked = (item: { id: number; name: string; hasSubmenu?: boolean; expanded?: boolean; icon?: ReactNode; route: string; subItemList?: { id: number; name: string; route: string }[] | undefined }, isSubMenu = false) => {
        console.log("check for on click item", item);
        // setIsNavbarCollapsed(false);
        if (!isSubMenu && item.hasSubmenu) {
            setMenuItems((prev) => {
                return prev.map((curr) => ({
                    ...curr,
                    expanded: curr.id == item.id ? !curr.expanded : false,
                }));
            });
            console.log(item);
            setHighLightPath(item.route);
            console.log("check for on click inside IF");
        } else {
            console.log("check for on click outside IF", item.route);

            // router.push(item.route);

            // if (pathname !== item.route) {
            //   router.replace(item.route);
            // } else {
            //   router.replace(item.route);
            // }
            setIsHovered({ state: false, position: { top: 0, left: 0 }, name: "" });
        }

    }

    const userActions = [
        {
            label: "Profile",
            onClick: () => router.push("/profile/update"),
            Icon: BookUser
        },
        {
            label: "Logout",
            onClick: async () => {
                dispatch(logoutUser())
                await logoutAction()
                router.push("/login")
                router.refresh()
            },
            Icon: LogOutIcon
        }
    ];

    useEffect(() => {
        setHighLightPath(pathname);
        setCurrentPathname(pathname);
        setMenuItems((prev) => {
            return prev.map((curr) => ({
                ...curr,
                expanded: pathname.includes(curr.route) ? true : false,
            }));
        });
    }, [pathname]);
    return (
        <div className="space-y-4">
            <div className="h-screen bg-dashboard flex flex-col w-screen">

                <div className="flex flex-grow overflow-y-hidden w-screen md:px-4 px-0">
                    <aside
                        className={`fixed z-50 md:relative w-64 bg-dashboard h-screen py-5 transition-all duration-300 ease-in-out transform flex flex-col ${sidebarOpen
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-full md:translate-x-0 opacity-0 md:w-0"
                            }`}
                    >
                        <div className={`overflow-y-auto flex-grow flex flex-col justify-start ${sidebarOpen ? "pr-6 pl-2" : "px-0"}`}>
                            {/* <h2 className="text-lg font-semibold">Navigation</h2> */}

                            {/* Company logo Header */}
                            <div className="flex items-center justify-between py-4">
                                {/* <h1 className={`text-xl text-center md:text-4xl text-black dark:text-primary`}>WANTED<span className="text-primary">.AI</span></h1> */}
                                <NextImage
                                    src={"/images/wai-black.png"}
                                    alt="User Icon"
                                    width={170}
                                    height={64}
                                    className="w-ful h-full dark:hidden block"
                                />
                                <NextImage
                                    src={"/images/wai-white.png"}
                                    alt="User Icon"
                                    width={170}
                                    height={64}
                                    className="w-ful h-full dark:block hidden"
                                />
                                <X onClick={() => dispatch(toggleSidebar())} className="w-7 h-7 p-1 md:hidden block hover:bg-primary/10 rounded shrink-0" />
                            </div>
                            <nav className="space-y-2 flex-grow overflow-y-auto">
                                {menuItems.map((item) => {
                                    if (item.for && !item.for.includes(roleWeight?.toString() ?? '')) return null; // Check if user role is allowed
                                    return (
                                        <div
                                            key={`item-${item.id}`}
                                            onClick={() => handleItemClicked(item)}
                                            // onMouseOver={(e) => handleMouseOver(e, item)}
                                            // onMouseLeave={handleMouseLeave}
                                            className="cursor-pointer mb-2"
                                        >
                                            <div
                                                className={`w-full relative group rounded-lg ${highlightPath.includes(item.route) && highlightPath.endsWith(item.route)
                                                    ? "bg-primary/30 font-bold shadow-sm"
                                                    : "text-muted-foreground hover:text-black hover:bg-gray-400/30"
                                                    }  py-2 text-left px-6 font-medium flex items-center justify-start gap-2`}
                                            >
                                                {sidebarOpen ? (
                                                    <>
                                                        {item?.hasSubmenu ? (
                                                            <>
                                                                <div className="relative group">{item.icon}</div>
                                                                <span>{item.name}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="relative group">{item.icon}</div>
                                                                <Link className="w-full" href={item?.route}>
                                                                    {item.name}
                                                                </Link>
                                                            </>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="relative group">{item.icon}</div>
                                                )}
                                            </div>
                                            {sidebarOpen && (
                                                <AnimatePresence>
                                                    {item.hasSubmenu && item.expanded && (
                                                        <motion.div
                                                            initial="hidden"
                                                            animate="show"
                                                            variants={submenuContainer}
                                                            className="flex flex-col items-start ml-12 mt-2 gap-1 animate-in overflow-hidden"
                                                        >
                                                            {(item?.subItemList)?.map((subItem) => {
                                                                if (subItem.for && !subItem.for.includes(roleWeight?.toString() ?? '')) return null;
                                                                return (
                                                                    <motion.div
                                                                        key={`sub-item-${item.id}`}
                                                                        variants={submenuItem}
                                                                        className={`${currentPathaname == subItem.route
                                                                            ? "text-primary font-bold"
                                                                            : "text-gray-600 font-normal hover:text-gray-800"
                                                                            }`}
                                                                        onClick={() => handleItemClicked(subItem, true)}
                                                                    >
                                                                        <Link
                                                                            href={subItem?.route}
                                                                            onClick={() =>
                                                                                setIsHovered({
                                                                                    state: false,
                                                                                    position: { top: 0, left: 0 },
                                                                                    name: "",
                                                                                })
                                                                            }
                                                                        >
                                                                            • {subItem.name}
                                                                        </Link>
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            )}
                                        </div>
                                    );
                                })}
                            </nav>
                            <div>
                                <p className="text-xs text-gray-500 mt-4">
                                    © {new Date().getFullYear()} WANTED.AI. All rights reserved.
                                </p>
                            </div>
                        </div>
                    </aside>
                    <main className={`flex-1 md:my-5 my-0 md:rounded-3xl flex flex-col overflow-x-hidden transition-all bg-dashboard-foreground duration-300 ease-in-out ${sidebarOpen ? "md:ml-0" : "md:ml-0"}`}>
                        {/* Header */}
                        <header>
                            <div className="flex h-16 items-center px-4">
                                <Button className="border" variant="ghost" size="icon" onClick={() => dispatch(toggleSidebar())}>
                                    <Menu className="h-4 w-4" />
                                </Button>
                                <div className="ml-auto flex items-center space-x-4">
                                    {isAuthenticated ? (
                                        <div className="flex items-center space-x-2">
                                            <Button className="border rounded-full relative" variant="ghost" size="icon">
                                                <section className="w-[6px] h-[6px] rounded-full bg-orange-600 absolute top-[2px] right-[2px] hidden" />
                                                <Bell className="h-4 w-4" />
                                            </Button>
                                            <UserDropBar
                                                userName={
                                                    <div className="flex justify-center items-center gap-2 select-none cursor-pointer">
                                                        <span className="text-sm">
                                                            {user?.user_first_name} {user?.user_last_name}
                                                        </span>
                                                        <ChevronDown className="h-4 w-4" />
                                                    </div>
                                                }
                                                actions={userActions}
                                            />
                                        </div>
                                    ) : (
                                        <Button disabled={isLoading} size="sm">
                                            {isLoading ? "Logging in..." : "Login"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </header>
                        <div className="flex-grow overflow-y-auto md:px-6 px-3 md:py-4 py-2 border-t">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
