import React from 'react'
import JobPreferenceForm from './preference-form'
import { cookies } from 'next/headers';
const SECTOR_GET_API_ENDPOINT = "/api/v1/sector-select";
const JOB_SEEKER_PROFILE_API = "/api/v1/job-seeker-profile";

export default async function Page() {

    const cookieStore = cookies();
    const token = cookieStore.get(process.env.NEXT_ACCESS_TOKEN || "wanted_ai"); // replace 'token' with your actual cookie key
    if (!token?.value) return <p> Unauthorized Access Forbidden </p>
    // You can now use the token to call your API, for example:
    const userResp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${JOB_SEEKER_PROFILE_API}`, {
        headers: {
            Authorization: `Bearer ${token?.value}`,
        },
        cache: 'no-store',
    });

    if (!userResp.ok) return <div>Error fetching profile data.</div>;

    const userData = await userResp.json();
    if (!userData || !userData.data || userData.data?.[0].role_id !== 3) return <div>No profile data found.</div>;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${SECTOR_GET_API_ENDPOINT}`, {
        cache: 'no-store',
    });

    if (!res.ok) return <div>Error fetching profile data.</div>;

    const data = await res.json();
    const sectors = data.data.map(({ id, name }: { id: string; name: string }) => ({ value: id, label: name })) || []
    return (
        <div className="lg:grid lg:grid-cols-2 h-screen relative">
            <>
                <div className="w-full content-center">
                    <div className="max-w-sm w-full mx-auto translate-x-0 lg:translate-x-16 px-2 py-6 lg:px-0 lg:py-0 max-h-screen flex flex-col">
                        <div className="space-y-16">
                            <h1 className={`text-4xl text-black dark:text-primary`}>WANTED<span className="text-primary">.AI</span></h1>
                            <div >
                                <h2 className="text-2xl lg:text-3xl font-bold mb-2">Job Preferences</h2>
                                <p className="text-muted-foreground text-sm">
                                    Set your job preferences to help us find the best opportunities for you.
                                </p>
                            </div>

                        </div>
                        <div className='flex-grow overflow-y-auto py-4'>
                            <JobPreferenceForm sectors={sectors} user={userData.data[0]} />
                        </div>
                    </div>
                </div>
                <div className={`w-full lg:block hidden bg-[url('/images/form-background.png')]`} />
            </>
        </div>
    )
}
