import React from 'react';
import Hero from '../components/landing/Hero';
import CapabilitiesStrip from '../components/landing/CapabilitiesStrip';
import TemplateShowcase from '../components/landing/TemplateShowcase';
import HowItWorks from '../components/landing/HowItWorks';
import StudentCTA from '../components/landing/StudentCTA';
import FactualStatsSection from '../components/landing/FactualStatsSection';

const Home = () => {
  return (
    <div className="w-full bg-slate-50 overflow-hidden">
      {/* 1. Institutional Hero with Real A4 Composition */}
      <Hero />

      {/* 2. Capability Badges Strip */}
      <CapabilitiesStrip />

      {/* 3. Academic Template Showcase */}
      <TemplateShowcase />

      {/* 4. 3-Step Workflow */}
      <HowItWorks />

      {/* 5. Student Account Benefit Card */}
      <StudentCTA />

      {/* 6. Factual Capability Statistics */}
      <FactualStatsSection />
    </div>
  );
};

export default Home;
