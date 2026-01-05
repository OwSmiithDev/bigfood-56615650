import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import CategoriesSection from "@/components/landing/CategoriesSection";
import FeaturedRestaurants from "@/components/landing/FeaturedRestaurants";
import HowItWorks from "@/components/landing/HowItWorks";
import ForBusinessSection from "@/components/landing/ForBusinessSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <CategoriesSection />
      <FeaturedRestaurants />
      <HowItWorks />
      <ForBusinessSection />
      <Footer />
    </main>
  );
};

export default Index;
