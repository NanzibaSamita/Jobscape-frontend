import ApplicantsConvert from "./ApplicantsConvert";
import AutomateProcess from "./AutomateProcess";
import Banner from "./Banner";
import BecomeAEmployer from "./BecomeAEmployeer";
import CandidateScreening from "./CandidateScreening";
import Faq from "./Faq";
import Footer from "./Footer";
import HowItWorks from "./HowItWorks";
import JobCategories from "./JobCategories";

export default function Page() {
    return (
        <div className="bg-black min-h-screen min-w-screen">
            <Banner />
            <HowItWorks />
            <ApplicantsConvert />
            <JobCategories />
            <AutomateProcess />
            <CandidateScreening />
            <Faq />
            <BecomeAEmployer />
            <Footer />
        </div>
    )
}
