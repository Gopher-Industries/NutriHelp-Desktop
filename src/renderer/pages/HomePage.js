import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from 'antd';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-logo">
              <img src={require('../assets/images/home_page/home_logo.png')} alt="NutriHelp Logo" className="hero-logo-image" />
              <h1 className="hero-title">NutriHelp</h1>
            </div>
            <p className="hero-description">
              Your personal nutrition assistant powered by AI. Get personalized meal plans, 
              track your nutrition, and achieve your health goals with expert guidance.
            </p>
            <Button type="primary" size="large" className="hero-button">
              GET STARTED
            </Button>
          </div>
          <div className="hero-image">
            <img src={require('../assets/images/home_page/family.png')} alt="Family" className="family-image" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="feature-item">
            <div className="feature-image">
              <img src={require('../assets/images/home_page/consult.png')} alt="Consultation" className="feature-img" />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Nutrition</h3>
              <p className="feature-description">
                Get expert nutrition advice tailored to your specific needs and health goals. 
                Our AI-powered system analyzes your dietary preferences and provides 
                personalized recommendations.
              </p>
            </div>
          </div>

          <div className="feature-item reverse">
            <div className="feature-content">
              <h3 className="feature-title">Diagnosis</h3>
              <p className="feature-description">
                Receive comprehensive health assessments based on your symptoms and 
                medical history. Our advanced diagnostic tools help identify potential 
                nutritional deficiencies and health concerns.
              </p>
            </div>
            <div className="feature-image">
              <img src={require('../assets/images/home_page/robot.png')} alt="AI Robot" className="feature-img" />
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-image">
              <img src={require('../assets/images/home_page/consult.png')} alt="Consultation" className="feature-img" />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Personalized plan</h3>
              <p className="feature-description">
                Create customized meal plans that fit your lifestyle, dietary restrictions, 
                and health objectives. Track your progress and adjust your plan as needed 
                for optimal results.
              </p>
            </div>
          </div>

          <div className="feature-item reverse">
            <div className="feature-content">
              <h3 className="feature-title">Diet Plan</h3>
              <p className="feature-description">
                Follow structured diet plans designed by nutrition experts. Whether you're 
                looking to lose weight, gain muscle, or maintain a healthy lifestyle, 
                we have the perfect plan for you.
              </p>
            </div>
            <div className="feature-image">
              <img src={require('../assets/images/home_page/consult.png')} alt="Diet Plan" className="feature-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="services-container">
          <h2 className="services-title">Services</h2>
          <p className="services-subtitle">
            At NutriHelp, we offer a variety of nutrition-focused services that cater to your individual needs. Our comprehensive approach ensures you receive the best possible care and guidance.
          </p>
          
          <div className="services-grid">
            <div className="service-card">
              <img src={require('../assets/images/home_page/service1.png')} alt="Meal Planning" className="service-image" />
              <h3 className="service-title">Meal Planning</h3>
              <p className="service-description">
                Personalized meal plans tailored to your dietary needs, preferences, and health goals. 
                Get weekly menus with shopping lists and nutritional information.
              </p>
            </div>

            <div className="service-card">
              <img src={require('../assets/images/home_page/service2.png')} alt="Diet Plans" className="service-image" />
              <h3 className="service-title">Diet Plans</h3>
              <p className="service-description">
                Structured diet programs designed by certified nutritionists. Choose from 
                weight loss, muscle gain, or maintenance plans.
              </p>
            </div>

            <div className="service-card">
              <img src={require('../assets/images/home_page/service3.png')} alt="Calorie Recipes" className="service-image" />
              <h3 className="service-title">Calorie Recipes</h3>
              <p className="service-description">
                Access thousands of healthy recipes with detailed calorie counts and 
                nutritional breakdowns. Filter by dietary restrictions and preferences.
              </p>
            </div>

            <div className="service-card">
              <img src={require('../assets/images/home_page/service4.png')} alt="Nutrition Education" className="service-image" />
              <h3 className="service-title">Nutrition Education</h3>
              <p className="service-description">
                Learn about nutrition science, healthy eating habits, and how to make 
                informed food choices for long-term health and wellness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="contact-container">
          <h2 className="contact-title">Contact</h2>
          <p className="contact-subtitle">
            Have questions or need assistance? Reach out to us and we'll be happy to help you on your nutrition journey.
          </p>
          
          <form className="contact-form">
            <div className="form-row">
              <input type="text" placeholder="Name" className="contact-input" />
              <input type="email" placeholder="Email" className="contact-input" />
            </div>
            <input type="text" placeholder="Call" className="contact-input full-width" />
            <textarea placeholder="Message" className="contact-textarea" rows="5"></textarea>
            <Button type="primary" className="contact-button">Submit</Button>
          </form>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-container">
          <h2 className="newsletter-title">Subscribe to our Newsletter</h2>
          <p className="newsletter-subtitle">Stay up to date with our latest news and updates</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email" className="newsletter-input" />
            <Button type="primary" className="newsletter-button">Subscribe</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-title">NutriHelp</h3>
              <p className="footer-description">Your trusted partner in nutrition and health</p>
            </div>
            <div className="footer-section">
              <h4 className="footer-subtitle">Connect with Us</h4>
              <div className="social-links">
                <span className="social-link">Facebook</span>
                <span className="social-link">Twitter</span>
                <span className="social-link">Instagram</span>
                <span className="social-link">LinkedIn</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;