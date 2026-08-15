import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, GraduationCap, Award, FileText, ArrowRight,
  Code2, Sparkles, Mail, Globe, Heart
} from 'lucide-react';
import { FaLinkedin, FaFacebook, FaInstagram, FaGithub } from 'react-icons/fa';

export const AboutPage = () => {
  const [imgError, setImgError] = useState(false);

  const developerInfo = {
    name: "Md. Ali Azgor",
    role: "Full Stack Developer",
    university: "International Islamic University Chittagong",
    project: "IIUC Cover Page Platform",
    description:
      "Developer of the IIUC Cover Page platform, focused on building modern academic tools that help students create professional documents easily.",
    image: "/developer.png",
    skills: ["React", "Node.js", "Express", "MongoDB", "Google OAuth", "Vite", "Tailwind CSS"],
    socials: [
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/ali-azgor/",
        icon: FaLinkedin,
        color: "hover:bg-[#0077B5] hover:text-white text-[#0077B5]",
      },
      {
        name: "GitHub",
        url: "https://github.com/",
        icon: FaGithub,
        color: "hover:bg-slate-900 hover:text-white text-slate-800",
      },
      {
        name: "Facebook",
        url: "https://www.facebook.com/ali.azgor.92317/",
        icon: FaFacebook,
        color: "hover:bg-[#1877F2] hover:text-white text-[#1877F2]",
      },
      {
        name: "Instagram",
        url: "https://www.instagram.com/aliazgor_/",
        icon: FaInstagram,
        color: "hover:bg-gradient-to-br hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white text-[#DD2A7B]",
      },
      {
        name: "Email",
        url: "mailto:ali.azgor0810@gmail.com",
        icon: Mail,
        color: "hover:bg-[#006A4E] hover:text-white text-[#006A4E]",
      },
    ],
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50 overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#006A4E]/10 border border-[#006A4E]/20 rounded-full text-xs font-black text-[#006A4E]">
            <ShieldCheck className="h-4 w-4" />
            <span>Official IIUC Academic Utility</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            About IIUC Cover Page Platform
          </h1>
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            The IIUC Cover Page Platform is an institutional academic document creation system engineered for students, faculty members, and departments at International Islamic University Chittagong (IIUC).
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInUp">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006A4E] flex items-center justify-center font-bold">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-base font-black text-slate-900">Pixel-Perfect A4 Format</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Strictly adheres to official IIUC academic guidelines for individual assignments, lab reports, lab index tables, and group capstone projects.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#172554] flex items-center justify-center font-bold">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-black text-slate-900">Google OAuth Verification</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Restricted to verified IIUC academic email domains (@ugrad.iiuc.ac.bd, @student.iiuc.ac.bd, @iiuc.ac.bd) for instant profile hydration.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-base font-black text-slate-900">Cloud History & Auto Drafts</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Automatically saves draft progress every 30 seconds and maintains encrypted cloud generation history for instant reopening.
            </p>
          </div>
        </div>

        {/* University Commitment Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-[#172554] to-[#006A4E] text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden animate-fadeInUp">
          <div className="space-y-3 z-10">
            <span className="text-xs font-black text-[#F3CF45] uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Built for IIUC Excellence
            </span>
            <h2 className="text-2xl font-black">Empowering Academic Submissions</h2>
            <p className="text-xs text-slate-300 font-medium max-w-xl leading-relaxed">
              Eliminate formatting errors, inconsistent logos, and manual alignment issues forever. Create professional PDF and JPG covers in seconds.
            </p>
          </div>
          <Link
            to="/create"
            className="btn-iiuc-gold text-xs !py-3.5 !px-6 flex items-center gap-2 shrink-0 z-10 cursor-pointer"
          >
            <span>Launch Document Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* ── MEET THE DEVELOPER SECTION ─────────────────────── */}
        <div className="space-y-8 pt-6 border-t border-slate-200/80 animate-fadeInUp">
          {/* Developer Section Header */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#006A4E] rounded-full text-xs font-black border border-emerald-200/60 uppercase tracking-wider">
              <Code2 className="h-3.5 w-3.5 text-[#006A4E]" />
              <span>Developer Spotlight</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Meet the Developer
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 max-w-xl mx-auto leading-relaxed">
              Designed and developed with passion to simplify academic document creation for IIUC students.
            </p>
          </div>

          {/* Premium Developer Profile Glass Card */}
          <div className="max-w-4xl mx-auto bg-white/85 backdrop-blur-md border border-white/60 shadow-xl rounded-3xl p-6 sm:p-10 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
            {/* Subtle IIUC Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#006A4E]/10 via-[#F3CF45]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
              
              {/* Profile Image / Avatar Container */}
              <div className="shrink-0 flex flex-col items-center space-y-3">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#006A4E] via-[#172554] to-[#007B5E] rounded-full blur-md opacity-40 group-hover:opacity-75 transition duration-500" />
                  
                  {!imgError ? (
                    <img
                      src={developerInfo.image}
                      alt={developerInfo.name}
                      onError={() => setImgError(true)}
                      className="relative w-36 h-36 rounded-full object-cover border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-[#006A4E] via-[#004d38] to-[#172554] text-white font-black text-3xl flex items-center justify-center border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300">
                      MAA
                    </div>
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-[11px] font-black rounded-full border border-slate-200">
                  <GraduationCap className="h-3.5 w-3.5 text-[#006A4E]" />
                  <span>CSE Undergraduate</span>
                </div>
              </div>

              {/* Information Content */}
              <div className="flex-1 space-y-5 text-center md:text-left">
                <div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        {developerInfo.name}
                      </h3>
                      <p className="text-sm font-extrabold text-[#006A4E]">
                        {developerInfo.role}
                      </p>
                    </div>

                    <span className="inline-flex items-center justify-center gap-1 text-[11px] font-black text-[#172554] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60 shrink-0">
                      <Globe className="h-3.5 w-3.5 text-[#172554]" />
                      <span>{developerInfo.project}</span>
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    {developerInfo.university}
                  </p>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {developerInfo.description}
                </p>

                {/* Built With Technology Stack */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                    Built With Technology Stack
                  </span>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    {developerInfo.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-emerald-50/80 text-[#006A4E] border border-emerald-200/60 rounded-full text-xs font-extrabold shadow-xs hover:bg-[#006A4E] hover:text-white transition-all cursor-default"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                    Connect & Social Links
                  </span>
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    {developerInfo.socials.map((soc, idx) => {
                      const IconComponent = soc.icon;
                      return (
                        <a
                          key={idx}
                          href={soc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2.5 rounded-xl bg-slate-100 border border-slate-200 transition-all duration-300 hover:scale-110 hover:shadow-md ${soc.color}`}
                          aria-label={soc.name}
                          title={soc.name}
                        >
                          <IconComponent className="h-4.5 w-4.5" />
                        </a>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
