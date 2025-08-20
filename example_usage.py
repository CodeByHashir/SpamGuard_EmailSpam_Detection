#!/usr/bin/env python3
"""
Example usage of the Email Spam Detection and Refinement System
Demonstrates various use cases and configurations
"""

import os
from spam_detector import EmailFilteringSystem, EmailAnalysisResult

def example_single_email():
    """Example: Process a single email"""
    print("=" * 50)
    print("EXAMPLE 1: Single Email Processing")
    print("=" * 50)
    
    # Sample spam email
    spam_email = """
    🎉 CONGRATULATIONS!!! 🎉
    
    You have been SELECTED to receive a $5,000 CASH REWARD!!!
    
    This is NOT a scam! You are one of our LUCKY WINNERS!
    
    To claim your prize:
    1. CLICK HERE: www.totally-legit-prizes.com
    2. Enter your BANK DETAILS
    3. Pay a small processing fee of $99
    
    HURRY! This offer expires in 24 HOURS!!!
    
    Act NOW or lose this AMAZING opportunity FOREVER!
    """
    
    try:
        # Initialize system
        system = EmailFilteringSystem()
        
        # Process the email
        result = system.process_email(spam_email, refine_threshold=0.2)
        
        print(f"📧 Original Email Length: {len(spam_email)} characters")
        print(f"🎯 Spam Probability: {result.spam_probability:.3f}")
        print(f"🚨 Classified as Spam: {result.is_spam}")
        
        if result.refined_email:
            print(f"\n✨ REFINEMENT SUCCESSFUL!")
            print(f"📝 Refined Email:")
            print("-" * 30)
            print(result.refined_email)
            print("-" * 30)
        else:
            print(f"❌ Refinement Status: {result.error_message or 'Not needed'}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def example_batch_processing():
    """Example: Process multiple emails in batch"""
    print("\n" + "=" * 50)
    print("EXAMPLE 2: Batch Email Processing")
    print("=" * 50)
    
    # Sample emails with different spam levels
    test_emails = [
        # Obvious spam
        "FREE MONEY!!! Click here to get rich quick! No work required! 100% guaranteed!",
        
        # Suspicious marketing
        "Limited time offer! 50% off everything! Buy now or miss out forever! Act fast!",
        
        # Legitimate business email
        "Hi Sarah, Thank you for your inquiry about our services. I'd be happy to schedule a call to discuss your needs.",
        
        # Professional email
        "Dear Team, Please find attached the quarterly report. Let me know if you have any questions. Best regards, John",
        
        # Borderline promotional
        "Don't miss our summer sale! Great deals on all products. Visit our store today!"
    ]
    
    try:
        system = EmailFilteringSystem()
        
        # Process all emails
        results = system.batch_process_emails(test_emails, refine_threshold=0.4)
        
        print(f"📊 Processed {len(results)} emails")
        print("\nResults Summary:")
        print("-" * 60)
        
        for i, result in enumerate(results, 1):
            status = "🔴 SPAM" if result.is_spam else "🟢 HAM"
            refined = "✨ REFINED" if result.refined_email else "➖ NO CHANGE"
            
            print(f"Email {i}: {status} (prob: {result.spam_probability:.3f}) | {refined}")
            
            if result.error_message:
                print(f"         ❌ Error: {result.error_message}")
        
        print("-" * 60)
        
        # Show detailed results for refined emails
        refined_count = sum(1 for r in results if r.refined_email)
        if refined_count > 0:
            print(f"\n📝 {refined_count} emails were refined:")
            for i, result in enumerate(results, 1):
                if result.refined_email:
                    print(f"\n--- EMAIL {i} REFINEMENT ---")
                    print(f"Original: {test_emails[i-1][:100]}...")
                    print(f"Refined:  {result.refined_email[:100]}...")
                    
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def example_custom_threshold():
    """Example: Using different spam thresholds"""
    print("\n" + "=" * 50)
    print("EXAMPLE 3: Custom Threshold Testing")
    print("=" * 50)
    
    # Borderline spam email
    borderline_email = """
    Special offer just for you! 
    
    We noticed you haven't used your account lately. 
    Come back and enjoy 30% off your next purchase!
    
    This exclusive discount is available for a limited time.
    Click here to shop now: www.example-store.com
    
    Best regards,
    The Sales Team
    """
    
    thresholds = [0.2, 0.4, 0.6, 0.8]
    
    try:
        system = EmailFilteringSystem()
        
        print("Testing different refinement thresholds:")
        print("-" * 40)
        
        for threshold in thresholds:
            result = system.process_email(borderline_email, refine_threshold=threshold)
            
            action = "REFINED" if result.refined_email else "NO ACTION"
            print(f"Threshold {threshold}: Spam prob {result.spam_probability:.3f} → {action}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def example_error_handling():
    """Example: Error handling and edge cases"""
    print("\n" + "=" * 50)
    print("EXAMPLE 4: Error Handling")
    print("=" * 50)
    
    test_cases = [
        "",  # Empty email
        "Hi",  # Very short email
        "A" * 10000,  # Very long email
        "Normal email content for testing purposes."  # Normal email
    ]
    
    try:
        system = EmailFilteringSystem()
        
        for i, email in enumerate(test_cases, 1):
            print(f"\nTest Case {i}: {len(email)} characters")
            
            try:
                result = system.process_email(email)
                print(f"  ✅ Success: Spam prob = {result.spam_probability:.3f}")
                
                if result.error_message:
                    print(f"  ⚠️  Warning: {result.error_message}")
                    
            except Exception as e:
                print(f"  ❌ Error: {str(e)}")
                
    except Exception as e:
        print(f"❌ System initialization error: {str(e)}")

def main():
    """Run all examples"""
    print("🚀 EMAIL SPAM DETECTION SYSTEM - EXAMPLES")
    print("=" * 60)
    
    # Check for API key
    if not os.getenv('GEMINI_API_KEY'):
        print("⚠️  WARNING: GEMINI_API_KEY environment variable not set!")
        print("Some examples may fail. Please set your API key:")
        print("export GEMINI_API_KEY='your_api_key_here'")
        print()
    
    # Run examples
    try:
        example_single_email()
        example_batch_processing()
        example_custom_threshold()
        example_error_handling()
        
        print("\n" + "=" * 60)
        print("✅ All examples completed!")
        print("=" * 60)
        
    except KeyboardInterrupt:
        print("\n\n⏹️  Examples interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")

if __name__ == "__main__":
    main()