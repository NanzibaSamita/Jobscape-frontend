import ApplicantsConvert from "./(landing-page)/ApplicantsConvert";
import AutomateProcess from "./(landing-page)/AutomateProcess";
import Banner from "./(landing-page)/Banner";
import BecomeAEmployer from "./(landing-page)/BecomeAEmployeer";
import CandidateScreening from "./(landing-page)/CandidateScreening";
import Faq from "./(landing-page)/Faq";
import Footer from "./(landing-page)/Footer";
import HowItWorks from "./(landing-page)/HowItWorks";
import JobCategories from "./(landing-page)/JobCategories";

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
