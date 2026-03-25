import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CmsAbout {
  heroTitle1: string;
  heroTitle2: string;
  heroDesc: string;
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  valuesTitle: string;
  valuesSubtitle: string;
  values: Array<{ title: string; desc: string }>;
  whyTitle: string;
  whySubtitle: string;
  whyFeatures: string[];
  stats: Array<{ value: string; label: string }>;
  teamTitle: string;
  teamSubtitle: string;
  team: Array<{ name: string; role: string; image?: string }>;
}

export interface CmsService {
  title: string;
  desc: string;
  features: string[];
}

export interface CmsServices {
  heroTitle1: string;
  heroTitle2: string;
  heroDesc: string;
  services: CmsService[];
  ctaTitle: string;
  ctaDesc: string;
}

export interface CmsContact {
  heroTitle1: string;
  heroTitle2: string;
  heroDesc: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  liveChatDesc: string;
}

export interface CmsContent {
  about: CmsAbout;
  services: CmsServices;
  contact: CmsContact;
}

const defaultContent: CmsContent = {
  about: {
    heroTitle1: 'Empowering Dreams,',
    heroTitle2: 'Building Futures',
    heroDesc: 'Since 2010, StudyGlobal has been helping students achieve their dreams of studying at world-class universities. We believe that education has the power to transform lives and create a better world.',
    missionTitle: 'Our Mission',
    missionText: 'To democratize access to quality international education by providing personalized guidance, comprehensive support, and innovative solutions that help students from all backgrounds achieve their academic goals.',
    visionTitle: 'Our Vision',
    visionText: "To be the world's most trusted education consultancy, known for our integrity, expertise, and commitment to student success. We envision a world where every talented student can access the education they deserve.",
    valuesTitle: 'Our Values',
    valuesSubtitle: 'The principles that guide everything we do',
    values: [
      { title: 'Student-First Approach', desc: 'Your success is our priority. We tailor our services to meet your unique needs and aspirations.' },
      { title: 'Excellence', desc: 'We partner with top-ranked universities and maintain the highest standards in our services.' },
      { title: 'Community', desc: 'Join a global network of students and alumni who support each other throughout their journey.' },
      { title: 'Global Perspective', desc: 'We embrace diversity and help students thrive in multicultural environments.' },
    ],
    whyTitle: 'Why Choose StudyGlobal?',
    whySubtitle: "With over a decade of experience, we've helped thousands of students achieve their dreams.",
    whyFeatures: [
      '500+ Partner Universities Worldwide',
      'Personalized University Matching',
      'Scholarship Guidance & Support',
      'Visa Application Assistance',
      'Pre-departure Orientation',
      '24/7 Student Support',
    ],
    stats: [
      { value: '10K+', label: 'Students Placed' },
      { value: '50+', label: 'Countries' },
      { value: '95%', label: 'Success Rate' },
      { value: '14+', label: 'Years Experience' },
    ],
    teamTitle: 'Meet Our Team',
    teamSubtitle: 'Experienced professionals dedicated to your success',
    team: [
      { name: 'Dr. Sarah Chen', role: 'Founder & CEO', image: '' },
      { name: 'Michael Roberts', role: 'Head of Admissions', image: '' },
      { name: 'Priya Sharma', role: 'Scholarship Director', image: '' },
      { name: 'James Wilson', role: 'Visa Specialist', image: '' },
    ],
  },
  services: {
    heroTitle1: 'Comprehensive',
    heroTitle2: 'Study Abroad Services',
    heroDesc: 'From university selection to visa approval, we provide end-to-end support for your international education journey.',
    services: [
      {
        title: 'University Matching',
        desc: 'Our AI-powered system analyzes your profile to recommend universities that best match your academic background, preferences, and career goals.',
        features: ['Profile-based recommendations', 'Program compatibility analysis', 'Admission probability assessment', 'Deadline tracking'],
      },
      {
        title: 'Visa Assistance',
        desc: 'Navigate the complex visa application process with confidence. Our experts guide you through documentation, interviews, and compliance requirements.',
        features: ['Document preparation', 'Interview coaching', 'Application review', 'Status tracking'],
      },
      {
        title: 'Scholarship Guidance',
        desc: 'Discover scholarships you qualify for and get expert help with applications. We help you maximize your chances of securing financial aid.',
        features: ['Scholarship matching', 'Application assistance', 'Essay review', 'Interview preparation'],
      },
      {
        title: 'Application Support',
        desc: 'From personal statements to recommendation letters, we help you craft compelling applications that stand out to admissions committees.',
        features: ['SOP writing assistance', 'Document review', 'Application strategy', 'Timeline management'],
      },
      {
        title: 'Personal Counseling',
        desc: 'Get one-on-one guidance from experienced counselors who understand your unique situation and can provide tailored advice.',
        features: ['Career counseling', 'Course selection', 'University shortlisting', 'Decision support'],
      },
      {
        title: 'Pre-departure Support',
        desc: 'Prepare for your journey with comprehensive pre-departure orientation covering accommodation, travel, and cultural adaptation.',
        features: ['Accommodation guidance', 'Travel planning', 'Cultural orientation', 'Student community access'],
      },
      {
        title: 'Accommodation Assistance',
        desc: 'Find safe, comfortable, and affordable housing near your university with our accommodation support services.',
        features: ['Housing options', 'Roommate matching', 'Lease review', 'Area guidance'],
      },
      {
        title: 'Test Preparation',
        desc: 'Access resources and guidance for standardized tests like IELTS, TOEFL, GRE, and GMAT to achieve your target scores.',
        features: ['Study materials', 'Practice tests', 'Score improvement tips', 'Test booking assistance'],
      },
    ],
    ctaTitle: 'Ready to Get Started?',
    ctaDesc: 'Create your free account and start exploring your options today.',
  },
  contact: {
    heroTitle1: 'Get in',
    heroTitle2: 'Touch',
    heroDesc: 'Have questions about studying abroad? Our team is here to help you every step of the way.',
    email: 'info@studyglobal.com',
    phone: '+1 (555) 123-4567',
    address: '123 Education Street, New York, NY 10001',
    hours: 'Mon - Fri: 9:00 AM - 6:00 PM',
    liveChatDesc: 'Chat with our advisors in real-time for instant support.',
  },
};

