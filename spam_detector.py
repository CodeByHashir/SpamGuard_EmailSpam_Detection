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
    error_message: Optional[str] = None

class SpamDetector:
    """
    Custom spam detection model wrapper
    Loads and uses pre-trained TF-IDF + Logistic Regression model
    """
    
    def __init__(self, model_path: str = "tfidf_lr.joblib"):
        """
        Initialize the spam detector
        
        Args:
            model_path (str): Path to the saved joblib model file
        """
        self.model_path = model_path
        self.model = None
        self.vectorizer = None
        self._load_model()
    
    def _load_model(self) -> None:
        """Load the pre-trained model and vectorizer from joblib file"""
        try:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found: {self.model_path}")
            
            # Load the saved model (assumes it contains both vectorizer and classifier)
            model_data = joblib.load(self.model_path)
            
            # Handle different model storage formats
            if isinstance(model_data, dict):
                self.vectorizer = model_data.get('vectorizer')
                self.model = model_data.get('classifier')
            elif hasattr(model_data, 'named_steps'):
                # Pipeline format
                self.vectorizer = model_data.named_steps.get('tfidf', model_data.named_steps.get('vectorizer'))
                self.model = model_data.named_steps.get('classifier', model_data.named_steps.get('lr'))
            else:
                # Assume it's just the classifier, create default vectorizer
                self.model = model_data
                self.vectorizer = TfidfVectorizer(
                    max_features=5000,
                    stop_words='english',
                    lowercase=True,
                    ngram_range=(1, 2)
                )
                logger.warning("No vectorizer found in model file. Using default TfidfVectorizer.")
            
            logger.info(f"Successfully loaded model from {self.model_path}")
            
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
            if not self.model or not self.vectorizer:
                raise ValueError("Model not properly loaded")
            
            # Preprocess the email
            processed_text = self.preprocess_email(email_text)
            
            # Vectorize the text
            if hasattr(self.vectorizer, 'transform'):
                # Vectorizer is already fitted
                text_vector = self.vectorizer.transform([processed_text])
            else:
                # Need to fit the vectorizer (shouldn't happen with pre-trained model)
                logger.warning("Vectorizer not fitted. This may cause issues.")
                text_vector = self.vectorizer.fit_transform([processed_text])
            
            # Get prediction probability
            if hasattr(self.model, 'predict_proba'):
                spam_prob = self.model.predict_proba(text_vector)[0][1]  # Probability of spam class
            else:
                # Fallback to binary prediction
                prediction = self.model.predict(text_vector)[0]
                spam_prob = float(prediction)
            
            is_spam = spam_prob > 0.5
            
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
You are an expert email writer. I need you to transform the following email content, which has been flagged as potential spam, into a professional, legitimate email that would pass spam filters.

Requirements:
1. Maintain the core message and intent if it's legitimate
2. Remove any spam-like language, excessive capitalization, or suspicious elements
3. Use professional, clear, and concise language
4. Ensure proper email structure and formatting
5. Make it sound natural and trustworthy
6. Remove any misleading or deceptive content

Original email content:
{spam_email}

Please provide only the refined email content without any explanations or additional text:
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

class EmailFilteringSystem:
    """
    Main system that combines spam detection with AI refinement
    """
    
    def __init__(self, model_path: str = "tfidf_lr.joblib", gemini_api_key: Optional[str] = None):
        """
        Initialize the complete email filtering system
        
        Args:
            model_path (str): Path to spam detection model
            gemini_api_key (str, optional): Gemini API key
        """
        self.spam_detector = SpamDetector(model_path)
        self.email_refiner = GeminiEmailRefiner(gemini_api_key)
        logger.info("Email filtering system initialized successfully")
    
    def process_email(self, email_content: str, refine_threshold: float = 0.5) -> EmailAnalysisResult:
        """
        Complete email processing pipeline
        
        Args:
            email_content (str): Original email content
            refine_threshold (float): Spam probability threshold for refinement
            
        Returns:
            EmailAnalysisResult: Complete analysis and refinement results
        """
        result = EmailAnalysisResult(original_email=email_content, is_spam=False, spam_probability=0.0)
        
        try:
            # Step 1: Classify email
            logger.info("Classifying email...")
            is_spam, spam_prob = self.spam_detector.classify_email(email_content)
            
            result.is_spam = is_spam
            result.spam_probability = spam_prob
            
            # Step 2: Refine if spam probability exceeds threshold
            if spam_prob >= refine_threshold:
                logger.info(f"Email spam probability ({spam_prob:.3f}) exceeds threshold ({refine_threshold}). Refining...")
                
                try:
                    refined_email = self.email_refiner.refine_spam_email(email_content)
                    result.refined_email = refined_email
                    result.refinement_success = True
                    logger.info("Email successfully refined")
                    
                except Exception as e:
                    result.error_message = f"Refinement failed: {str(e)}"
                    logger.error(f"Failed to refine email: {str(e)}")
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
            
            result = system.process_email(email, refine_threshold=0.3)
            
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