#!/usr/bin/env python3
"""
Email Spam Detection and Refinement System
Integrates custom ML model with Google Gemini AI for comprehensive email filtering
"""

import os
import joblib
import logging
import time
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
import google.generativeai as genai
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class EmailAnalysisResult:
    """Data class to store email analysis results"""
    original_email: str
    is_spam: bool
    spam_probability: float
    refined_email: Optional[str] = None
    refinement_success: bool = False
    refinement_attempts: int = 0
    final_spam_probability: Optional[float] = None
    error_message: Optional[str] = None

class SpamDetector:
    """
    Custom spam detection model wrapper
    Loads and uses pre-trained TF-IDF + Logistic Regression model
    """
    
    def __init__(self, model_path: str = "best_logreg_tfidf.joblib"):
        """
        Initialize the spam detector
        
        Args:
            model_path (str): Path to the saved joblib model file
        """
        self.model_path = model_path
        self.pipeline = None
        self._load_model()
    
    def _load_model(self) -> None:
        """Load the pre-trained model from joblib file"""
        try:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found: {self.model_path}")
            
            # Load the saved model
            self.pipeline = joblib.load(self.model_path)
            
            if hasattr(self.pipeline, 'named_steps'):
                logger.info(f"Successfully loaded Pipeline model from {self.model_path}")
                logger.info(f"Pipeline steps: {list(self.pipeline.named_steps.keys())}")
            else:
                logger.warning("Model is not a Pipeline, this may cause issues")
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise
    
    def preprocess_email(self, email_text: str) -> str:
        """
        Preprocess email text for classification
        
        Args:
            email_text (str): Raw email content
            
        Returns:
            str: Preprocessed email text
        """
        # Basic preprocessing
        email_text = email_text.lower().strip()
        
        # Remove excessive whitespace
        import re
        email_text = re.sub(r'\s+', ' ', email_text)
        
        return email_text
    
    def classify_email(self, email_text: str) -> Tuple[bool, float]:
        """
        Classify email as spam or ham using the trained model
        
        Args:
            email_text (str): Email content to classify
            
        Returns:
            Tuple[bool, float]: (is_spam, spam_probability)
        """
        try:
            if not self.pipeline:
                raise ValueError("Pipeline model not properly loaded")
            
            # Preprocess the email
            processed_text = self.preprocess_email(email_text)
            
            # Use the pipeline directly for prediction
            if hasattr(self.pipeline, 'predict_proba'):
                spam_prob = self.pipeline.predict_proba([processed_text])[0][1]  # Probability of spam class
            else:
                # Fallback to binary prediction
                prediction = self.pipeline.predict([processed_text])[0]
                spam_prob = float(prediction)
            
            # Convert numpy types to Python native types for JSON serialization
            is_spam = bool(spam_prob > 0.5)  # Convert numpy.bool_ to Python bool
            spam_prob = float(spam_prob)      # Convert numpy.float64 to Python float
            
            logger.info(f"Email classified - Spam probability: {spam_prob:.3f}, Is spam: {is_spam}")
            return is_spam, spam_prob
            
        except Exception as e:
            logger.error(f"Error classifying email: {str(e)}")
            raise

class GeminiEmailRefiner:
    """
    Google Gemini AI integration for email refinement
    Converts spam emails into legitimate, professional emails
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini API client
        
        Args:
            api_key (str, optional): Gemini API key. If None, reads from environment
        """
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError(
                "Gemini API key not provided. Set GEMINI_API_KEY environment variable "
                "or pass api_key parameter"
            )
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Rate limiting
        self.last_request_time = 0
        self.min_request_interval = 1.0  # Minimum seconds between requests
        
        logger.info("Gemini API client initialized successfully")
    
    def _rate_limit(self) -> None:
        """Implement basic rate limiting for API calls"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.min_request_interval:
            sleep_time = self.min_request_interval - time_since_last
            logger.info(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()
    
    def refine_spam_email(self, spam_email: str, max_retries: int = 3) -> str:
        """
        Use Gemini AI to convert spam email into legitimate email
        
        Args:
            spam_email (str): Original spam email content
            max_retries (int): Maximum number of retry attempts
            
        Returns:
            str: Refined, legitimate email content
        """
        prompt = f"""
