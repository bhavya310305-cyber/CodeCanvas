import Navbar from "@/components/pages/LandingPage/Navbar";
import HeroSection from "@/components/pages/LandingPage/HeroSection";
import SocialProof from "@/components/pages/LandingPage/SocialProof";
import FeaturesSection from "@/components/pages/LandingPage/FeaturesSection";
import HowItWorks from "@/components/pages/LandingPage/HowItWorks";
import AIHighlight from "@/components/pages/LandingPage/AIHighlight";
import FinalCTA from "@/components/pages/LandingPage/FinalCTA";
import Footer from "@/components/pages/LandingPage/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SocialProof />
      <FeaturesSection />
      <HowItWorks />
      <AIHighlight />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
