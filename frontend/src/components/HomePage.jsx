import { BlogPage } from './blog';
import HeroSection from './HeroSection';
import ServicesSection from './ServicesSection';
import TestimonialsMarquee from './TestimonialsMarquee';
import { ChevronUp } from 'lucide-react';

const HomePage = ({ onBookingClick, onNavigateToService }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  
  return (
    <>
      <HeroSection onBookingClick={onBookingClick} />
      <ServicesSection onBookingClick={onBookingClick} onNavigateToService={onNavigateToService} />
      {/* <BlogPage/>  */}
      <TestimonialsMarquee />
      
      {/* Floating Action Button like in the reference */}
      <button 
        className="floating-action-button"
        onClick={scrollToTop}
        aria-label="العودة إلى الأعلى"
        style={{cursor :"pointer"}}
      >
        <ChevronUp />
      </button>
    </>
  );
};

export default HomePage;
