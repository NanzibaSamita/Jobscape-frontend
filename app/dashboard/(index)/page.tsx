"use client";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAppSelector } from "@/lib/store";
import { shallowEqual } from "react-redux";
import SeekerDashboard from "../SeekerDashboard";
import RecruiterDashboard from "../RecruiterDashboard";

export default function Page() {
    const { roleWeight } = useAppSelector((state) => ({ user_first_name: state.auth.user?.user_first_name, roleWeight: state.auth.roleWeight }), shallowEqual);

    if (roleWeight?.toString() === "90") return (
        <DashboardLayout>
            <SeekerDashboard />
        </DashboardLayout>
    )
    else if (roleWeight?.toString() === "95") {
        return (
            <DashboardLayout>
                <RecruiterDashboard />
            </DashboardLayout>
        );
    }
}

