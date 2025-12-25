"use client";
import ClassicButton from '@/components/custom-UI/Buttons/ClassicButton';
import WhiteStyleButton from '@/components/custom-UI/Buttons/WhiteStyleButton';
import { } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store';
import { shallowEqual } from 'react-redux';

export default function ActionButtons() {
    const router = useRouter();

    const { user, roleWeight } = useAppSelector((state) => ({ user: state.auth.user, roleWeight: state.auth.roleWeight }), shallowEqual);

    const handleJobs = () => {
        console.log("Sign In button clicked");
        router.push("/public/jobs");
    };
    const handleGetStarted = () => {
        router.push("/signup");
    };
    const handelDashboardGO = () => {
        if (roleWeight?.toString() === "95") router.push("/dashboard");
        else router.push("/jobs");
    };
    return (
        <div className='flex justify-around gap-4 items-center'>
            {!user ? <><ClassicButton
                text1="Jobs"
                customStyles={
                    {
                        text1: {
                            color: "#FFFFFF",
                            fontSize: "13px",
                            fontWeight: "300"
                        },
                        text2: {
                            color: "#000000",
                            fontSize: "13px",
                            fontWeight: "300"
                        }
                    }
                }
                onClick={handleJobs}
            />
                <div className='max-w-min md:block hidden'>
                    <WhiteStyleButton
                        onClick={handleGetStarted}
                        title="Get Started"
                    />
                </div></> : <ClassicButton
                text1={roleWeight?.toString() === "95" ? "Dashboard" : "Jobs"}
                customStyles={
                    {
                        text1: {
                            color: "#FFFFFF",
                            fontSize: "13px",
                            fontWeight: "300"
                        },
                        text2: {
                            color: "#000000",
                            fontSize: "13px",
                            fontWeight: "300"
                        },
                        button: {
                            minWidth: "min-content",
                        }
                    }
                }
                onClick={handelDashboardGO}
            />}
        </div>
    );
};