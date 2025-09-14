import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    // Add beach theme to body on mount
    document.body.classList.add('wknd-beach-theme');
    
    // Show content after initial animations
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Clean up on unmount
    return () => {
      document.body.classList.remove('wknd-beach-theme');
      clearInterval(timer);
    };
  }, []);

  // Current day period (morning, afternoon, evening)
  const getDayPeriod = () => {
    const hours = currentTime.getHours();
    if (hours < 12) return "morning";
    if (hours < 17) return "afternoon";
    return "evening";
  };
  
  const dayPeriod = getDayPeriod();
  
  // Scroll to features section
  const scrollToFeatures = () => {
    document.getElementById('wknd-features').scrollIntoView({ 
      behavior: 'smooth'
    });
  };

  return (
    <div className="wknd-landing-container">
      {/* Hero Section with Animated Background */}
      <section className="wknd-hero-section">
        <div className="wknd-sky-gradient"></div>
        
        {/* Sun/Moon based on time of day */}
        <div className={`wknd-celestial ${dayPeriod === "evening" ? "wknd-moon" : "wknd-sun"}`}></div>
        
        {/* Dynamic clouds */}
        <div className="wknd-cloud wknd-cloud-1"></div>
        <div className="wknd-cloud wknd-cloud-2"></div>
        <div className="wknd-cloud wknd-cloud-3"></div>
        
        {/* Ocean waves */}
        <div className="wknd-ocean">
          <div className="wknd-wave wknd-wave-back"></div>
          <div className="wknd-wave wknd-wave-mid"></div>
          <div className="wknd-wave wknd-wave-front"></div>
        </div>
        
        {/* Beach and sand */}
        <div className="wknd-beach-sand">
          <div className="wknd-sand-texture"></div>
        </div>
        
        {/* Beach decorations */}
        <div className="wknd-palm-tree wknd-palm-left">
          <div className="wknd-palm-trunk"></div>
          <div className="wknd-palm-leaves">
            <div className="wknd-palm-leaf wknd-leaf-1"></div>
            <div className="wknd-palm-leaf wknd-leaf-2"></div>
            <div className="wknd-palm-leaf wknd-leaf-3"></div>
            <div className="wknd-palm-leaf wknd-leaf-4"></div>
            <div className="wknd-palm-leaf wknd-leaf-5"></div>
          </div>
        </div>
        
        <div className="wknd-palm-tree wknd-palm-right">
          <div className="wknd-palm-trunk"></div>
          <div className="wknd-palm-leaves">
            <div className="wknd-palm-leaf wknd-leaf-1"></div>
            <div className="wknd-palm-leaf wknd-leaf-2"></div>
            <div className="wknd-palm-leaf wknd-leaf-3"></div>
            <div className="wknd-palm-leaf wknd-leaf-4"></div>
            <div className="wknd-palm-leaf wknd-leaf-5"></div>
          </div>
        </div>
        
        <div className="wknd-beach-umbrella">
          <div className="wknd-umbrella-top"></div>
          <div className="wknd-umbrella-pole"></div>
        </div>
        
        <div className="wknd-beach-chair"></div>
        
        {/* Birds flying */}
        <div className="wknd-birds">
          <div className="wknd-bird wknd-bird-1"></div>
          <div className="wknd-bird wknd-bird-2"></div>
          <div className="wknd-bird wknd-bird-3"></div>
        </div>
      </section>
      
      {/* Main content section */}
      <AnimatePresence>
        {isLoaded && (
          <motion.div 
            className="wknd-content-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Hero content */}
            <section className="wknd-hero-content">
              <motion.div 
                className="wknd-logo-container"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 50 }}
              >
                <div className="wknd-logo">
                  <span className="wknd-logo-icon">🏝️</span>
                  <h1 className="wknd-logo-text">Weekendly</h1>
                </div>
           
              </motion.div>
              
              <motion.div 
                className="wknd-hero-card"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 50 }}
              >
                <h2 className="wknd-hero-title">
                  Plan Your Perfect <span className="wknd-highlight">Weekend Getaway</span>
                </h2>
                <p className="wknd-hero-description">
                  Create unforgettable weekend experiences with smart planning tools, curated activities, 
                  and personalized recommendations for your perfect escape.
                </p>
                
                <div className="wknd-cta-container">
                  <motion.button
                    className="wknd-primary-btn"
                    onClick={() => navigate("/plan")}
                    whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(0, 153, 255, 0.35)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="wknd-btn-icon">🏄‍♂️</span>
                    Start Planning Now
                  </motion.button>
                  
                  <motion.button
                    className="wknd-secondary-btn"
                    onClick={scrollToFeatures}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Explore Features
                  </motion.button>
                </div>
                
                <div className="wknd-users-badge">
                  <div className="wknd-user-avatars">
                    <div className="wknd-avatar wknd-avatar-1"></div>
                    <div className="wknd-avatar wknd-avatar-2"></div>
                    <div className="wknd-avatar wknd-avatar-3"></div>
                    <div className="wknd-avatar wknd-avatar-more">+</div>
                  </div>
                  <div className="wknd-users-text">
                    Join 10,000+ weekend planners
                  </div>
                </div>
              </motion.div>
            </section>
            
            {/* Features section */}
            <section id="wknd-features" className="wknd-features-section">
              <motion.h2 
                className="wknd-section-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                Why Plan with Weekendly?
              </motion.h2>
              
              <div className="wknd-features-grid">
                <motion.div 
                  className="wknd-feature-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                >
                  <div className="wknd-feature-icon wknd-icon-activities">🏄‍♂️</div>
                  <h3 className="wknd-feature-title">Curated Activities</h3>
                  <p className="wknd-feature-desc">
                    Discover and choose from hundreds of beach activities tailored to your preferences.
                  </p>
                </motion.div>
                
                <motion.div 
                  className="wknd-feature-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                >
                  <div className="wknd-feature-icon wknd-icon-schedule">⏰</div>
                  <h3 className="wknd-feature-title">Smart Scheduling</h3>
                  <p className="wknd-feature-desc">
                    Effortlessly organize your day with intelligent time slots and scheduling assistance.
                  </p>
                </motion.div>
                
                <motion.div 
                  className="wknd-feature-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                >
                  <div className="wknd-feature-icon wknd-icon-weather">🌤️</div>
                  <h3 className="wknd-feature-title">Weather Integration</h3>
                  <p className="wknd-feature-desc">
                    Plan with confidence with integrated weather forecasts for your selected dates.
                  </p>
                </motion.div>
                
                <motion.div 
                  className="wknd-feature-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                >
                  <div className="wknd-feature-icon wknd-icon-routes">🗺️</div>
                  <h3 className="wknd-feature-title">Route Planning</h3>
                  <p className="wknd-feature-desc">
                    Optimize your travel with intelligent route suggestions and distance calculations.
                  </p>
                </motion.div>
                
                <motion.div 
                  className="wknd-feature-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                >
                  <div className="wknd-feature-icon wknd-icon-ai">🤖</div>
                  <h3 className="wknd-feature-title">AI Recommendations</h3>
                  <p className="wknd-feature-desc">
                    Get personalized activity suggestions based on your preferences and past plans.
                  </p>
                </motion.div>
                
                <motion.div 
                  className="wknd-feature-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                >
                  <div className="wknd-feature-icon wknd-icon-share">🔗</div>
                  <h3 className="wknd-feature-title">Share & Collaborate</h3>
                  <p className="wknd-feature-desc">
                    Easily share your plans with friends and family or collaborate on trip planning.
                  </p>
                </motion.div>
              </div>
            </section>
            
            {/* Testimonials */}
            <section className="wknd-testimonials-section">
              <motion.h2 
                className="wknd-section-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                What Weekend Planners Say
              </motion.h2>
              
              <div className="wknd-testimonials-container">
                <motion.div 
                  className="wknd-testimonial-card"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="wknd-testimonial-quote">"</div>
                  <p className="wknd-testimonial-text">
                    Weekendly transformed our family trips! The activity suggestions are perfect, and we saved so much time planning.
                  </p>
                  <div className="wknd-testimonial-author">
                    <div className="wknd-testimonial-avatar wknd-avatar-sarah"></div>
                    <div className="wknd-testimonial-info">
                      <div className="wknd-testimonial-name">Sarah J.</div>
                      <div className="wknd-testimonial-title">Family Traveler</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="wknd-testimonial-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="wknd-testimonial-quote">"</div>
                  <p className="wknd-testimonial-text">
                    As someone who loves spontaneous trips, the route planning feature helped me discover hidden beaches I never knew existed!
                  </p>
                  <div className="wknd-testimonial-author">
                    <div className="wknd-testimonial-avatar wknd-avatar-miguel"></div>
                    <div className="wknd-testimonial-info">
                      <div className="wknd-testimonial-name">Miguel R.</div>
                      <div className="wknd-testimonial-title">Adventure Seeker</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="wknd-testimonial-card"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="wknd-testimonial-quote">"</div>
                  <p className="wknd-testimonial-text">
                    The smart scheduling made our group beach day perfect! Everyone got to do what they wanted with zero scheduling conflicts.
                  </p>
                  <div className="wknd-testimonial-author">
                    <div className="wknd-testimonial-avatar wknd-avatar-priya"></div>
                    <div className="wknd-testimonial-info">
                      <div className="wknd-testimonial-name">Priya M.</div>
                      <div className="wknd-testimonial-title">Social Organizer</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>
            
            {/* Final CTA */}
            <section className="wknd-final-cta">
              <motion.div 
                className="wknd-cta-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="wknd-cta-title">Ready for Your Best Weekend Yet?</h2>
                <p className="wknd-cta-description">
                  Start planning your perfect weekend getaway today and create memories that last a lifetime.
                </p>
                <motion.button
                  className="wknd-primary-btn wknd-cta-button"
                  onClick={() => navigate("/plan")}
                  whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(0, 153, 255, 0.35)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="wknd-btn-icon">🚀</span>
                  Start Your Beach Adventure
                </motion.button>
              </motion.div>
            </section>
            
            {/* Footer */}
            <footer className="wknd-footer">
              <div className="wknd-footer-content">
                <div className="wknd-footer-logo">
                  <span className="wknd-logo-icon">🏝️</span>
                  <span className="wknd-footer-logo-text">Weekendly</span>
                </div>
                <p className="wknd-footer-copyright">
                  © {currentTime.getFullYear()} Weekendly. All rights reserved.
                </p>
                <div className="wknd-footer-links">
                  <a href="#" className="wknd-footer-link">Privacy</a>
                  <a href="#" className="wknd-footer-link">Terms</a>
                  <a href="#" className="wknd-footer-link">Contact</a>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}