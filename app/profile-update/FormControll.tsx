"use client"
import React, { useState } from 'react'
import TabChanger from './TabChanger'
import BasicForm from './BasicForm'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import AddressForm from './AddressForm'
import EducationForm from './EducationalForm'
import ExperienceForm from './ExperienceForm'
import ProfessionalDetailsForm from './ProfessionalForm'
import { api } from '@/lib/axios/axios'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'


export default function FormControl({
    user,
    cv,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cv?: any,
}) {
    const [active, setActive] = useState("Basic Information");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const userProfileParts = [
        "Basic Information",
        "Address Information",
        "Professional Details",
        "Educational Details",
        "Experience Details"
    ]
    const form = useForm({
        defaultValues: {
            user_image: user.user_image || undefined,
            user_first_name: user.user_first_name || undefined,
            user_last_name: user.user_last_name || undefined,
            user_mobile: user.user_mobile || cv?.personal?.contact?.user_mobile || undefined,
            user_mobile_code: user.user_mobile_code || cv?.personal?.contact?.user_mobile_code || "+880",
            email: user.email || undefined,
            about_me: cv?.about_me ?? undefined,
            user_street_address: cv?.address?.street ?? undefined,
            user_police_station: cv?.address?.police_station ?? undefined,
            user_city: cv?.address?.city ?? undefined,
            user_zip: cv?.address?.zip ?? undefined,
            user_state: cv?.address?.state ?? undefined,
            user_country: cv?.address?.country ?? undefined,
            education_details: cv.education ?? undefined,
            experience_details: cv.experience ?? undefined,
            professional_details: {
                projects: cv.projects ?? undefined,
                certifications: cv.certifications ?? undefined,
                skills: cv.skills ?? undefined,
            },
        }
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function updateProfileValue(data: any, activeTab: string) {
        setLoading(true);
        const newData = new FormData();
        Object.keys(data).forEach((key) => {
            if (typeof data[key] === 'object' && data[key] !== null && key !== "user_image") {
                newData.append(key, JSON.stringify(data[key]));
            } else {
                newData.append(key, data[key]);
            }
        })
        api.post("/api/v1/job-seeker-profile-update", newData, {
            headers: {
                'Content-Type': "multipart/form-data",
            },
        })
            .then((res) => {
                toast.success("Profile updated successfully!");
                console.log("Server response:", res.data);

                // Optionally switch to next tab or section
                // Uncomment this if you want to auto-progress UI
                if (activeTab !== "done") {
                    setActive(activeTab);
                }
                else {
                    router.push("/job-preferences");
                }
            })
            .catch((error) => {
                console.error("Update failed:", error);
                const msg =
                    error?.response?.data?.message ||
                    "Something went wrong while updating profile.";
                toast.error(msg);
            })
            .finally(() => {
                setLoading(false);
            });
        // setActive(activeTab);
    }
    return (
        <>
            <div className='bg-transparent p-4 rounded h-full w-full overflow-y-scroll flex justify-center items-center'>
                <div className='h-full md:space-y-32'>
                    <h1 className={`text-4xl text-black dark:text-primary lg:mb-16 `}>WANTED<span className="text-primary">.AI</span></h1>
                    <div>
                        <div>
                            <h1 className='text-3xl font-bold'>Profile Setup</h1>
                            {/* Replace with actual profile data */}
                            <p className="text-label mb-2">Update your personal information and keep your profile up to date.</p>
                        </div>
                        <div>
                            <TabChanger active={active} setActive={setActive} user={user} tabs={userProfileParts} />
                        </div>
                    </div>
                </div>
            </div>
            <Form {...form}>
                <div className='bg-background p-4 h-[80%] rounded-3xl my-auto space-y-3 overflow-y-auto relative'>

                    {
                        active === "Basic Information" && <BasicForm loading={loading} updateProfileValue={updateProfileValue} form={form} />
                    }
                    {
                        active === "Address Information" && <AddressForm loading={loading} updateProfileValue={updateProfileValue} form={form} />
                    }
                    {
                        active === "Professional Details" && <ProfessionalDetailsForm loading={loading} updateProfileValue={updateProfileValue} form={form} />
                    }
                    {
                        active === "Educational Details" && <EducationForm loading={loading} updateProfileValue={updateProfileValue} form={form} />
                    }
                    {
                        active === "Experience Details" && <ExperienceForm loading={loading} updateProfileValue={updateProfileValue} form={form} />
                    }
                </div>
            </Form>
        </>
    )
}