You are an expert email writer specializing in converting spam emails into professional, legitimate communications. Your goal is to create an email that will pass spam filters and appear trustworthy.

CRITICAL ANTI-SPAM REQUIREMENTS:
1. REMOVE ALL CAPS, excessive exclamation marks, and urgent language
2. ELIMINATE words like: "URGENT", "LIMITED TIME", "ACT NOW", "GUARANTEED", "FREE", "WIN", "PRIZE", "MONEY", "CLICK HERE"
3. REPLACE promotional language with professional, factual statements
4. REMOVE any claims about quick results, miracle solutions, or unbelievable offers
5. USE proper business email format with clear subject line
6. WRITE in a calm, professional tone without pressure tactics
7. FOCUS on providing information rather than selling
8. REMOVE any suspicious URLs or links to external sites
9. USE proper grammar, punctuation, and business language
10. MAKE the email sound like it's from a legitimate company

Original spam email content:
{spam_email}

Transform this into a professional, legitimate email that would pass spam filters. Provide only the refined email content:
"""
        
        for attempt in range(max_retries):
            try:
                self._rate_limit()
                
                response = self.model.generate_content(prompt)
                refined_email = response.text.strip()
                
                if refined_email and len(refined_email) > 10:  # Basic validation
                    logger.info(f"Successfully refined email (attempt {attempt + 1})")
                    return refined_email
                else:
                    logger.warning(f"Received empty or too short response (attempt {attempt + 1})")
                    
            except Exception as e:
                logger.error(f"Gemini API error (attempt {attempt + 1}): {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    raise
        
        raise Exception(f"Failed to refine email after {max_retries} attempts")
    
    def refine_spam_email_aggressive(self, spam_email: str, max_retries: int = 3) -> str:
        """More aggressive refinement approach"""
        prompt = f"""
You are an expert at removing ALL spam indicators from emails. This email needs AGGRESSIVE cleaning to pass spam filters.

AGGRESSIVE ANTI-SPAM REQUIREMENTS:
1. COMPLETELY REMOVE: All promotional language, sales pitches, urgency, guarantees
2. REPLACE with: Factual, informational content only
3. REMOVE: Any mention of prices, offers, deals, or commercial intent
4. FOCUS on: Providing information, education, or professional communication
5. TONE: Academic, professional, or informational - NOT commercial
6. STRUCTURE: Formal business email format

Original email:
{spam_email}

Transform this into a completely non-commercial, informational email:
"""
        
        for attempt in range(max_retries):
            try:
                self._rate_limit()
                response = self.model.generate_content(prompt)
                refined_email = response.text.strip()
                
                if refined_email and len(refined_email) > 10:
                    logger.info(f"Successfully refined email aggressively (attempt {attempt + 1})")
                    return refined_email
                else:
                    logger.warning(f"Received empty response (attempt {attempt + 1})")
                    
            except Exception as e:
                logger.error(f"Gemini API error (attempt {attempt + 1}): {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                else:
                    raise
        
        raise Exception(f"Failed to refine email aggressively after {max_retries} attempts")
    
    def refine_spam_email_rewrite(self, spam_email: str, max_retries: int = 3) -> str:
        """Complete rewrite with different approach"""
        prompt = f"""
You are rewriting this email from scratch to make it completely legitimate and professional.

COMPLETE REWRITE REQUIREMENTS:
1. IGNORE the original content - start fresh
2. CREATE a professional business email about the same topic
3. USE formal business language and structure
4. REMOVE all commercial intent and promotional language
5. FOCUS on providing value and information
6. WRITE as if from a legitimate, established company
7. USE proper email format with clear subject and professional signature

Original email (ignore content, just use topic):
{spam_email}

