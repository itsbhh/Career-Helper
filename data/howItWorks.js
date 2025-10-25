import { UserPlus, FileEdit, Users, LineChart } from "lucide-react";

export const howItWorks = [
  {
    title: "Personalized Onboarding",
    description:
      "Start by sharing your skills, goals, and experience to let Avia AI craft a personalized career journey for you.",
    icon: <UserPlus className="w-8 h-8 text-primary" />,
  },
  {
    title: "Build Your Career Profile",
    description:
      "Generate powerful, ATS-friendly resumes and tailored cover letters that highlight your strengths.",
    icon: <FileEdit className="w-8 h-8 text-primary" />,
  },
  {
    title: "Master Every Interview",
    description:
      "Enhance your confidence with AI-driven mock interviews, instant feedback, and real-world role simulations.",
    icon: <Users className="w-8 h-8 text-primary" />,
  },
  {
    title: "Analyze & Grow",
    description:
      "Track your performance metrics, identify improvement areas, and stay updated with actionable insights.",
    icon: <LineChart className="w-8 h-8 text-primary" />,
  },
];
