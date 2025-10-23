"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Subscribe from "@/components/Subscribe";

/* ---------- Reusable: Section Title ---------- */
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-3xl font-bold text-center text-brand-dark mb-12">{children}</h2>
);

/* ---------- Reusable: Scroll-reveal wrapper ---------- */
function FadeIn({
  children,
  className = "",
  from = "up", // "up" | "down" | "left" | "right" | "none"
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  from?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hiddenMap: Record<string, string> = {
    up: "opacity-0 translate-y-4",
    down: "opacity-0 -translate-y-4",
    left: "opacity-0 -translate-x-4",
    right: "opacity-0 translate-x-4",
    none: "opacity-0",
  };

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={[
        "transition-all duration-700 ease-out will-change-transform",
        visible ? "opacity-100 translate-x-0 translate-y-0" : hiddenMap[from],
        className,
      ].join(" ")}
    >
      {children}
    </Tag>
  );
}

/* ---------- Reusable: Floating animated shapes (background) ---------- */
function FloatingShapes({
  color = "white",
  opacity = 0.3,
  border = true,
}: {
  color?: string; // any valid CSS color
  opacity?: number; // 0..1
  border?: boolean; // use stroked outlines
}) {
  const stroke = border ? `${color}` : "transparent";
  const fill = border ? "transparent" : color;
  const base = { opacity };

  return (
    <>
      {/* Big circle (top-left) */}
      <motion.div
        className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full"
        style={{
          border: border ? `4px solid ${stroke}` : undefined,
          backgroundColor: !border ? fill : undefined,
          opacity: base.opacity,
        }}
        animate={{
          scale: [0.92, 1.06, 0.92],
          x: [0, 18, 0],
          y: [0, 18, 0],
          opacity: [opacity * 0.7, opacity, opacity * 0.7],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Big circle (bottom-right) */}
      <motion.div
        className="pointer-events-none absolute -bottom-24 -right-16 w-80 h-80 rounded-full"
        style={{
          border: border ? `4px solid ${stroke}` : undefined,
          backgroundColor: !border ? fill : undefined,
          opacity: base.opacity,
        }}
        animate={{
          scale: [1.06, 0.92, 1.06],
          x: [0, -18, 0],
          y: [0, -18, 0],
          opacity: [opacity * 0.7, opacity, opacity * 0.7],
        }}
        transition={{ duration: 10.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Square/diamond */}
      <motion.div
        className="pointer-events-none absolute top-1/3 left-1/2 w-40 h-40"
        style={{
          border: border ? `4px solid ${stroke}80` : undefined,
          backgroundColor: !border ? `${fill}33` : undefined,
          opacity: base.opacity * 0.7,
        }}
        animate={{
          rotate: [0, 35, 0],
          scale: [0.85, 1.1, 0.85],
          x: [-28, 28, -28],
          y: [-18, 18, -18],
          opacity: [opacity * 0.4, opacity * 0.7, opacity * 0.4],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Curvy line */}
      <motion.svg
        className="pointer-events-none absolute -top-10 right-1/3 w-56 h-56"
        viewBox="0 0 100 100"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeOpacity={opacity}
        animate={{
          rotate: [0, 12, -12, 0],
          x: [0, 14, -14, 0],
          y: [0, -10, 10, 0],
        }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M10 50 Q25 10, 50 50 T90 50" />
      </motion.svg>
    </>
  );
}

/* ---------- Icons ---------- */
const ReadPolicyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

/* ---------- Sections ---------- */

const WhoWeAre = () => {
  const keyStrengths = [
    {
      title: "Governance & Research",
      description:
        "Independent opinions, research, and data on corporate governance and ESG issues.",
      icon: (
        <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      title: "Technology Platforms",
      description: "Cloud-based platforms like SMART and ADRIAN for stewardship and data analysis.",
      icon: (
        <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l2 1" />
        </svg>
      ),
    },
    {
      title: "ESG Integration",
      description:
        "Guiding hedge funds, AIFs, and PE Funds in their ESG assessments and investment decisions.",
      icon: (
        <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="sustain" className="relative py-24 bg-white overflow-hidden">
      {/* Soft gradient panel */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-gray-50 to-white" />
      </div>
      {/* Floating shapes (white strokes) */}
      <FloatingShapes color="rgba(13,148,136,0.9)" opacity={0.25} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Main Text */}
          <FadeIn from="up" className="space-y-6">
            <h2 className="text-3xl font-bold text-brand-dark tracking-tight sm:text-4xl">Who We Are</h2>
            <div className="text-lg text-gray-600 space-y-4">
              <p>
                IiAS Sustainability Solutions Limited (IiAS Sustain) is an ESG Rating Provider dedicated to delivering high-quality ESG ratings, benchmarks, data, and insights on companies’ environmental, social, and governance disclosures and practices. IiAS Sustain is registered with the Securities and Exchange Board of India (SEBI) as a Category II ESG Rating Provider (ERP) and is a wholly owned subsidiary of Institutional Investor Advisory Services India Limited (IiAS).


              </p>
              <p>
                IiAS Sustain’s objective is to enable investors, companies, and regulators to integrate ESG considerations into decision-making through transparent, data-driven, and independent evaluations. Our ESG ratings and benchmarks are designed to provide comparability across companies and sectors, while our analytical opinions help stakeholders interpret ESG disclosures in the context of best practices, regulatory requirements, and global standards.

              </p>
              <p>
                By combining IiAS’ deep expertise in corporate governance with rigorous ESG frameworks, IiAS Sustain is uniquely positioned to support the Indian market in strengthening accountability, improving disclosure quality, and advancing the sustainability agenda.

              </p>
            </div>
            <p className="text-sm text-gray-500 pt-4 border-t border-gray-200">
            </p>
          </FadeIn>

          {/* Right Column: Key Strengths */}
          <div className="space-y-8">
            {keyStrengths.map((strength, i) => (
              <FadeIn key={strength.title} from="right" delay={100 * i} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-brand-surface text-brand-primary shadow-sm">
                    {strength.icon}
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-brand-dark">{strength.title}</h3>
                  <p className="mt-1 text-base text-gray-600">{strength.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const OurPeople = () => {
  const management = [
    {
      name: "Amit Tandon",
      title: "Founder and Managing Director",
      imageUrl: "/about/team/amit-tandon.jpeg",
      description:
        "Prior to starting IiAS, Amit was the Managing Director of Fitch Ratings (till June 2011), where he was responsible for its Indian and Sri Lankan businesses. While at Fitch he was closely associated with the development of the debt market. Prior to joining Fitch, Amit was Senior Vice President and Head of Corporate Banking at ICICI Securities. He has a Bachelors in Economics from St. Stephens College, MBA from FMS Delhi, and an MPhil from the University of Cambridge.",
    },
    {
      name: "Hetal Dalal",
      title: "President and Chief Operating Officer",
      imageUrl: "/about/team/hetal-dalal.jpg",
      description:
        "Prior to joining IiAS, Hetal Dalal was Director, Ratings Business Development at CRISIL Limited. She held leadership roles across several business verticals during her stint at CRISIL. Her experience spans analytics, operations, and business development. Hetal holds an MMS (Finance) degree from NMIMS and is a Chartered Accountant.",
    }    
  ];

  const boardOfDirectors = [
    {
      name: "Amit Tandon",
      title: "Founder and Managing Director",
      imageUrl: "/about/team/amit-tandon.jpeg",
      description:
        "Led Fitch Ratings in India & Sri Lanka; prior leadership roles at ICICI Securities across capital markets, M&A, and advisory businesses.",
    },
    {
      name: "Dr. Shubhada Rao",
      title: "Independent, Non-Executive Director",
      imageUrl: "/about/team/shubhada-rao.jpg",
      description:
        "Founder of QuantEco; ex-Chief Economist at YES Bank. Renowned for forward-looking economic commentary. Gold medalist and PhD in Economics, University of Mumbai.",
    },
    {
      name: "Hetal Dalal",
      title: "President and Chief Operating Officer",
      imageUrl: "/about/team/hetal-dalal.jpg",
      description:
        "Prior to joining IiAS, Hetal Dalal was Director, Ratings Business Development at CRISIL Limited. She held leadership roles across several business verticals during her stint at CRISIL. Her experience spans analytics, operations, and business development. Hetal holds an MMS (Finance) degree from NMIMS and is a Chartered Accountant.",
    }
  ];

  return (
    <section id="our-people" className="relative py-20 bg-gray-50 overflow-hidden">
      {/* Subtle dot grid already present earlier — add floating shapes with lighter opacity */}
      <FloatingShapes color="rgba(13,148,136,0.9)" opacity={0.18} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn from="up" className="text-center">
          <h2 className="text-3xl font-bold text-brand-dark tracking-tight sm:text-4xl">Our People</h2>
        </FadeIn>

        {/* Management */}
        <div className="mt-16">
          <FadeIn from="left">
            <h3 className="text-2xl font-semibold text-brand-dark mb-8">Management</h3>
          </FadeIn>
          <div className="space-y-8">
            {management.map((member, i) => (
              <FadeIn
                key={member.name}
                from="up"
                delay={100 * i}
                className="bg-white p-6 rounded-lg border border-gray-200 transition
                           hover:shadow-lg hover:-translate-y-0.5 active:translate-y-[1px]
                           grid md:grid-cols-12 gap-6 items-center"
              >
                <div className="md:col-span-3 flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-36 h-36 rounded-full object-cover ring-1 ring-gray-200"
                  />
                </div>
                <div className="md:col-span-9">
                  <h4 className="text-xl font-bold text-brand-dark">{member.name}</h4>
                  <p className="text-md font-medium text-gray-600 mb-3">{member.title}</p>
                  <p className="text-gray-600 leading-relaxed text-sm">{member.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Board of Directors */}
        <div className="mt-16">
          <FadeIn from="left">
            <h3 className="text-2xl font-semibold text-brand-dark mb-8">Board of Directors</h3>
          </FadeIn>
        </div>
        <div className="space-y-8">
          {boardOfDirectors.map((member, i) => (
            <FadeIn
              key={member.name}
              from="up"
              delay={100 * i}
              className="bg-white p-6 rounded-lg border border-gray-200 transition
                         hover:shadow-lg hover:-translate-y-0.5 active:translate-y-[1px]
                         grid md:grid-cols-12 gap-6 items-center"
            >
              <div className="md:col-span-3 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="w-36 h-36 rounded-full object-cover ring-1 ring-gray-200"
                />
              </div>
              <div className="md:col-span-9">
                <h4 className="text-xl font-bold text-brand-dark">{member.name}</h4>
                <p className="text-md font-medium text-gray-600 mb-3">{member.title}</p>
                <p className="text-gray-600 leading-relaxed text-sm">{member.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

type Policy = { title: string; description: string; href: string };

const Policies = () => {
  const policies: Policy[] = [
    {
      title: "IiAS Voting Recommendations' Methodology and Process",
      description:
        "A brief note outlining the method and process that IiAS’ analysts follow in arriving at voting recommendations.",
      href: "/about/policies/IiAS Voting Recommendations’ Methodology and Process.pdf",
    },
    {
      title: "Securities Trading Policy",
      description:
        "IiAS is a proxy advisory firm dedicated to providing market participants with data, research and opinions on corporate governance issues. Our voting advisory reports recommend how investors should vote on shareholder resolutions – these do not carry any buy or sell recommendations.",
      href: "/about/policies/Securities Trading Policy.pdf",
    },
    {
      title: "Anti-Money Laundering Policy",
      description:
        "As per SEBI AML guidelines, IiAS has adopted this AML Policy, commensurate with its business and clients.",
      href: "/about/policies/Anti-Money Laundering Policy.pdf",
    },
    {
      title: "Website Privacy Policy",
      description:
        "In general, this Website may be visited without revealing information about yourself. Some features may require limited personal information.",
      href: "/about/policies/Website Privacy Policy.pdf",
    },
    {
      title: "Policy on dealing with Complaints and Grievances received from Market Participants",
      description:
        "The process to be followed in dealing with complaints and grievances received from market participants.",
      href: "/about/policies/Policy on dealing with Complaints and Grievances received from Market Participants.pdf",
    },
    {
      title: "Review and Oversight Committee",
      description:
        "The Review and Oversight Committee (ROC) has been constituted to oversee the voting recommendations published by IiAS.",
      href: "/about/policies/Review and Oversight Committee.pdf",
    },
    {
      title: "Policy on Communication with Investors, Companies, Media and Regulators",
      description:
        "The basis of IiAS’ communication with such stakeholders, with specific context to its voting advisory and engagement services.",
      href: "/about/policies/Policy on Communication with Investors, Companies, Media and Regulators.pdf",
    },
    {
      title: "Policy on Prevention of Sexual Harassment",
      description:
        "IiAS is an equal employment opportunity company and is committed to creating a healthy working environment.",
      href: "/about/policies/Policy on Prevention of Sexual Harassment.pdf",
    },
    {
      title: "Code of Conduct",
      description:
        "Guidelines for business conduct required of IiAS’ personnel.",
      href: "/about/policies/Code of Conduct.pdf",
    },
    {
      title: "Nomination and Remuneration Policy",
      description:
        "Guide on appointment, remuneration, removal and evaluation of performance of Directors, KMP and employees.",
      href: "/about/policies/Nomination and Remuneration Policy.pdf",
    },
    {
      title: "Investor Charter in respect of Research Analyst (RA)",
      description:
        "Investor Charter in respect of Research Analyst (RA) with reference to SEBI Circular dated 13 December 2021.",
      href: "/about/policies/Investor Charter in respect of Research Analyst (RA).pdf",
    },
    {
      title: "Management of Conflicts of Interest Policy",
      description:
        "Preserving research integrity and preventing conflicts of interest related to IiAS’ voting advisory services.",
      href: "/about/policies/Management of Conflicts of Interest Policy.pdf",
    },
  ];

  return (
    <section id="policies" className="relative py-20 bg-white overflow-hidden">
      {/* Soft left arc */}
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1/3 -z-10">
        <div className="h-full bg-gray-50 rounded-r-full" />
      </div>
      {/* Floating shapes with subtle gray/teal blend */}
      <FloatingShapes color="rgba(14,165,233,0.9)" opacity={0.22} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn from="up">
          <SectionTitle>Policies</SectionTitle>
        </FadeIn>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {policies.map((policy, i) => {
              const encoded = encodeURI(policy.href);
              return (
                <FadeIn
                  key={policy.title}
                  from="up"
                  delay={80 * i}
                  className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition
                             hover:shadow-md hover:-translate-y-0.5"
                >
                  <h3 className="text-lg font-semibold text-brand-dark">{policy.title}</h3>
                  <p className="mt-2 text-gray-600">{policy.description}</p>
                  <div className="mt-4">
                    <a
                      href={encoded}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center text-teal-700 font-semibold"
                    >
                      Read Policy
                      <span className="ml-1 inline-flex transform transition-transform group-hover:translate-x-0.5">
                        <ReadPolicyIcon />
                      </span>
                    </a>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

type DisclosureItem = {
  title: string;
  description: string;
  href?: string;
};

const Disclosures = () => {
  const disclosures: DisclosureItem[] = [
    {
      title: "IiAS Securities Holding Statement",
      description:
        "IiAS may, from time to time, own nominal shares in companies that form a part of its coverage list for its voting advisory services. Holdings are generally one equity share per listed company under coverage; quantities may vary due to corporate actions. The holdings are updated at regular intervals.",
      href: "/about/disclosures/IiAS Securities Holding Statement.pdf",
    },
    {
      title: "Appointment Letter for Independent Directors",
      description: "Letter of appointment issued to independent directors.",
      href: "/about/disclosures/Appointment Letter for Independent Directors.pdf",
    },
    {
      title: "IiAS Shareholders",
      description:
        "Our shareholders include: Aditya Birla Sunlife AMC Limited, Axis Bank, Fitch Group Inc., HDFC Bank, ICICI Prudential Life Insurance, Kotak Mahindra Bank, RBL Bank, Tata Investment Corporation, UTI Asset Management and Yes Bank. In addition, the following individuals own equity shares in the company: Amit Tandon, Anil Singhvi, Deven Sharma, Hetal Dalal, and R Jayakumar.",
    },
    {
      title: "Annual Return",
      description:
        "Annual return required pursuant to sub-section (1) of section 92 of Companies Act, 2013 and sub-rule (1) of rule 11 of the Companies (Management and Administration) Rules, 2014.",
    },
    {
      title: "Disclosure relating to complaints received",
      description:
        "Investors complaints data disclosed monthly under SEBI circular no. SEBI/HO/IMD/IMD-II CIS/P/CIR/2021/0685.",
      href: "/about/disclosures/Disclosure relating to complaints received.pdf",
    },
  ];

  return (
    <section id="disclosures" className="relative bg-gray-50 py-20 overflow-hidden">
      {/* Floating shapes (even lighter so text stands out) */}
      <FloatingShapes color="rgba(20,184,166,0.9)" opacity={0.16} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn from="up">
          <SectionTitle>Disclosures</SectionTitle>
        </FadeIn>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {disclosures.map((item, i) => (
              <FadeIn
                key={item.title}
                from="up"
                delay={80 * i}
                className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition
                           hover:shadow-md hover:-translate-y-0.5"
              >
                <h3 className="text-lg font-semibold text-brand-dark">{item.title}</h3>
                <p className="mt-2 text-gray-600">{item.description}</p>
                {item.href && (
                  <div className="mt-4">
                    <a
                      href={encodeURI(item.href)}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center text-teal-700 font-semibold"
                    >
                      Read More
                      <span className="ml-1 inline-flex transform transition-transform group-hover:translate-x-0.5">
                        <ReadPolicyIcon />
                      </span>
                    </a>
                  </div>
                )}
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const TermsAndConditions = () => {
  const termsItems = [
    {
      title: "Terms of Use",
      description:
        "These terms govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms and conditions.",
    },
    {
      title: "Privacy Policy",
      description:
        "We are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you use our services.",
    },
    {
      title: "Data Protection",
      description:
        "We implement appropriate security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.",
    },
    {
      title: "Service Limitations",
      description:
        "Our ESG ratings and recommendations are provided for informational purposes. Investment decisions should be made based on your own analysis and professional advice.",
    },
  ];

  return (
    <section id="terms-conditions" className="relative py-20 bg-white overflow-hidden">
      {/* Floating shapes */}
      <FloatingShapes color="rgba(99,102,241,0.9)" opacity={0.18} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn from="up">
          <SectionTitle>Terms & Conditions</SectionTitle>
        </FadeIn>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {termsItems.map((item, i) => (
              <FadeIn
                key={item.title}
                from="up"
                delay={80 * i}
                className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition
                           hover:shadow-md hover:-translate-y-0.5"
              >
                <h3 className="text-lg font-semibold text-brand-dark">{item.title}</h3>
                <p className="mt-2 text-gray-600">{item.description}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------- Page ---------- */
export default function AboutPage() {
  return (
    <>
      <WhoWeAre />
      <OurPeople />
      <Policies />
      <Disclosures />
      <TermsAndConditions />
      <Subscribe/>
    </>
  );
}
