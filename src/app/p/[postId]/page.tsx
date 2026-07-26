import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { Cpu, Zap, Droplets, Home as HomeIcon, Wrench } from "lucide-react";

// Strict type for params in Next.js 15+
interface PageProps {
  params: Promise<{ postId: string }>;
}

interface PostWithAuthor {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string | null;
  status: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

// Map categories to modern Lucide icons
function getCategoryIcon(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes("generator")) {
    return <Cpu className="h-4 w-4 text-amber-500" />;
  }
  if (normalized.includes("electric") || normalized.includes("power")) {
    return <Zap className="h-4 w-4 text-yellow-500" />;
  }
  if (normalized.includes("pump") || normalized.includes("water") || normalized.includes("plumbing")) {
    return <Droplets className="h-4 w-4 text-blue-500" />;
  }
  if (normalized.includes("building") || normalized.includes("house") || normalized.includes("structure")) {
    return <HomeIcon className="h-4 w-4 text-emerald-500" />;
  }
  return <Wrench className="h-4 w-4 text-zinc-500" />;
}

// Function to fetch post by ID with security check
async function getApprovedPost(postId: string): Promise<PostWithAuthor | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      content,
      category,
      image_url,
      status,
      created_at,
      profiles (
        full_name,
        avatar_url
      )
    `)
    .eq("id", postId)
    .eq("status", "approved")
    .single();

  if (error || !data) {
    return null;
  }

  // Cast safely since Supabase SSR types can be overly nested or represent joint tables as arrays
  return data as unknown as PostWithAuthor;
}

// Dynamic metadata generator
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { postId } = await params;
  const post = await getApprovedPost(postId);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested community post could not be found or has not been approved.",
    };
  }

  const truncatedDescription =
    post.content.length > 150
      ? `${post.content.slice(0, 150)}...`
      : post.content;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const postUrl = `${appUrl}/p/${postId}`;

  const metadata: Metadata = {
    title: `${post.title} | Godteck Community`,
    description: truncatedDescription,
    openGraph: {
      title: post.title,
      description: truncatedDescription,
      url: postUrl,
      type: "article",
    },
  };

  if (post.image_url && metadata.openGraph) {
    metadata.openGraph.images = [
      {
        url: post.image_url,
        alt: post.title,
      },
    ];
  }

  return metadata;
}

export default async function PublicPostPage({ params }: PageProps) {
  const { postId } = await params;
  const post = await getApprovedPost(postId);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const authorName = post.profiles?.full_name || "Anonymous Member";
  const authorAvatar = post.profiles?.avatar_url || "";

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-sm">
        {/* Header Section */}
        <header className="mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="gap-1 px-3 py-1 text-xs capitalize">
              {getCategoryIcon(post.category)}
              {post.category}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              {authorAvatar ? (
                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  <Image
                    src={authorAvatar}
                    alt={authorName}
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-600 dark:text-zinc-400">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {authorName}
              </span>
            </div>
            <div className="hidden sm:block text-zinc-300 dark:text-zinc-700">•</div>
            <time dateTime={post.created_at} className="text-zinc-500">
              {formattedDate}
            </time>
          </div>
        </header>

        {/* Featured Image */}
        {post.image_url && (
          <div className="relative w-full aspect-[16/9] mb-8 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              priority
              sizes="(max-w-3xl) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        {/* Post Content */}
        <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 text-base sm:text-lg leading-relaxed whitespace-pre-wrap mb-10">
          {post.content}
        </div>

        {/* Social Sharing Footer */}
        <footer className="border-t border-zinc-100 dark:border-zinc-800 pt-6 mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Share this article:
          </div>
          <ShareButtons title={post.title} />
        </footer>
      </article>
    </div>
  );
}
