import React from 'react';

const AboutCreator = () => {
  return (
    <section className="bg-slate-900 py-12 px-6 rounded-2xl border border-slate-800 my-8">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
        {/* Creator Image */}
        <div className="flex-shrink-0">
          <img 
            src="https://www.talariharsha.in/profile.jpg" aa link ivvandi
            alt="Talari Harsha Vardhan Babu - Founder of CrackIt AI" 
            className="w-40 h-40 rounded-full border-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] object-cover"
          />
        </div>

        {/* Creator Info */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold text-white mb-2">
            Meet the Creator
          </h2>
          <h3 className="text-xl text-blue-400 font-semibold mb-4">
            Talari Harsha <span className="text-slate-400 text-sm font-normal">| Founder & Lead Developer</span>
          </h3>
          <p className="text-slate-300 leading-relaxed mb-6">
            I built CrackIt AI with a single vision: to bridge the gap between academic preparation and professional placement. By combining Google's Gemini AI with an adaptive learning engine, my goal is to provide every aspirant with a personalized, 24/7 technical mentor. 
          </p>
          
          {/* Social Links */}
          <div className="flex justify-center md:justify-start gap-4">
            <a href="https://www.linkedin.com/in/talari-harsha-vardhan-babu-1176b7384/" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              Connect on LinkedIn
            </a>
            <a href="https://github.com/harshavardhantalari6" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors border border-slate-700">
              View GitHub
            </a>
            <a href="https://www.instagram.com/just_harxha/" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white font-medium rounded-lg transition-opacity shadow-lg shadow-pink-500/30">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCreator;