#!/usr/bin/env python3
"""
Flask API Server for SpamGuard Email Spam Detection
Integrates ML model with Gemini AI for email analysis and refinement
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from spam_detector import EmailFilteringSystem, EmailAnalysisResult

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

def _get_recommendation(result):
    """Determine the recommendation based on analysis results"""
    original_score = float(result.spam_probability)
    
    if original_score < 0.6:
        return "accept"
    elif result.refinement_success and result.final_spam_probability:
        final_score = float(result.final_spam_probability)
        if final_score < 0.6:
            return "accept_refined"
        else:
            return "still_risky"
    else:
        return "rewrite"

# Initialize the email filtering system
try:
    # Get API key from environment variable for security
    gemini_api_key = os.getenv('GEMINI_API_KEY')
    if not gemini_api_key:
        logger.error("GEMINI_API_KEY environment variable not set!")
        return jsonify({"error": "API key not configured"}), 500
    
    # Use your trained model
    system = EmailFilteringSystem(
        model_path="best_logreg_tfidf.joblib",
        gemini_api_key=gemini_api_key
    )
    logger.info("Email filtering system initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize system: {str(e)}")
    system = None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "system_ready": system is not None,
        "message": "SpamGuard API is running"
    })

@app.route('/api/analyze-email', methods=['POST'])
def analyze_email():
    """Analyze email content and provide spam detection results"""
    try:
        if not system:
            return jsonify({
                "error": "System not initialized",
                "message": "Email filtering system failed to initialize"
            }), 500

        data = request.get_json()
        if not data or 'email_content' not in data:
            return jsonify({
                "error": "Missing email content",
                "message": "Please provide email_content in the request body"
            }), 400

        email_content = data['email_content']
        
        if not email_content or len(email_content.strip()) == 0:
            return jsonify({
                "error": "Empty email content",
                "message": "Email content cannot be empty"
            }), 400

        logger.info(f"Analyzing email: {email_content[:100]}...")

        # Process the email through the system
        # Use threshold 0.6 (60%) as specified in requirements
        result = system.process_email(email_content, refine_threshold=0.6)

        # Prepare response - ensure all values are JSON serializable
        response = {
            "original_email": str(result.original_email),
            "spam_score": round(float(result.spam_probability) * 100, 2),  # Convert to percentage
            "is_spam": bool(result.is_spam),
            "recommendation": _get_recommendation(result),
            "refinement": {
                "success": bool(result.refinement_success),
                "refined_email": str(result.refined_email) if result.refined_email else None,
                "refined_spam_score": None,
                "attempts": int(result.refinement_attempts) if hasattr(result, 'refinement_attempts') else 0,
                "final_score": round(float(result.final_spam_probability) * 100, 2) if result.final_spam_probability else None
            }
        }

        # If email was rewritten, check the new spam score
        if result.refinement_success and result.refined_email:
            try:
                refined_is_spam, refined_spam_prob = system.spam_detector.classify_email(result.refined_email)
                response["refinement"]["refined_spam_score"] = round(float(refined_spam_prob) * 100, 2)
                response["refinement"]["refined_is_spam"] = bool(refined_is_spam)
                
                # Update recommendation based on refined score
                if refined_spam_prob < 0.6:
                    response["recommendation"] = "accept_refined"
                else:
                    response["recommendation"] = "still_risky"
                    
            except Exception as e:
                logger.error(f"Failed to analyze refined email: {str(e)}")
                response["refinement"]["error"] = str(e)

        logger.info(f"Analysis complete - Score: {response['spam_score']}%, Recommendation: {response['recommendation']}")
        
        return jsonify(response)

    except Exception as e:
        logger.error(f"Error analyzing email: {str(e)}")
        return jsonify({
            "error": "Analysis failed",
            "message": str(e)
        }), 500

@app.route('/api/refine-email', methods=['POST'])
def refine_email():
    """Manually refine an email using Gemini AI"""
    try:
        if not system:
            return jsonify({
                "error": "System not initialized",
                "message": "Email filtering system failed to initialize"
            }), 500

        data = request.get_json()
        if not data or 'email_content' not in data:
            return jsonify({
                "error": "Missing email content",
                "message": "Please provide email_content in the request body"
            }), 400

        email_content = data['email_content']
        
        logger.info(f"Refining email: {email_content[:100]}...")

        # Use Gemini to refine the email
        refined_email = system.email_refiner.refine_spam_email(email_content)
        
        # Analyze the refined email
        refined_is_spam, refined_spam_prob = system.spam_detector.classify_email(refined_email)
        
        response = {
            "original_email": str(email_content),
            "refined_email": str(refined_email),
            "original_spam_score": None,  # Will be calculated if needed
            "refined_spam_score": round(float(refined_spam_prob) * 100, 2),
            "refined_is_spam": bool(refined_is_spam),
            "improvement": None
        }

        # Calculate improvement if original score is provided
        if 'original_spam_score' in data:
            original_score = float(data['original_spam_score']) / 100  # Convert from percentage
            original_is_spam, _ = system.spam_detector.classify_email(email_content)
            response["original_spam_score"] = round(original_score * 100, 2)
            response["original_is_spam"] = bool(original_is_spam)
            response["improvement"] = round((original_score - float(refined_spam_prob)) * 100, 2)

        logger.info(f"Refinement complete - New score: {response['refined_spam_score']}%")
        
        return jsonify(response)

    except Exception as e:
        logger.error(f"Error refining email: {str(e)}")
        return jsonify({
            "error": "Refinement failed",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
