import React from 'react';
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
  RefreshCw
} from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">InboxGuard</span>
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Start Free Trial
            </button>
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
              <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center group">
                Transform Your Emails Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="text-gray-600 px-8 py-4 rounded-xl font-semibold text-lg hover:text-gray-900 transition-colors flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Demo
              </button>
            </div>

            <div className="mt-12 text-sm text-gray-500">
              ✓ No credit card required • ✓ Free 7-day trial • ✓ Setup in 30 seconds
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
                Unlike basic spam detectors, InboxGuard actively transforms your risky emails into professional, 
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
            Join thousands of professionals who've transformed their email success with InboxGuard.
          </p>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg inline-block">
            <div className="mb-6">
              <div className="text-4xl font-bold text-gray-900 mb-2">Free Trial</div>
              <div className="text-gray-600">No credit card required • Cancel anytime</div>
            </div>
            
            <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center mx-auto group mb-4">
              Start Optimizing Your Emails Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="text-sm text-gray-500">
              ✓ 7-day free trial • ✓ Full access to all features • ✓ No setup fees
            </div>
          </div>

          <div className="mt-12 text-gray-500 text-sm">
            Over 2,500 professionals trust InboxGuard to deliver their most important emails.
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
                <span className="text-2xl font-bold">InboxGuard</span>
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
            <p>&copy; 2025 InboxGuard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;