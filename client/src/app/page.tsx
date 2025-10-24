"use client";
import { Button } from "@/components/ui/button";
import { Play, Users, Video, Zap, Heart, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router =useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
      {/* Hero Section with Animated Background Video */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/streammix.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
        />

        {/* Gradient Overlay (Animated) */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-blue-900/30 to-cyan-900/40 animate-gradient-x blur-[2px]"></div>

        {/* Subtle noise texture layer */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/noisy-grid.png')]"></div>

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-5xl px-4 fade-in">
          <div className="aspect-video rounded-2xl shadow-2xl overflow-hidden border border-purple-500/30 relative group">
            {/* Overlay and Title */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/30 group-hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <Play className="w-10 h-10 text-white ml-2" fill="white" />
                </div>
                <div className="space-y-2 animate-fade-in-slow">
                  <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                    Welcome to{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 animate-gradient-text">
                      StreamMix
                    </span>
                  </h1>
                  <p className="text-xl text-gray-300 drop-shadow-md">
                    Your Ultimate Livestreaming Platform
                  </p>
                </div>
              </div>
            </div>

            {/* Animated gradient light sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 via-transparent to-blue-600/40 animate-pulse"></div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mt-8 fade-in-up">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/50 transition-all hover:scale-105"
             onClick={() => router.push("/login")}
            >
              Start Streaming Now
            </Button> 
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-purple-500 text-purple-300 hover:bg-purple-500/10 px-8 py-6 text-lg rounded-xl transition-all hover:scale-105"
            >
              Explore Channels
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Why Choose StreamMix?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the next generation of livestreaming with cutting-edge
              features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-8 rounded-2xl border border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300 group">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Crystal Clear Streaming
              </h3>
              <p className="text-gray-400">
                Stream in up to 4K quality with ultra-low latency technology for
                the best viewer experience
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-8 rounded-2xl border border-blue-500/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300 group">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Growing Community
              </h3>
              <p className="text-gray-400">
                Connect with millions of viewers and streamers from around the
                world
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-8 rounded-2xl border border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300 group">
              <div className="w-16 h-16 bg-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Instant Go-Live
              </h3>
              <p className="text-gray-400">
                Start streaming in seconds with our intuitive setup and powerful
                tools
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-pink-900/40 to-purple-900/40 p-8 rounded-2xl border border-pink-500/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300 group">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Monetization Made Easy
              </h3>
              <p className="text-gray-400">
                Multiple ways to earn: subscriptions, donations, ads, and
                exclusive content
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 p-8 rounded-2xl border border-cyan-500/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300 group">
              <div className="w-16 h-16 bg-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Advanced Analytics
              </h3>
              <p className="text-gray-400">
                Track your growth with detailed insights and real-time
                statistics
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-8 rounded-2xl border border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300 group">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Multi-Platform Support
              </h3>
              <p className="text-gray-400">
                Stream simultaneously to multiple platforms and reach wider
                audiences
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-y border-purple-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-2">
              <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                10M+
              </div>
              <div className="text-xl text-gray-400">Active Streamers</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                100M+
              </div>
              <div className="text-xl text-gray-400">Monthly Viewers</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                24/7
              </div>
              <div className="text-xl text-gray-400">Live Content</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-400">
            Join thousands of creators who are already building their
            communities
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/50 transition-all hover:scale-105"
              onClick={() => router.push("/login")}
            >
              Sign Up Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-purple-500 text-purple-300 hover:bg-purple-500/10 px-12 py-6 text-lg rounded-xl transition-all hover:scale-105"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
