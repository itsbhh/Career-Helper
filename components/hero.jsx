"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="w-full pt-24 md:pt-32 pb-10">
      <div className="text-center space-y-4 md:space-y-6 mx-auto max-w-[800px]">
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold gradient-title animate-gradient">
          Your AI Career Partner for Smarter Growth & Success
        </h1>

        <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
          Transform your professional journey with intelligent insights,
          personalized coaching, and AI-powered career tools designed for your
          success.
        </p>

        <div className="flex justify-center space-x-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>

          {/* EduWizard  */}
          <Link href="https://eduwizard.netlify.app">
            <Button size="lg" variant="outline" className="px-8">
              Go to EduWizard
            </Button>
          </Link>

          {/* JobHub */}
          <Link href="https://jobhub12.netlify.app/" target="_blank">
            <Button size="lg" variant="outline" className="px-8">
              Go to JobHub
            </Button>
          </Link>
        </div>

        <div className="hero-image-wrapper mt-5 md:mt-0">
          <div ref={imageRef} className="hero-image">
            <Image
              src="/banner.jpeg"
              width={1080}
              height={720}
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
