import { UserPlus, FileEdit, Users, LineChart } from "lucide-react";

export const howItWorks = [
  {
    title: "Personalized Onboarding",
    description: "Provide your industry and expertise to receive tailored career insights.",
    icon: <UserPlus className="w-8 h-8 text-primary" />,
  },
  {
    title: "Build Your Career Documents",
    description: "Generate ATS-friendly resumes and compelling cover letters with AI assistance.",
    icon: <FileEdit className="w-8 h-8 text-primary" />,
  },
  {
    title: "Ace Your Interviews",
    description:
      "Enhance your skills with AI-driven mock interviews customized for your role.",
    icon: <Users className="w-8 h-8 text-primary" />,
  },
  {
    title: "Analyze and Improve",
    description: "Track your progress with detailed performance insights and analytics.",
    icon: <LineChart className="w-8 h-8 text-primary" />,
  },
];
