import { cookies } from 'next/headers';
import FormControl from './FormControll';

const JOB_SEEKER_PROFILE_API = "/api/v1/job-seeker-profile";
const CV_DATA_API = "/api/v1/cv/show";

export default async function Page() {

    const cookieStore = cookies();
    const token = cookieStore.get(process.env.NEXT_ACCESS_TOKEN || "wanted_ai"); // replace 'token' with your actual cookie key

    // You can now use the token to call your API, for example:
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${JOB_SEEKER_PROFILE_API}`, {
        headers: {
            Authorization: `Bearer ${token?.value}`,
        },
        cache: 'no-store',
    });

    if (!res.ok) return <div>Error fetching profile data.</div>;

    const data = await res.json();
    if (!data || !data.data || data.data?.[0].role_id !== 3) return <div>No profile data found.</div>;
    const cvData = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${CV_DATA_API}?user_id=${data.data?.[0].id}`, {
        headers: {
            Authorization: `Bearer ${token?.value}`,
        },
        cache: 'no-store',
    });
    let cvRes = null;

    if (!cvData.ok) cvRes = null;
    else cvRes = await cvData.json();
    return (
        <div className="container-padding-sm h-screen grid grid-cols-1 md:grid-cols-2 md:gap-24 gap-4 p-4">
            <FormControl user={data.data[0]} cv={cvRes ? JSON.parse(cvRes.data.cv_json) : null} />
        </div>
    );
}
