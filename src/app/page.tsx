export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Cpu,
  Zap,
  Droplets,
  Home as HomeIcon,
  Wrench,
  ArrowRight,
  ShieldCheck,
  Clock,
  Users
} from "lucide-react";

// Types for joined query output
interface PostWithProfile {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  status: string;
  profiles: {
    full_name: string | null;
  } | null;
}

// Map categories to modern Lucide icons
function getCategoryIcon(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes("generator")) {
    return <Cpu className="h-5 w-5 text-amber-500" />;
  }
  if (normalized.includes("electric") || normalized.includes("power")) {
    return <Zap className="h-5 w-5 text-yellow-500" />;
  }
  if (normalized.includes("pump") || normalized.includes("water") || normalized.includes("plumbing")) {
    return <Droplets className="h-5 w-5 text-blue-500" />;
  }
  if (normalized.includes("building") || normalized.includes("house") || normalized.includes("structure")) {
    return <HomeIcon className="h-5 w-5 text-emerald-500" />;
  }
  return <Wrench className="h-5 w-5 text-zinc-500" />;
}

export default async function Home() {
  let posts: PostWithProfile[] = [];
  let fetchError = false;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        content,
        category,
        created_at,
        status,
        profiles (
          full_name
        )
      `)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching approved posts:", error);
      fetchError = true;
    } else {
      posts = (data || []) as unknown as PostWithProfile[];
    }
  } catch (err) {
    console.error("Database connection failure:", err);
    fetchError = true;
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-24 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
            <span className="px-3 py-1 text-xs font-semibold tracking-wider text-primary bg-primary/10 rounded-full mb-6">
              ENGINEERING &amp; MAINTENANCE SERVICES
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
              Keep Your Home &amp; Facility running at peak performance
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
              Godteck provides professional, reliable, and high-quality maintenance services for Generators, Pumping Machines, Electrical systems, and Building structures.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <Link href="/join" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-base font-semibold shadow-lg hover:scale-[1.02] transition-transform">
                  Join the Community Waitlist
                </Button>
              </Link>
              <a href="#services" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 text-base font-semibold hover:scale-[1.02] transition-transform">
                  Our Services
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-zinc-50 dark:bg-zinc-950 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              Our Professional Services
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              Expert solutions engineered to guarantee safety, quality, and durability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service 1: Generators */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="p-3 bg-amber-500/10 rounded-lg w-fit">
                  <Cpu className="h-6 w-6 text-amber-500" />
                </div>
                <CardTitle className="mt-4 text-xl">Generator Maintenance</CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400 mt-2">
                  Complete servicing, regular maintenance, diagnostic checks, and precise repairs to keep backup systems functional when you need them most.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Service 2: Pumping Machines */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg w-fit">
                  <Droplets className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="mt-4 text-xl">Pumping Machines</CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400 mt-2">
                  Installation, water pump maintenance, plumbing lines check, and pressure calibration to ensure seamless and uninterrupted water distribution.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Service 3: Electrical Services */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg w-fit">
                  <Zap className="h-6 w-6 text-yellow-500" />
                </div>
                <CardTitle className="mt-4 text-xl">Electrical Systems</CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400 mt-2">
                  Professional wiring, panel upgrades, troubleshooting electrical faults, and smart fixture installation following robust safety standards.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Service 4: Building Maintenance */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg w-fit">
                  <HomeIcon className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle className="mt-4 text-xl">Building Maintenance</CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400 mt-2">
                  Comprehensive structural audits, painting, facility refurbishments, and general handyman operations to preserve property value and beauty.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-4">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Fully Certified Engineers</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                All repairs and checks are completed by heavily vetted, certified field specialists.
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Rapid Turnaround</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                We respect your schedules and aim for prompt diagnostics and fast resolving times.
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Community Driven</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Engage in discussions, browse knowledge resources, and join certified experts on our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              Recent Community Activity
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              Stay updated with top tips, questions, and solutions from our approved community members.
            </p>
          </div>

          {fetchError ? (
            <div className="text-center p-12 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900 max-w-xl mx-auto">
              <p className="text-red-700 dark:text-red-400 font-medium">
                Unable to load community posts right now. Please refresh or try again later.
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center p-12 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 max-w-xl mx-auto shadow-sm">
              <p className="text-zinc-600 dark:text-zinc-400 font-medium">
                Our community feed is growing. Join the waitlist to be the first to post!
              </p>
              <Link href="/join" className="mt-6 inline-block">
                <Button size="sm">Join the Waitlist</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Card key={post.id} className="flex flex-col h-full hover:shadow-md transition-shadow bg-white dark:bg-zinc-900">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 capitalize">
                        {getCategoryIcon(post.category)}
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-bold line-clamp-1 text-zinc-900 dark:text-zinc-50">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>
                  </CardContent>
                  <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <p className="text-xs text-muted-foreground">
                      By <span className="font-semibold text-zinc-700 dark:text-zinc-300">{post.profiles?.full_name || "Anonymous Member"}</span>
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