Create a completely new, professional email about the same topic:
"""
        
        for attempt in range(max_retries):
            try:
                self._rate_limit()
                response = self.model.generate_content(prompt)
                refined_email = response.text.strip()
                
                if refined_email and len(refined_email) > 10:
                    logger.info(f"Successfully rewrote email (attempt {attempt + 1})")
                    return refined_email
                else:
                    logger.warning(f"Received empty response (attempt {attempt + 1})")
                    
            except Exception as e:
                logger.error(f"Gemini API error (attempt {attempt + 1}): {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                else:
                    raise
        
        raise Exception(f"Failed to rewrite email after {max_retries} attempts")
    
    def refine_spam_email_conservative(self, spam_email: str, max_retries: int = 3) -> str:
        """Ultra-conservative approach for final attempts"""
        prompt = f"""
You are creating the MOST conservative, professional email possible to ensure it passes all spam filters.

ULTRA-CONSERVATIVE REQUIREMENTS:
1. USE only the most formal, academic, or corporate language
2. REMOVE any hint of commercial activity or sales
3. WRITE as if from a government agency, university, or major corporation
4. FOCUS on information sharing, not any form of transaction
5. USE proper business letter format
6. AVOID any modern marketing language or casual tone
7. MAKE it sound like official correspondence

Original email:
{spam_email}

