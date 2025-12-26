
import React, { useState, useEffect, useCallback } from 'react';
import { generateImageFromText, editExistingImage } from './services/geminiService';
import { GeneratedImage, AspectRatio, Page } from './types';
import { ThemeToggle } from './components/ThemeToggle';
import { ImageCard } from './components/ImageCard';

// Using the user-provided image as the site logo
const SITE_LOGO = "https://lh3.googleusercontent.com/d/1C4Yl5C0W9_59S_6z9e_T_3Z9jX8V1S6A";

const App: React.FC = () => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activePage, setActivePage] = useState<Page>('home');

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Load state from local storage
  useEffect(() => {
    const saved = localStorage.getItem('text2image-images');
    if (saved) {
      try {
        setImages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved images");
      }
    }
  }, []);

  // Save state to local storage
  useEffect(() => {
    localStorage.setItem('text2image-images', JSON.stringify(images));
  }, [images]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const url = await generateImageFromText(prompt, aspectRatio);
      const newImage: GeneratedImage = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        prompt,
        timestamp: Date.now(),
      };
      setImages(prev => [newImage, ...prev]);
      setPrompt('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate image. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async (id: string, editPrompt: string) => {
    const targetImage = images.find(img => img.id === id);
    if (!targetImage) return;

    setIsEditingId(id);
    setError(null);

    try {
      const newUrl = await editExistingImage(editPrompt, targetImage.url);
      const updatedImage: GeneratedImage = {
        ...targetImage,
        url: newUrl,
        prompt: `${targetImage.prompt} (Edit: ${editPrompt})`,
        timestamp: Date.now(),
      };
      setImages(prev => prev.map(img => img.id === id ? updatedImage : img));
    } catch (err: any) {
      setError(`Editing failed: ${err.message}`);
    } finally {
      setIsEditingId(null);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmittingContact(false);
    setContactSuccess(true);
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setContactSuccess(false), 5000);
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your generation history?')) {
      setImages([]);
    }
  };

  const renderHome = () => (
    <div className="animate-fade-in">
      <section className="mb-20 text-center">
        <h2 className="text-3xl md:text-5xl font-orbitron font-bold mb-4">
          Imagine. <span className="text-neon-blue">Visualize.</span> Perfect.
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto mb-10">
          Generate stunning high-fidelity images using the power of Gemini 2.5 Flash.
        </p>

        <div className={`glass p-4 rounded-3xl border ${theme === 'dark' ? 'border-white/10' : 'border-black/5'} shadow-2xl max-w-3xl mx-auto`}>
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            <div className="relative group">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want... (e.g., 'A cyberpunk street at night with neon signs and rain')"
                className={`w-full bg-transparent rounded-2xl p-6 text-lg min-h-[120px] resize-none focus:outline-none border ${theme === 'dark' ? 'border-white/10 focus:border-neon-blue/50 text-white' : 'border-black/10 focus:border-blue-500 text-black'} transition-all`}
              />
              <div className="absolute top-4 right-4 text-xs font-mono text-gray-500 uppercase tracking-widest pointer-events-none">Prompt</div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 px-2">
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      aspectRatio === ratio
                        ? 'bg-neon-blue text-black border-neon-blue shadow-[0_0_15px_rgba(0,242,255,0.3)]'
                        : theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20' : 'bg-black/5 border-black/10 text-gray-600 hover:border-black/20'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className={`relative overflow-hidden group px-8 py-3 rounded-2xl font-orbitron font-bold text-sm tracking-widest transition-all ${
                  isGenerating || !prompt.trim() 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-[0_0_20px_rgba(0,242,255,0.2)] hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] hover:scale-105'
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      GENERATING...
                    </>
                  ) : (
                    <>
                      GENERATE
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </>
                  )}
                </span>
                {!isGenerating && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-400 text-sm animate-fade-in flex items-center justify-center gap-2 max-w-xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
      </section>

      <section className="mt-20">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-orbitron font-bold tracking-wider flex items-center gap-3">
            <span className="w-1 h-6 bg-neon-blue rounded-full" />
            GALLERY
            <span className="text-xs font-normal text-gray-500 ml-2 font-sans">({images.length} creations)</span>
          </h3>
          {images.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors uppercase tracking-widest font-bold"
            >
              Clear History
            </button>
          )}
        </div>

        {images.length === 0 ? (
          <div className="py-20 text-center glass rounded-3xl border border-white/5">
            <div className="mb-6 opacity-20 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 italic">No creations yet. Start by describing your vision above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onEdit={handleEdit}
                isEditing={isEditingId === image.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const renderAbout = () => (
    <div className="animate-fade-in py-12 px-6 glass rounded-3xl border border-white/10 max-w-3xl mx-auto">
      <h2 className="text-4xl font-orbitron font-bold mb-8 text-neon-blue text-center">About Text 2 Image</h2>
      <div className="space-y-6 text-lg leading-relaxed text-gray-400">
        <p>
          Welcome to <span className="text-white font-bold">Text 2 Image Studio</span>, the ultimate destination for AI-driven creativity. 
          Our platform leverages the cutting-edge <span className="text-neon-purple font-bold">Gemini 2.5 Flash</span> technology to transform 
          simple text descriptions into breathtaking visual art.
        </p>
        <p>
          Whether you're a concept artist looking for inspiration, a developer needing quick assets, or just a dreamer 
          wanting to see your thoughts manifest, Text 2 Image provides the tools to bridge the gap between imagination 
          and reality.
        </p>
        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 mt-8">
          <h3 className="font-orbitron text-white mb-4">Core Technology</h3>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Gemini 2.5 Flash Image Generation</li>
            <li>Real-time Image In-painting & Editing</li>
            <li>Multi-aspect ratio support</li>
            <li>Privacy-focused local storage for history</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="animate-fade-in py-12 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-orbitron font-bold mb-4 text-neon-purple">Get In Touch</h2>
        <p className="text-gray-400">Have questions or feedback? Our digital doors are always open.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-neon-blue transition-colors h-full">
            <div className="w-12 h-12 bg-neon-blue/20 rounded-full flex items-center justify-center mb-6 text-neon-blue">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-orbitron font-bold text-white mb-2">Direct Contact</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Email</p>
                <p className="text-neon-blue">hello@text2image.ai</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Support</p>
                <p className="text-gray-300">24/7 AI-Assisted Chat</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="glass p-8 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
            {contactSuccess ? (
              <div className="py-12 text-center animate-fade-in">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-orbitron font-bold text-white mb-2">Message Received!</h3>
                <p className="text-gray-400">Thank you for reaching out. Our team will get back to you shortly.</p>
                <button 
                  onClick={() => setContactSuccess(false)}
                  className="mt-8 text-sm font-bold text-neon-blue uppercase tracking-widest hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-orbitron font-bold text-gray-500 uppercase tracking-widest">Name</label>
                    <input
                      required
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-blue transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-orbitron font-bold text-gray-500 uppercase tracking-widest">Email</label>
                    <input
                      required
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-blue transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-orbitron font-bold text-gray-500 uppercase tracking-widest">Subject</label>
                  <input
                    required
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="Feedback regarding generation quality"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-blue transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-orbitron font-bold text-gray-500 uppercase tracking-widest">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Tell us what's on your mind..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-blue transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className={`w-full py-4 rounded-xl font-orbitron font-bold text-sm tracking-widest transition-all flex items-center justify-center gap-3 ${
                    isSubmittingContact
                      ? 'bg-gray-800 text-gray-500'
                      : 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-lg hover:shadow-neon-purple/20'
                  }`}
                >
                  {isSubmittingContact ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />SENDING...</>
                  ) : (
                    <>SEND MESSAGE<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLegalPage = (title: string, content: React.ReactNode) => (
    <div className="animate-fade-in py-12 px-6 glass rounded-3xl border border-white/10 max-w-4xl mx-auto">
      <h2 className="text-4xl font-orbitron font-bold mb-8 text-neon-blue text-center">{title}</h2>
      <div className={`prose prose-invert max-w-none text-gray-400 space-y-6`}>
        {content}
      </div>
    </div>
  );

  const renderPrivacy = () => renderLegalPage("Privacy Policy", (
    <>
      <p>Last Updated: October 2023</p>
      <p>At Text 2 Image Studio, we value your privacy. This policy outlines how we handle data.</p>
      <h3 className="text-white font-bold text-xl mt-8">1. Information We Collect</h3>
      <p>We do not store your images on our servers. All generation history is saved locally in your browser's local storage. We use industry-standard APIs like Google Gemini to process your prompts.</p>
      <h3 className="text-white font-bold text-xl mt-8">2. Use of Data</h3>
      <p>Your text prompts are sent to our AI partners for image generation. We do not sell or share your prompt history with third-party advertisers.</p>
      <h3 className="text-white font-bold text-xl mt-8">3. Local Storage</h3>
      <p>To provide a persistent experience without account creation, we use your browser's local storage. You can clear this at any time using the "Clear History" button.</p>
    </>
  ));

  const renderTerms = () => renderLegalPage("Terms & Condition", (
    <>
      <p>By using Text 2 Image Studio, you agree to the following terms:</p>
      <h3 className="text-white font-bold text-xl mt-8">1. Acceptable Use</h3>
      <p>You agree not to use the service to generate harmful, illegal, or sexually explicit content. We reserve the right to block users who violate these guidelines via API level filtering.</p>
      <h3 className="text-white font-bold text-xl mt-8">2. Ownership</h3>
      <p>Images generated belong to you, subject to the terms of the underlying AI model provider (Google GenAI). Please check Google's generative AI terms for full copyright details.</p>
      <h3 className="text-white font-bold text-xl mt-8">3. Service Availability</h3>
      <p>This is an AI-powered experimental tool. We do not guarantee 100% uptime or specific generation qualities.</p>
    </>
  ));

  const renderDisclaimer = () => renderLegalPage("Disclaimer", (
    <>
      <div className="bg-neon-purple/10 border border-neon-purple/30 p-8 rounded-2xl">
        <h3 className="text-neon-purple font-bold text-xl mb-4">AI-Generated Content Notice</h3>
        <p className="italic">All images displayed on this site are generated by artificial intelligence. They do not represent real people, places, or events unless explicitly stated.</p>
      </div>
      <p className="mt-8">The images and text provided by Text 2 Image Studio are for informational and entertainment purposes only. The accuracy, completeness, or reliability of any generation cannot be guaranteed.</p>
      <p>We are not liable for any damages arising from your use of the generated content or reliance on information provided through the service.</p>
    </>
  ));

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 font-sans ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 ${theme === 'dark' ? 'bg-neon-blue' : 'bg-blue-400'}`} />
        <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-10 ${theme === 'dark' ? 'bg-neon-purple' : 'bg-purple-400'}`} />
      </div>

      <header className="relative z-20 py-6 px-4 md:px-8 flex flex-col md:flex-row gap-6 justify-between items-center max-w-7xl mx-auto border-b border-white/5 w-full bg-black/20 backdrop-blur-md md:bg-transparent">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePage('home')}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple p-[1.5px] shadow-[0_0_15px_rgba(0,242,255,0.4)]">
            <img 
              src={SITE_LOGO} 
              className="w-full h-full rounded-full object-cover" 
              alt="Logo" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <h1 className="text-2xl font-orbitron font-bold tracking-tighter bg-gradient-to-r from-neon-blue to-white bg-clip-text text-transparent">
            TEXT 2 IMAGE <span className="text-xs font-normal tracking-widest block text-gray-500 uppercase">STUDIO</span>
          </h1>
        </div>

        <nav className="flex items-center gap-6 md:gap-8 text-sm font-orbitron font-bold tracking-widest">
          {(['home', 'about', 'contact'] as Page[]).map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`transition-all uppercase hover:text-neon-blue ${activePage === page ? 'text-neon-blue scale-110' : 'text-gray-500'}`}
            >
              {page}
            </button>
          ))}
        </nav>

        <ThemeToggle theme={theme} toggle={toggleTheme} />
      </header>

      <main className="relative z-10 flex-grow max-w-7xl mx-auto px-4 py-12 w-full min-h-[calc(100vh-400px)]">
        {activePage === 'home' && renderHome()}
        {activePage === 'about' && renderAbout()}
        {activePage === 'contact' && renderContact()}
        {activePage === 'privacy' && renderPrivacy()}
        {activePage === 'terms' && renderTerms()}
        {activePage === 'disclaimer' && renderDisclaimer()}
      </main>

      {/* Modern Enhanced Footer */}
      <footer className="relative z-20 mt-20 border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePage('home')}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple p-[1px]">
                <img 
                  src={SITE_LOGO} 
                  className="w-full h-full rounded-full object-cover" 
                  alt="Footer Logo" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <span className="text-lg font-orbitron font-bold tracking-tighter text-white">TEXT 2 IMAGE</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Empowering the next generation of digital artists with cutting-edge generative AI. Bridge the gap between imagination and pixels.
            </p>
            <div className="flex gap-4">
              {['twitter', 'discord', 'github', 'instagram'].map(platform => (
                <a key={platform} href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-neon-blue/20 hover:text-neon-blue transition-all border border-white/5">
                  <span className="sr-only">{platform}</span>
                  <div className="w-4 h-4 bg-current opacity-20" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-white font-orbitron text-xs font-bold tracking-widest uppercase">Explore</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => setActivePage('home')} className="text-gray-500 hover:text-neon-blue transition-colors">Generator</button></li>
              <li><button onClick={() => setActivePage('about')} className="text-gray-500 hover:text-neon-blue transition-colors">Our Mission</button></li>
              <li><button onClick={() => setActivePage('contact')} className="text-gray-500 hover:text-neon-blue transition-colors">Get Support</button></li>
              <li><a href="#" className="text-gray-500 hover:text-neon-blue transition-colors">API Docs</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-6">
            <h4 className="text-white font-orbitron text-xs font-bold tracking-widest uppercase">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => setActivePage('privacy')} className={`transition-colors ${activePage === 'privacy' ? 'text-neon-blue' : 'text-gray-500 hover:text-neon-blue'}`}>Privacy Policy</button></li>
              <li><button onClick={() => setActivePage('terms')} className={`transition-colors ${activePage === 'terms' ? 'text-neon-blue' : 'text-gray-500 hover:text-neon-blue'}`}>Terms & Service</button></li>
              <li><button onClick={() => setActivePage('disclaimer')} className={`transition-colors ${activePage === 'disclaimer' ? 'text-neon-blue' : 'text-gray-500 hover:text-neon-blue'}`}>Disclaimer</button></li>
              <li><a href="#" className="text-gray-500 hover:text-neon-blue transition-colors">Cookie Settings</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-6">
            <h4 className="text-white font-orbitron text-xs font-bold tracking-widest uppercase">Stay Updated</h4>
            <p className="text-gray-500 text-sm italic">Join our newsletter for AI tips and new features.</p>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }}>
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-neon-purple transition-colors"
              />
              <button className="bg-neon-purple px-3 py-2 rounded-lg text-xs font-bold text-white hover:bg-neon-purple/80 transition-all uppercase tracking-tighter">Join</button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/5 py-8 px-6 text-center">
          <p className="text-gray-600 text-[10px] tracking-[0.3em] uppercase font-bold">
            &copy; 2024 Text 2 Image Studio • Crafted with <span className="text-neon-pink">❤</span> for the AI community
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
