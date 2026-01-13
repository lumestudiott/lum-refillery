import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import GiftSubscription from './pages/GiftSubscription';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import GiftSuccess from './pages/GiftSuccess';
import Sustainability from './pages/Sustainability';
import Dashboard from './pages/Dashboard';
import SampleHauls from './pages/SampleHauls';
import OurMission from './pages/OurMission';
import SourcingStandards from './pages/SourcingStandards';
import ImpactReport from './pages/ImpactReport';
import Careers from './pages/Careers';
import Quiz from './pages/Quiz';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gift" element={<GiftSubscription />} />
        <Route path="/sample-hauls" element={<SampleHauls />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/gift-success" element={<GiftSuccess />} />
        <Route path="/sustainability" element={<Sustainability />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/our-mission" element={<OurMission />} />
        <Route path="/sourcing-standards" element={<SourcingStandards />} />
        <Route path="/impact-report" element={<ImpactReport />} />
        <Route path="/careers" element={<Careers />} />
      </Routes>
    </>
  );
}

export default App;
