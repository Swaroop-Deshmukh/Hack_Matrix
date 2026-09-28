import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  Menu, 
  X, 
  BarChart3, 
  TrendingDown, 
  Recycle, 
  Users, 
  BookOpen, 
  Calculator, 
  CheckCircle2,
  ArrowRight,
  LogIn,
  User,
  Lock,
  Layers,
  GitBranch,
  Zap,
  FileText
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Waste Calculator State
  const [household, setHousehold] = useState(1);
  const [foodWaste, setFoodWaste] = useState(2.0);
  const [plastic, setPlastic] = useState(1.0);
  const [paper, setPaper] = useState(1.0);
  const [showResults, setShowResults] = useState(false);

  const dailyWaste = foodWaste + plastic + paper + 0.5;
  const monthlyWaste = dailyWaste * 30;
  const yearlyWaste = dailyWaste * 365;

  const compostingReduction = foodWaste * 0.8 * 365;
  const recyclingReduction = (plastic + paper + 0.5) * 0.7 * 365;
  const totalReduction = dailyWaste * 0.3 * 365;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-green-50/60 text-slate-800 font-sans selection:bg-green-500/20 selection:text-green-900 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <Leaf className="h-8 w-8 text-green-600" />
              <div className="flex flex-col">
                <span className="font-bold text-xl text-green-800 tracking-tight">WasteManagement.in</span>
                <span className="text-[10px] text-green-600 font-medium -mt-1">Powered by RE:FLOW-X Platform</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#about" className="text-sm font-medium text-slate-700 hover:text-green-600 transition-colors">About</a>
              <a href="#waste-types" className="text-sm font-medium text-slate-700 hover:text-green-600 transition-colors">Waste Types</a>
              <a href="#reduce" className="text-sm font-medium text-slate-700 hover:text-green-600 transition-colors">Reduce & Reuse</a>
              <a href="#calculator" className="text-sm font-medium text-slate-700 hover:text-green-600 transition-colors">Impact Calculator</a>
              <a href="#workflow" className="text-sm font-medium text-slate-700 hover:text-green-600 transition-colors">Industrial Engine</a>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In / Portal
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Launch Engine Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-slate-700 hover:text-green-600 hover:bg-green-50"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-3 border-t border-slate-200 space-y-2">
              <a href="#about" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-green-50">About</a>
              <a href="#waste-types" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-green-50">Waste Types</a>
              <a href="#reduce" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-green-50">Reduce</a>
              <a href="#calculator" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-green-50">Calculator</a>
              <a href="#workflow" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-green-50">Industrial Engine</a>
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-green-700 font-bold bg-green-100"
              >
                Launch Engine Demo
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="wm-hero-bg text-white py-20 lg:py-32 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-6">
            India's Leading Environmental Awareness & Circular Engine
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight max-w-4xl mx-auto">
            Transform India's Future Through Smart Waste Management
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-95">
            Join the movement for sustainable living and environmental conservation across India with integrated AI optimization and circular reuse.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-lg text-base transition-all duration-300 shadow-xl flex items-center justify-center gap-2"
            >
              <span>Explore Platform Engine</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowLoginModal(true)}
              className="w-full sm:w-auto bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/40 font-semibold px-8 py-3.5 rounded-lg text-base transition-all"
            >
              Sign In to Account
            </button>
          </div>
        </div>
      </section>

      {/* Key Statistics Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">India's Waste Challenge</h2>
            <p className="text-lg text-slate-600 max-w-4xl mx-auto leading-relaxed">
              India generates over 62 million tonnes of waste annually, with only 75% collected and 22% processed. 
              Urban areas produce 90% more waste than rural regions. Plastic waste contributes to 9% of total waste, 
              creating severe environmental challenges. Poor waste management leads to soil contamination, water pollution, 
              and greenhouse gas emissions. Every citizen can make a difference through proper segregation, recycling, 
              and industrial reuse.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100 hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-green-800 mb-2">62M</h3>
              <h4 className="text-lg font-semibold text-slate-800 mb-2">Tonnes Annual Waste</h4>
              <p className="text-slate-600 text-sm leading-relaxed">India generates over 62 million tonnes of waste annually, requiring immediate action.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100 hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <TrendingDown className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-green-800 mb-2">75%</h3>
              <h4 className="text-lg font-semibold text-slate-800 mb-2">Collection Rate</h4>
              <p className="text-slate-600 text-sm leading-relaxed">Only 75% of waste is collected, leaving 25% improperly disposed in the environment.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100 hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <Recycle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-green-800 mb-2">22%</h3>
              <h4 className="text-lg font-semibold text-slate-800 mb-2">Processing Rate</h4>
              <p className="text-slate-600 text-sm leading-relaxed">Just 22% of collected waste gets processed, highlighting the need for better infrastructure.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100 hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-green-800 mb-2">90%</h3>
              <h4 className="text-lg font-semibold text-slate-800 mb-2">Urban Impact</h4>
              <p className="text-slate-600 text-sm leading-relaxed">Urban areas produce 90% more waste than rural regions, creating concentrated challenges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Action Areas Section */}
      <section id="waste-types" className="py-20 bg-green-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">Take Action Today</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Every individual can contribute to India's environmental transformation through informed action and sustainable practices.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div id="reduce" className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-4 text-white">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Learn About Waste</h3>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                Understanding different waste types forms the foundation of effective management. Organic waste comprises 50% of household waste and can be composted easily. Recyclable materials like paper, plastic, and metal reduce landfill burden significantly.
              </p>
              <button onClick={() => navigate('/materials')} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm">
                Explore Material Registry
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-4 text-white">
                <TrendingDown className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Reduce & Reuse</h3>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                Waste reduction starts with conscious consumption choices and lifestyle modifications. Buying in bulk reduces packaging waste while supporting local businesses. Reusing containers, bags, and industrial byproducts extends product lifecycles.
              </p>
              <button onClick={() => navigate('/feasibility')} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm">
                View Reuse Feasibility
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-4 text-white">
                <Recycle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Recycle Responsibly</h3>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                Proper recycling transforms waste into valuable resources for new products. Clean segregation ensures materials maintain quality for processing facilities. Plastic bottles become clothing fibers, and fly ash becomes cement replacements.
              </p>
              <button onClick={() => navigate('/optimize')} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm">
                Run Optimization Solver
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Calculator Section */}
      <section id="calculator" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">Calculate Your Impact</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Understand your household's waste generation and discover your potential for environmental impact reduction.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl border border-slate-200 p-8">
            <div className="flex items-center space-x-3 mb-6 border-b pb-4">
              <Calculator className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-bold text-slate-800">Interactive Waste Calculator</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Household Size (Persons)</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={household} 
                    onChange={(e) => setHousehold(parseFloat(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Food Waste (kg/day)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={foodWaste} 
                    onChange={(e) => setFoodWaste(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Plastic Waste (kg/day)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={plastic} 
                    onChange={(e) => setPlastic(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Paper Waste (kg/day)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={paper} 
                    onChange={(e) => setPaper(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>

                <button 
                  onClick={() => setShowResults(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm shadow-md"
                >
                  Calculate Impact
                </button>
              </div>

              <div className={`bg-green-50/80 rounded-xl p-6 space-y-4 border border-green-200/80 ${showResults ? 'block' : 'hidden md:block'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-green-700" />
                  <h4 className="font-bold text-green-800">Your Calculated Impact</h4>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm flex justify-between items-center">
                    <span className="text-slate-600">Daily Total Waste</span>
                    <span className="font-bold text-slate-800">{dailyWaste.toFixed(1)} kg</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm flex justify-between items-center">
                    <span className="text-slate-600">Monthly Total Waste</span>
                    <span className="font-bold text-slate-800">{monthlyWaste.toFixed(1)} kg</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm flex justify-between items-center">
                    <span className="text-slate-600">Yearly Total Waste</span>
                    <span className="font-bold text-slate-800">{yearlyWaste.toFixed(1)} kg</span>
                  </div>
                </div>

                <div className="border-t border-green-200 pt-4 space-y-1.5 text-xs text-slate-700">
                  <h5 className="font-bold text-green-800 text-sm mb-2">Annual Reduction Potential:</h5>
                  <div className="flex justify-between">
                    <span>Composting Potential:</span>
                    <span className="font-semibold text-green-700">-{compostingReduction.toFixed(0)} kg/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recycling Potential:</span>
                    <span className="font-semibold text-green-700">-{recyclingReduction.toFixed(0)} kg/year</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-200/60 font-bold text-slate-900 text-sm">
                    <span>Total Diversion:</span>
                    <span className="text-green-800">-{totalReduction.toFixed(0)} kg/year</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: END-TO-END INDUSTRIAL ARCHITECTURE WORKFLOW */}
      <section id="workflow" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold uppercase tracking-wider">
              Industrial RE:FLOW-X Platform Integration
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              Integrated Industrial Circular Architecture
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Track industrial fly ash, blast furnace slag, and mining waste streams from characterization to optimal destination allocation and LCA audit reports.
            </p>
          </div>

          {/* Workflow Step Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700 text-center space-y-2 hover:border-green-500 transition-all">
              <Layers className="w-7 h-7 text-green-400 mx-auto" />
              <span className="font-bold text-slate-100 block text-sm">1. Registry & Passport</span>
              <span className="text-xs text-slate-400 block">XRF Chemical Composition & Physical Evidence</span>
            </div>

            <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700 text-center space-y-2 hover:border-green-500 transition-all">
              <GitBranch className="w-7 h-7 text-green-400 mx-auto" />
              <span className="font-bold text-slate-100 block text-sm">2. Technical Screening</span>
              <span className="text-xs text-slate-400 block">Feasibility Pathway Rule Checks</span>
            </div>

            <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700 text-center space-y-2 hover:border-green-500 transition-all">
              <Zap className="w-7 h-7 text-green-400 mx-auto" />
              <span className="font-bold text-slate-100 block text-sm">3. Optimization Engine</span>
              <span className="text-xs text-slate-400 block">OR-Tools CP-SAT Constrained Solver</span>
            </div>

            <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700 text-center space-y-2 hover:border-green-500 transition-all">
              <BarChart3 className="w-7 h-7 text-green-400 mx-auto" />
              <span className="font-bold text-slate-100 block text-sm">4. Impact Ledger</span>
              <span className="text-xs text-slate-400 block">LCA Emissions & Net Cost Accounting</span>
            </div>

            <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700 text-center space-y-2 hover:border-green-500 transition-all">
              <FileText className="w-7 h-7 text-green-400 mx-auto" />
              <span className="font-bold text-slate-100 block text-sm">5. Decision Hub</span>
              <span className="text-xs text-slate-400 block">Dispatch Approvals & Downloadable Reports</span>
            </div>
          </div>

          {/* Live Metrics Band */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 p-6 bg-slate-800/90 rounded-xl border border-green-500/40 text-center">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase">Total Industrial Waste</span>
              <span className="text-2xl font-bold text-white block">12,450 t</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-green-400 uppercase font-semibold">Diverted Reuse Quantity</span>
              <span className="text-2xl font-bold text-green-400 block">9,820 t (78.9%)</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase">Disposal Quantity</span>
              <span className="text-2xl font-bold text-slate-200 block">2,630 t</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase">Net Cost Savings</span>
              <span className="text-2xl font-bold text-white block">₹16.08 Lakhs</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-green-400 uppercase font-semibold">Emissions Avoided</span>
              <span className="text-2xl font-bold text-green-400 block">-1,284 tCO₂e</span>
            </div>
          </div>

          <div className="text-center text-sm text-green-400 font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" /> Better industrial resource use. Lower logistics costs. Verified environmental impact.
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-green-700 via-green-800 to-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Leaf className="h-16 w-16 mx-auto text-green-300" />
          <h2 className="text-3xl md:text-4xl font-bold">Join India's Environmental Movement</h2>
          <p className="text-xl max-w-3xl mx-auto opacity-90 leading-relaxed">
            Be part of the solution. Start your waste management journey today and contribute to a cleaner, 
            more sustainable India for future generations.
          </p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-lg text-lg transition-all shadow-xl inline-flex items-center gap-2"
          >
            <span>Launch Industrial Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Leaf className="h-8 w-8 text-green-400" />
                <span className="font-bold text-xl">WasteManagement.in</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                WasteManagement.in serves as India's comprehensive environmental awareness platform, 
                promoting sustainable waste management practices nationwide alongside RE:FLOW-X industrial optimization engine.
              </p>
              <p className="text-xs text-slate-400">Owned by Scalium.in</p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-green-400">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <a href="#about" className="block text-slate-300 hover:text-green-400 transition-colors">About Waste Management</a>
                <a href="#waste-types" className="block text-slate-300 hover:text-green-400 transition-colors">Types of Waste</a>
                <a href="#reduce" className="block text-slate-300 hover:text-green-400 transition-colors">Reduction Strategies</a>
                <a href="#calculator" className="block text-slate-300 hover:text-green-400 transition-colors">Impact Calculator</a>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-green-400">Industrial Engine</h3>
              <div className="space-y-2 text-sm">
                <span onClick={() => navigate('/dashboard')} className="block text-slate-300 hover:text-green-400 transition-colors cursor-pointer">Executive Dashboard</span>
                <span onClick={() => navigate('/materials')} className="block text-slate-300 hover:text-green-400 transition-colors cursor-pointer">Materials Registry</span>
                <span onClick={() => navigate('/optimize')} className="block text-slate-300 hover:text-green-400 transition-colors cursor-pointer">CP-SAT Optimization</span>
                <span onClick={() => navigate('/impact')} className="block text-slate-300 hover:text-green-400 transition-colors cursor-pointer">LCA Impact Ledger</span>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-green-400">Contact Information</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p>701, Stellar Tower, Chembur East, Mumbai, Maharashtra 400071</p>
                <p>+91 8369848475</p>
                <p>info@wastemanagement.in</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-400">
            © 2026 WasteManagement.in & RE:FLOW-X Platform. All rights reserved.
          </div>
        </div>
      </footer>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative space-y-5 border border-slate-200">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800">Sign In to Platform</h3>
              <p className="text-xs text-slate-500">Access RE:FLOW-X Industrial Decision Engine</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1 text-xs">Email / Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter email or username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1 text-xs">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all shadow-md"
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/dashboard');
                }}
                className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
              >
                Continue as Guest / Demo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