const CMS_STORAGE_KEY = 'studyglobal_cms_content';

interface CmsContextValue {
  content: CmsContent;
  updateAbout: (data: CmsAbout) => void;
  updateServices: (data: CmsServices) => void;
  updateContact: (data: CmsContact) => void;
  resetToDefaults: () => void;
}

const CmsContext = createContext<CmsContextValue | null>(null);

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<CmsContent>(() => {
    try {
      const stored = localStorage.getItem(CMS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Deep merge: preserve nested arrays from stored data,
        // but fill in any top-level keys missing from the stored version.
        return {
          about: {
            ...defaultContent.about,
            ...parsed.about,
            // Arrays must be explicitly preserved — spread would overwrite with undefined
            values: Array.isArray(parsed.about?.values) ? parsed.about.values : defaultContent.about.values,
            whyFeatures: Array.isArray(parsed.about?.whyFeatures) ? parsed.about.whyFeatures : defaultContent.about.whyFeatures,
            stats: Array.isArray(parsed.about?.stats) ? parsed.about.stats : defaultContent.about.stats,
            team: Array.isArray(parsed.about?.team) ? parsed.about.team : defaultContent.about.team,
          },
          services: {
            ...defaultContent.services,
            ...parsed.services,
            services: Array.isArray(parsed.services?.services) ? parsed.services.services : defaultContent.services.services,
          },
          contact: { ...defaultContent.contact, ...parsed.contact },
        };
      }
    } catch {
      return defaultContent;
    }
    return defaultContent;
  });

  useEffect(() => {
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(content));
  }, [content]);

  const updateAbout = (data: CmsAbout) => {
    setContent(prev => ({ ...prev, about: data }));
  };

  const updateServices = (data: CmsServices) => {
    setContent(prev => ({ ...prev, services: data }));
  };

  const updateContact = (data: CmsContact) => {
    setContent(prev => ({ ...prev, contact: data }));
  };

  const resetToDefaults = () => {
    setContent(defaultContent);
    localStorage.removeItem(CMS_STORAGE_KEY);
  };

  return (
    <CmsContext.Provider value={{ content, updateAbout, updateServices, updateContact, resetToDefaults }}>
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = (): CmsContextValue => {
  const ctx = useContext(CmsContext);
  if (!ctx) throw new Error('useCms must be used within CmsProvider');
  return ctx;
};

