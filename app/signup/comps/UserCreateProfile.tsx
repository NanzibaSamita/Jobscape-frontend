import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import UserInfoForm from "./UserInfoForm";

export default function UserCreateProfile({ keyIS, profile, closeModal, rawData, storeCvJSON, cvData }: {
    profile: {
        full_name: string,
        email: string,
        user_image: string | null,
        user_name: string,
        id: string,
    } | null,
    keyIS: string,
    closeModal: (key: string) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storeCvJSON: (data: { [key: string]: any }, id: string, email: string) => void,
    rawData?: {
        name: string | null,
        email: string | null,
        number: string | null,
        address: string | null,
        dob: string | null,
    }
    cvData: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any,
    } | null
}) {
    const [step, setStep] = useState(profile ? "user_profiles" : "create_profile");
    const router = useRouter();
    return (
        <div className="lg:w-[30.875rem] max-w-lg bg-background md:p-6 p-4">
            {
                step === "user_profiles" ? (
                    <>
                        <p className="text-lg font-semibold leading-none tracking-tight mb-2">Welcome back!</p>
                        <p className="text-sm text-muted-foreground mb-2">
                            We found some existing profiles. Would you like to continue with one of them?
                        </p>
                        <Card
                            key={profile?.email}
                            className={`cursor-pointer transition-colors hover:bg-muted/50`}
                        // onClick={() => setSelectedProfile(profile)}
                        >
                            <CardContent className="flex items-center space-x-3 p-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={profile?.user_image || "/placeholder.svg"} alt={`Image of ${profile?.user_name}`} />
                                    <AvatarFallback>
                                        <User
                                            className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{profile?.full_name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                                    <p className="text-xs text-muted-foreground">Last active: 30 days ago</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Button className="lg:mt-4 lg:mb-1 mb-1 mt-2 w-full" variant="default" onClick={() => {
                            if (cvData && profile) {
                                const cvDataString = JSON.parse(JSON.stringify(cvData));
                                delete cvDataString.specificData;
                                storeCvJSON(cvDataString, profile.id, profile.email);
                            }
                            router.push("/login");
                            return closeModal(keyIS)
                        }}>
                            Continue With Profile
                        </Button>
                        <Button className="lg:mb-4 lg:mt-1 mb-2 w-full" variant="outline" onClick={() => setStep("create_profile")}>
                            <Plus /> Create New
                        </Button>
                    </>
                ) : <div className="w-full ">
                    <p className="text-lg font-semibold leading-none tracking-tight mb-2">Welcome!</p>
                    <p className="text-sm text-muted-foreground mb-2">
                        Create Your Profile and Log in to continue.
                    </p>
                    <UserInfoForm
                        storeCvJSON={storeCvJSON}
                        cvData={cvData}
                        email={rawData?.email || ""}
                        onComplete={() => { closeModal(keyIS); }}
                        defaultValues={
                            rawData
                        }
                        editableEmail={true}
                    />
                </div>
            }
        </div>
    )
}