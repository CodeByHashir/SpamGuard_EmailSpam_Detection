# Email Spam Detection and Refinement System Setup

## Overview
This system combines a custom-trained spam detection model with Google's Gemini AI to create a comprehensive email filtering and refinement pipeline.

## Prerequisites

### 1. Python Environment
- Python 3.8 or higher
- pip package manager

### 2. Required Packages
Install the required packages using:
```bash
pip install -r requirements.txt
```

Or install individually:
```bash
pip install google-generativeai scikit-learn joblib numpy
```

### 3. Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Set the environment variable:

**Linux/Mac:**
```bash
export GEMINI_API_KEY="your_api_key_here"
```

**Windows:**
```cmd
set GEMINI_API_KEY=your_api_key_here
```

**Or create a .env file:**
```
GEMINI_API_KEY=your_api_key_here
```

## Model File Setup

### Option 1: Use Your Existing Model
Place your trained model file `tfidf_lr.joblib` in the same directory as the script.

**Expected model format:**
- Pipeline with TfidfVectorizer and LogisticRegression
- Or dictionary with 'vectorizer' and 'classifier' keys
- Or just the classifier (will use default vectorizer)

### Option 2: Create Sample Model
If you don't have a model file, the script will automatically create a sample model for testing.

## Usage

### Basic Usage
```python
from spam_detector import EmailFilteringSystem

# Initialize the system
system = EmailFilteringSystem()

# Process a single email
email_content = "Your email content here..."
result = system.process_email(email_content)

print(f"Spam probability: {result.spam_probability}")
print(f"Is spam: {result.is_spam}")
if result.refined_email:
    print(f"Refined email: {result.refined_email}")
```

### Batch Processing
```python
emails = ["email1...", "email2...", "email3..."]
results = system.batch_process_emails(emails)

for i, result in enumerate(results):
    print(f"Email {i+1}: Spam prob = {result.spam_probability:.3f}")
```

### Running the Demo
```bash
python spam_detector.py
```

## Configuration Options

### Spam Detection Threshold
Adjust the threshold for when emails should be refined:
```python
# Refine emails with spam probability >= 0.3 (30%)
result = system.process_email(email_content, refine_threshold=0.3)
```

### Rate Limiting
The system includes built-in rate limiting for Gemini API calls:
- Minimum 1 second between requests
- Exponential backoff on failures
- Configurable retry attempts

## Troubleshooting

### Common Issues

1. **"Model file not found"**
   - Ensure `tfidf_lr.joblib` exists in the script directory
   - Or let the script create a sample model automatically

2. **"Gemini API key not provided"**
   - Set the `GEMINI_API_KEY` environment variable
   - Or pass the API key directly to the constructor

3. **"Module not found" errors**
   - Install required packages: `pip install -r requirements.txt`

4. **API rate limiting errors**
   - The system includes automatic rate limiting
   - Increase delays between requests if needed

### Model Format Requirements

Your `tfidf_lr.joblib` file should contain:

**Option 1 - Pipeline:**
```python
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

pipeline = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('classifier', LogisticRegression())
])
```

**Option 2 - Dictionary:**
```python
model_data = {
    'vectorizer': TfidfVectorizer(),
    'classifier': LogisticRegression()
}
```

## API Costs
- Gemini 1.5 Flash is cost-effective for text processing
- Monitor your API usage in Google AI Studio
- Consider implementing additional rate limiting for production use

## Security Notes
- Keep your API key secure and never commit it to version control
- Use environment variables or secure key management systems
- Consider implementing input validation for production use

## Support
For issues with:
- **Gemini API**: Check [Google AI documentation](https://ai.google.dev/)
- **scikit-learn**: Check [scikit-learn documentation](https://scikit-learn.org/)
- **Model training**: Ensure your model is compatible with the expected format