Create the most conservative, formal email possible:
"""
        
        for attempt in range(max_retries):
            try:
                self._rate_limit()
                response = self.model.generate_content(prompt)
                refined_email = response.text.strip()
                
                if refined_email and len(refined_email) > 10:
                    logger.info(f"Successfully created conservative email (attempt {attempt + 1})")
                    return refined_email
                else:
                    logger.warning(f"Received empty response (attempt {attempt + 1})")
                    
            except Exception as e:
                logger.error(f"Gemini API error (attempt {attempt + 1}): {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                else:
                    raise
        
        raise Exception(f"Failed to create conservative email after {max_retries} attempts")

class EmailFilteringSystem:
    """
    Main system that combines spam detection with AI refinement
    """
    
    def __init__(self, model_path: str = "best_logreg_tfidf.joblib", gemini_api_key: Optional[str] = None):
        """
        Initialize the complete email filtering system
        
        Args:
            model_path (str): Path to spam detection model
            gemini_api_key (str, optional): Gemini API key
        """
        self.spam_detector = SpamDetector(model_path)
        self.email_refiner = GeminiEmailRefiner(gemini_api_key)
        logger.info("Email filtering system initialized successfully")
    
    def process_email(self, email_content: str, refine_threshold: float = 0.5, max_refinement_attempts: int = 5) -> EmailAnalysisResult:
        """
        Complete email processing pipeline with iterative refinement
        
        Args:
            email_content (str): Original email content
            refine_threshold (float): Spam probability threshold for refinement (0.6 = 60%)
            max_refinement_attempts (int): Maximum number of refinement attempts
            
        Returns:
            EmailAnalysisResult: Complete analysis and refinement results
        """
        result = EmailAnalysisResult(original_email=email_content, is_spam=False, spam_probability=0.0)
        
        try:
            # Step 1: Classify original email
            logger.info("Classifying original email...")
            is_spam, spam_prob = self.spam_detector.classify_email(email_content)
            
            # Ensure Python native types for JSON serialization
            result.is_spam = bool(is_spam)           # Ensure Python bool
            result.spam_probability = float(spam_prob)  # Ensure Python float
            
            logger.info(f"Original email spam probability: {spam_prob:.3f}")
            
            # Step 2: Iterative refinement if spam probability exceeds threshold
            if spam_prob >= refine_threshold:
                logger.info(f"Email spam probability ({spam_prob:.3f}) exceeds threshold ({refine_threshold}). Starting iterative refinement...")
                
                current_email = email_content
                current_spam_prob = spam_prob
                refinement_attempts = 0
                
                while current_spam_prob >= refine_threshold and refinement_attempts < max_refinement_attempts:
                    refinement_attempts += 1
                    logger.info(f"Refinement attempt {refinement_attempts}/{max_refinement_attempts}")
                    
                    try:
                        # Adaptive refinement strategy
                        if refinement_attempts == 1:
                            # First attempt: Standard refinement
                            refined_email = self.email_refiner.refine_spam_email(current_email)
                        elif refinement_attempts == 2:
                            # Second attempt: More aggressive refinement
                            refined_email = self.email_refiner.refine_spam_email_aggressive(current_email)
                        elif refinement_attempts == 3:
                            # Third attempt: Complete rewrite with different approach
                            refined_email = self.email_refiner.refine_spam_email_rewrite(current_email)
                        else:
                            # Final attempts: Ultra-conservative approach
                            refined_email = self.email_refiner.refine_spam_email_conservative(current_email)
                        
                        # Check the new spam score
                        refined_is_spam, refined_spam_prob = self.spam_detector.classify_email(refined_email)
                        refined_spam_prob = float(refined_spam_prob)  # Ensure Python float
                        
                        logger.info(f"Refinement {refinement_attempts}: Spam probability reduced from {current_spam_prob:.3f} to {refined_spam_prob:.3f}")
                        
                        # Update current values for next iteration
                        current_email = refined_email
                        current_spam_prob = refined_spam_prob
                        
                        # If we've achieved a safe score, break early
                        if refined_spam_prob < refine_threshold:
                            logger.info(f"✅ Email successfully refined to safe level: {refined_spam_prob:.3f} < {refine_threshold}")
                            break
                        
                        # If we've made significant improvement (reduced by 30% or more), accept it
                        improvement_ratio = (spam_prob - refined_spam_prob) / spam_prob
                        if improvement_ratio >= 0.3 and refined_spam_prob < 0.8:
                            logger.info(f"✅ Email significantly improved by {improvement_ratio:.1%}. Accepting with score {refined_spam_prob:.3f}")
                            break
                            
                        # If no improvement after 2 attempts, try a different strategy
                        if refinement_attempts >= 2 and refined_spam_prob >= current_spam_prob:
                            logger.warning(f"No improvement detected. Trying alternative approach...")
                            
                    except Exception as e:
                        logger.error(f"Refinement attempt {refinement_attempts} failed: {str(e)}")
                        break
                
                # Store the final refined result
                if refinement_attempts > 0 and current_spam_prob < spam_prob:
                    result.refined_email = current_email
                    result.refinement_success = True
                    result.refinement_attempts = refinement_attempts
                    result.final_spam_probability = current_spam_prob
                    logger.info(f"Final refinement result: {current_spam_prob:.3f} (reduced from {spam_prob:.3f}) after {refinement_attempts} attempts")
                else:
                    result.error_message = f"Refinement failed after {refinement_attempts} attempts. Final score: {current_spam_prob:.3f}"
                    result.refinement_attempts = refinement_attempts
                    result.final_spam_probability = current_spam_prob
                    logger.warning(f"Refinement unsuccessful. Final spam probability: {current_spam_prob:.3f}")
                    
            else:
                logger.info(f"Email spam probability ({spam_prob:.3f}) below threshold. No refinement needed.")
            
        except Exception as e:
            result.error_message = f"Processing failed: {str(e)}"
            logger.error(f"Email processing failed: {str(e)}")
        
        return result
    
    def batch_process_emails(self, emails: List[str], refine_threshold: float = 0.5) -> List[EmailAnalysisResult]:
        """
        Process multiple emails in batch
        
        Args:
            emails (List[str]): List of email contents
            refine_threshold (float): Spam probability threshold for refinement
            
        Returns:
            List[EmailAnalysisResult]: Results for all processed emails
        """
        results = []
        
        for i, email in enumerate(emails):
            logger.info(f"Processing email {i + 1}/{len(emails)}")
            result = self.process_email(email, refine_threshold)
            results.append(result)
            
            # Add delay between batch processing to respect rate limits
            if i < len(emails) - 1:
                time.sleep(1)
        
        return results

def create_sample_model():
    """
    Create a sample model file for testing purposes
    This function creates a basic TF-IDF + Logistic Regression model
    """
    try:
        from sklearn.linear_model import LogisticRegression
        from sklearn.pipeline import Pipeline
        
        # Sample training data (in real scenario, this would be much larger)
        sample_emails = [
            "Get rich quick! Make money fast! Click here now!",
            "URGENT: You've won $1,000,000! Claim now!",
            "Free viagra! No prescription needed!",
            "Meeting scheduled for tomorrow at 2 PM",
            "Please review the attached document",
            "Thank you for your purchase",
            "Your order has been shipped",
            "Project update: milestone completed"
        ]
        
        sample_labels = [1, 1, 1, 0, 0, 0, 0, 0]  # 1 = spam, 0 = ham
        
        # Create pipeline
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(max_features=1000, stop_words='english')),
            ('classifier', LogisticRegression(random_state=42))
        ])
        
        # Train the model
        pipeline.fit(sample_emails, sample_labels)
        
        # Save the model
        joblib.dump(pipeline, 'tfidf_lr.joblib')
        logger.info("Sample model created and saved to 'tfidf_lr.joblib'")
        
    except ImportError:
        logger.error("scikit-learn not available. Cannot create sample model.")
        raise

def main():
    """
    Main function demonstrating the complete workflow
    """
    print("=" * 60)
    print("EMAIL SPAM DETECTION AND REFINEMENT SYSTEM")
    print("=" * 60)
    
    # Sample emails for testing
    test_emails = [
        """
        URGENT!!! You have WON $50,000 CASH PRIZE!!! 
        CLICK HERE NOW to claim your prize before it expires!
        This is a LIMITED TIME OFFER! Act fast!
        Send your bank details to claim@winner.com
        """,
        
        """
        Hi John,
        
        I hope this email finds you well. I wanted to follow up on our meeting 
        last week regarding the marketing proposal. 
        
        Could you please review the attached document and let me know your thoughts?
        
        Best regards,
        Sarah
        """,
        
        """
        FREE VIAGRA!!! No prescription needed!!! 
        Get 50% OFF now! Limited time offer!
        CLICK HERE: www.suspicious-pharmacy.com
        """,
        
        """
        Dear Customer,
        
        Thank you for your recent purchase. Your order #12345 has been 
        processed and will be shipped within 2-3 business days.
        
        You can track your order using the tracking number: ABC123456789
        
        Best regards,
        Customer Service Team
        """
    ]
    
    try:
        # Check if model exists, create sample if not
        if not os.path.exists('tfidf_lr.joblib'):
            print("Model file not found. Creating sample model...")
            create_sample_model()
        
        # Initialize the system
        print("\nInitializing Email Filtering System...")
        
        # Note: You need to set GEMINI_API_KEY environment variable
        # export GEMINI_API_KEY="your_api_key_here"
        
        system = EmailFilteringSystem()
        
        # Process each test email
        print("\nProcessing test emails...")
        print("-" * 40)
        
        for i, email in enumerate(test_emails, 1):
            print(f"\n📧 EMAIL {i}:")
            print(f"Original: {email.strip()[:100]}...")
            
            result = system.process_email(email, refine_threshold=0.6)
            
            print(f"🎯 Spam Probability: {result.spam_probability:.3f}")
            print(f"🚨 Is Spam: {result.is_spam}")
            
            if result.refined_email:
                print(f"✨ Refinement: SUCCESS")
                print(f"📝 Refined Email: {result.refined_email[:200]}...")
            elif result.spam_probability < 0.3:
                print(f"✅ No refinement needed (low spam probability)")
            else:
                print(f"❌ Refinement failed: {result.error_message}")
            
            print("-" * 40)
        
        print("\n✅ Processing complete!")
        
    except Exception as e:
        logger.error(f"Main execution failed: {str(e)}")
        print(f"\n❌ Error: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Make sure you have set the GEMINI_API_KEY environment variable")
        print("2. Install required packages: pip install google-generativeai scikit-learn joblib")
        print("3. Ensure the model file 'tfidf_lr.joblib' exists or can be created")

if __name__ == "__main__":
    main()