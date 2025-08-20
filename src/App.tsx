import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Zap, 
  CheckCircle, 
  BarChart3, 
  Sparkles, 
  ArrowRight, 
  Mail, 
  Target, 
  Clock, 
  Users,
  Star,
  Download,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  RotateCcw,
  LogOut
} from 'lucide-react';

type Step = 'landing' | 'email-form' | 'otp-verification' | 'email-analysis';

interface FormData {
  email: string;
  otp: string;
}

interface EmailAnalysisResult {
  original_email: string;
  spam_score: number;
  is_spam: boolean;
  recommendation: string;
  refinement: {
    success: boolean;
    refined_email: string | null;
    refined_spam_score: number | null;
    attempts: number;
    final_score: number | null;
    error?: string;
  };
}

interface UserSession {
  email: string;
  sessionToken: string;
  expiresAt: number;
}

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('landing');
  const [formData, setFormData] = useState<FormData>({ email: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  
  // Email analysis state
  const [emailContent, setEmailContent] = useState('');
  const [analysisResult, setAnalysisResult] = useState<EmailAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Session management
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  // Check for existing session on component mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Check session expiry every minute
  useEffect(() => {
    if (userSession) {
      const interval = setInterval(() => {
        const now = Date.now();
        const timeUntilExpiry = userSession.expiresAt - now;
        
        // Show warning 1 hour before expiry
        if (timeUntilExpiry < 60 * 60 * 1000 && timeUntilExpiry > 0) {
          // You could show a toast notification here
          console.log('Session expires in less than 1 hour');
        }
        
        // Auto-logout when session expires
        if (timeUntilExpiry <= 0) {
          logout();
        }
      }, 60000); // Check every minute
      
      return () => clearInterval(interval);
    }
  }, [userSession]);

  const checkExistingSession = () => {
    const savedSession = localStorage.getItem('spamguard_session');
    if (savedSession) {
      try {
        const session: UserSession = JSON.parse(savedSession);
        const now = Date.now();
        
        if (session.expiresAt > now) {
          // Session is still valid
          setUserSession(session);
          setFormData({ ...formData, email: session.email });
          setCurrentStep('email-analysis');
        } else {
          // Session expired, remove it
          localStorage.removeItem('spamguard_session');
        }
      } catch (e) {
        // Invalid session data, remove it
        localStorage.removeItem('spamguard_session');
      }
    }
  };

  const createUserSession = (email: string) => {
    const session: UserSession = {
      email,
      sessionToken: generateSessionToken(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    setUserSession(session);
    localStorage.setItem('spamguard_session', JSON.stringify(session));
  };

  const generateSessionToken = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const logout = () => {
    setUserSession(null);
    localStorage.removeItem('spamguard_session');
    setCurrentStep('landing');
    setFormData({ email: '', otp: '' });
    setGeneratedOTP('');
    setError('');
    setEmailContent('');
    setAnalysisResult(null);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    // Simulate OTP generation and sending
    const otp = generateOTP();
    setGeneratedOTP(otp);
    
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      setCurrentStep('otp-verification');
      // In a real app, you would send the OTP via email service
      console.log(`OTP sent to ${formData.email}: ${otp}`);
    }, 2000);
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.otp !== generatedOTP) {
      setError('Invalid OTP. Please check your email and try again.');
      return;
    }

    setLoading(true);
    
    // Simulate verification delay
    setTimeout(() => {
      setLoading(false);
      // Create user session after successful verification
      createUserSession(formData.email);
      setCurrentStep('email-analysis');
    }, 1000);
  };

  const handleAnalyzeClick = () => {
    if (userSession) {
      // User already has a valid session, go directly to analysis
      setCurrentStep('email-analysis');
    } else {
      // User needs to verify, go to email form
      setCurrentStep('email-form');
    }
  };

  const analyzeEmail = async () => {
    if (!emailContent.trim()) {
      setError('Please enter email content to analyze');
      return;
    }

    setAnalyzing(true);
    setError('');
    setAnalysisResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/analyze-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_content: emailContent.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze email');
      }

      const result = await response.json();
      setAnalysisResult(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze email');
    } finally {
      setAnalyzing(false);
    }
  };

  const refineEmail = async () => {
    if (!emailContent.trim()) return;

    setAnalyzing(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/refine-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_content: emailContent.trim(),
          original_spam_score: analysisResult?.spam_score
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to refine email');
      }

      const result = await response.json();
      
      // Update the analysis result with refinement data
      if (analysisResult) {
        setAnalysisResult({
          ...analysisResult,
          refinement: {
            success: true,
            refined_email: result.refined_email,
            refined_spam_score: result.refined_spam_score,
            attempts: result.attempts || 0,
            final_score: result.final_score || null
          }
        });
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refine email');
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'accept':
      case 'accept_refined':
        return 'text-green-600 bg-green-100';
      case 'rewrite':
        return 'text-orange-600 bg-orange-100';
      case 'still_risky':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'accept':
        return 'Email is safe to send';
      case 'accept_refined':
        return 'Email refined and now safe to send';
      case 'rewrite':
        return 'Email needs refinement';
      case 'still_risky':
        return 'Email still risky after refinement';
      default:
        return 'Analysis complete';
    }
  };

  const getSpamScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSpamScoreBackground = (score: number) => {
    if (score < 30) return 'bg-green-100';
    if (score < 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const renderEmailForm = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SpamGuard Pro</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-600">Enter your email address to receive a verification code</p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
              required
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Sending Verification Code...
              </>
            ) : (
              'Send Verification Code'
            )}
          </button>
        </form>

        <button
          onClick={() => setCurrentStep('landing')}
          className="w-full mt-4 text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );

  const renderOTPVerification = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SpamGuard Pro</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
          <p className="text-gray-600">
            We've sent a 6-digit code to <br />
            <span className="font-semibold">{formData.email}</span>
          </p>
        </div>

        <form onSubmit={handleOTPSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              id="otp"
              value={formData.otp}
              onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || formData.otp.length !== 6}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              const newOTP = generateOTP();
              setGeneratedOTP(newOTP);
              console.log(`New OTP sent to ${formData.email}: ${newOTP}`);
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Didn't receive the code? Resend
          </button>
        </div>

        <button
          onClick={() => setCurrentStep('email-form')}
          className="w-full mt-4 text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Change Email Address
        </button>
      </div>
    </div>
  );

  const renderEmailAnalysis = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SpamGuard Pro</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Analysis Dashboard</h2>
          <p className="text-gray-600">AI-powered email analysis and automatic refinement</p>
          {userSession && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>Logged in as {userSession.email}</span>
              </div>
              <div className="text-xs text-gray-500">
                Session expires in {Math.max(0, Math.floor((userSession.expiresAt - Date.now()) / (1000 * 60 * 60)))}h {Math.max(0, Math.floor(((userSession.expiresAt - Date.now()) % (1000 * 60 * 60)) / (1000 * 60)))}m
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Email Input Section */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <span>Email Content</span>
              </h3>
              <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Paste your email content here for analysis..."
                disabled={analyzing}
              />
              <div className="flex space-x-3 mt-4">
                <button 
                  onClick={analyzeEmail}
                  disabled={analyzing || !emailContent.trim()}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4" />
                      <span>Analyze Email</span>
                    </>
                  )}
                </button>
                {emailContent.trim() && (
                  <button
                    onClick={() => setEmailContent('')}
                    className="px-4 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            {analysisResult && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  {analysisResult.refinement.success && analysisResult.refinement.refined_email && (
                    <button
                      onClick={() => setEmailContent(analysisResult.refinement.refined_email!)}
                      className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Use Refined Email</span>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(emailContent)}
                    className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Copy Original</span>
                      <Copy className="h-4 w-4 text-gray-500" />
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Results Section */}
          <div className="space-y-6">
            {!analysisResult ? (
              <div className="bg-white border-2 border-dashed border-gray-200 p-8 rounded-xl text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for Analysis</h3>
                <p className="text-gray-500">Paste your email content and click "Analyze Email" to see detailed results</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Spam Score Card */}
                <div className="bg-white border border-gray-200 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Spam Score</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(analysisResult.recommendation)}`}>
                      {getRecommendationText(analysisResult.recommendation)}
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className={`text-4xl font-bold ${getSpamScoreColor(analysisResult.spam_score)}`}>
                      {analysisResult.spam_score}%
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSpamScoreBackground(analysisResult.spam_score)} ${getSpamScoreColor(analysisResult.spam_score)}`}>
                      {analysisResult.spam_score < 30 ? 'Low Risk' : analysisResult.spam_score < 60 ? 'Medium Risk' : 'High Risk'}
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        analysisResult.spam_score < 30 ? 'bg-green-500' : 
                        analysisResult.spam_score < 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(analysisResult.spam_score, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Refinement Results */}
                {analysisResult.refinement.success && analysisResult.refinement.refined_email && (
                  <div className="bg-white border border-gray-200 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <span>AI Refinement</span>
                      </h3>
                      <div className="flex items-center space-x-3">
                        {analysisResult.refinement.attempts > 0 && (
                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {analysisResult.refinement.attempts} attempt{analysisResult.refinement.attempts > 1 ? 's' : ''}
                          </div>
                        )}
                        {analysisResult.refinement.final_score && (
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            analysisResult.refinement.final_score < 60 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                          }`}>
                          {analysisResult.refinement.final_score < 60 ? 'Safe to Send' : 'Still Risky'}
                        </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Refinement Progress */}
                    {analysisResult.refinement.attempts > 0 && (
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-700 font-medium">Refinement Progress:</span>
                          <span className="text-blue-600">
                            {analysisResult.refinement.attempts} attempt{analysisResult.refinement.attempts > 1 ? 's' : ''} completed
                          </span>
                        </div>
                        {analysisResult.refinement.final_score && (
                          <div className="mt-2 text-xs text-blue-600">
                            Final score: {analysisResult.refinement.final_score}% 
                            {analysisResult.refinement.final_score < 60 ? ' ✅ Safe' : ' ⚠️ Still needs work'}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="text-sm text-gray-600 mb-2">Refined Email:</div>
                      <div className="text-gray-900 whitespace-pre-wrap">{analysisResult.refinement.refined_email}</div>
                    </div>

                    {analysisResult.refinement.refined_spam_score && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          New spam score: <span className={`font-medium ${getSpamScoreColor(analysisResult.refinement.refined_spam_score)}`}>
                            {analysisResult.refinement.refined_spam_score}%
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(analysisResult.refinement.refined_email!)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                        >
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Refinement Button */}
                {analysisResult.spam_score >= 60 && !analysisResult.refinement.success && (
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-orange-800">High Spam Risk Detected</span>
                    </div>
                    <p className="text-orange-700 text-sm mb-3">
                      Your email has a high spam probability. Use AI refinement to improve deliverability.
                    </p>
                    <button
                      onClick={refineEmail}
                      disabled={analyzing}
                      className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Refining...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Refine with AI</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Manual Override for Persistent High Scores */}
                {analysisResult.refinement.success && analysisResult.refinement.final_score && analysisResult.refinement.final_score >= 60 && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">AI Refinement Limit Reached</span>
                    </div>
                    <p className="text-yellow-700 text-sm mb-3">
                      The AI has refined your email {analysisResult.refinement.attempts} times, but the spam score remains high ({analysisResult.refinement.final_score}%). 
                      You can manually edit the refined version or use it as-is if you believe it's legitimate.
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEmailContent(analysisResult.refinement.refined_email!)}
                        className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Edit Refined Version</span>
                      </button>
                      <button
                        onClick={() => copyToClipboard(analysisResult.refinement.refined_email!)}
                        className="px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors flex items-center space-x-2"
                      >
                        <Copy className="h-4 w-4" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setCurrentStep('landing');
              setEmailContent('');
              setAnalysisResult(null);
              setError('');
            }}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  if (currentStep === 'email-form') {
    return renderEmailForm();
  }

  if (currentStep === 'otp-verification') {
    return renderOTPVerification();
  }

  if (currentStep === 'email-analysis') {
    return renderEmailAnalysis();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">SpamGuard Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              {userSession ? (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    Welcome back, <span className="font-medium text-gray-900">{userSession.email}</span>
                  </div>
                  <button 
                    onClick={logout}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : null}
              <button 
                onClick={handleAnalyzeClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {userSession ? 'Analyze Email' : 'Get Started'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Email Optimization
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Never Let Your Emails
              <span className="text-blue-600 block">Hit the Spam Folder</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Stop losing opportunities to spam filters. Our AI analyzes your emails, predicts deliverability, 
              and automatically rewrites risky content into professional messages that reach every inbox.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={handleAnalyzeClick}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center group"
              >
                {userSession ? 'Continue Analyzing Emails' : 'Transform Your Emails Now'}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              {userSession && (
                <button 
                  onClick={logout}
                  className="px-6 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 flex items-center space-x-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Switch Account</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Your Emails Are Costing You Money
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every email that hits spam is a lost opportunity, damaged reputation, and wasted effort.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                <Mail className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Lost Opportunities</h3>
              <p className="text-gray-600">
                20-30% of legitimate emails end up in spam folders, meaning your prospects never see your message.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Damaged Reputation</h3>
              <p className="text-gray-600">
                Spam-flagged emails hurt your sender reputation, making future messages even more likely to be blocked.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Wasted Time</h3>
              <p className="text-gray-600">
                Hours spent crafting the perfect email mean nothing if it never reaches your recipient's inbox.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <CheckCircle className="h-4 w-4 mr-2" />
                AI-Powered Solution
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                We Don't Just Detect Problems,
                <span className="text-blue-600 block">We Solve Them</span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-8">
                Unlike basic spam detectors, SpamGuard Pro actively transforms your risky emails into professional, 
                inbox-ready messages using advanced AI technology.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Instant Spam Analysis</h4>
                    <p className="text-gray-600">Our custom ML model analyzes your email and provides an immediate deliverability score.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Rewriting</h4>
                    <p className="text-gray-600">Emails below 80% deliverability are automatically refined by Gemini 1.5 Flash API.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Guaranteed Delivery</h4>
                    <p className="text-gray-600">We keep refining until your email achieves safe deliverability threshold.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-3xl">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Email Analysis</h3>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">Safe to Send</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Deliverability Score</span>
                    <span className="text-sm font-semibold text-green-600">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '94%'}}></div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  ✓ Professional tone • ✓ No spam triggers • ✓ Clear call-to-action
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Copy Email
                  </button>
                  <button className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Download className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Everything You Need to Master Email Delivery
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to ensure your emails reach their destination every time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Instant Analysis</h3>
              <p className="text-gray-600">
                Get immediate spam probability scores with our custom-trained ML model. No waiting, no delays.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Refinement</h3>
              <p className="text-gray-600">
                Powered by Gemini 1.5 Flash API to transform risky emails into professional, deliverable messages.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <RefreshCw className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Validation Loop</h3>
              <p className="text-gray-600">
                Automatic refinement continues until your email achieves the safe deliverability threshold of 80%+.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Side-by-Side Comparison</h3>
              <p className="text-gray-600">
                Compare your original email with the AI-refined version to see exactly what changed and why.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Download className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Export & Copy</h3>
              <p className="text-gray-600">
                Easily copy refined emails to your clipboard or download them for use in your email campaigns.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Email History</h3>
              <p className="text-gray-600">
                Track all your processed emails and their improvement scores to measure your progress over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Trusted by Professionals Who Can't Afford to Miss
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of users who've transformed their email communication and boosted their success rates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Cold Email Marketers</h3>
              <p className="text-gray-600">
                Maximize your outreach ROI by ensuring every prospect receives your carefully crafted message.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Small Business Owners</h3>
              <p className="text-gray-600">
                Connect with customers and partners confidently, knowing your important emails always get delivered.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Freelancers</h3>
              <p className="text-gray-600">
                Land more clients with professional emails that showcase your expertise and attention to detail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center space-x-8 items-center text-white/80">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">10,000+</div>
                <div className="text-sm">Emails Optimized</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">95%</div>
                <div className="text-sm">Improvement Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">2,500+</div>
                <div className="text-sm">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="text-sm">4.9/5 Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Never Lose Another Email to Spam?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of professionals who've transformed their email success with SpamGuard Pro.
          </p>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg inline-block">
            <div className="mb-6">
              <div className="text-4xl font-bold text-gray-900 mb-2">Get Started</div>
              <div className="text-gray-600">Secure email verification required</div>
            </div>
            
            <button 
              onClick={handleAnalyzeClick}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center mx-auto group mb-4"
            >
              Start Optimizing Your Emails Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="text-sm text-gray-500">
              ✓ Secure email verification • ✓ Full access to all features • ✓ Professional results
            </div>
          </div>

          <div className="mt-12 text-gray-500 text-sm">
            Over 2,500 professionals trust SpamGuard Pro to deliver their most important emails.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">SpamGuard Pro</span>
              </div>
              <p className="text-gray-400">
                AI-powered email optimization that ensures your messages reach every inbox.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SpamGuard Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;