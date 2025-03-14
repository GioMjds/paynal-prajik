import AboutUs from "../components/AboutUs";
import Values from "../components/Values";
import Footer from "../layout/Footer";
import Hero from "../layout/Hero";
import AnimatedSection from "./AnimatedSection";

const Homepage = () => {
  return (
    <section>
      <Hero />
      <AnimatedSection animationDelay={0.2}>
        <AboutUs />
      </AnimatedSection>
      <AnimatedSection animationDelay={0.4}>
        <Values />
      </AnimatedSection>
      <Footer />
    </section>
  );
};

export default Homepage;
