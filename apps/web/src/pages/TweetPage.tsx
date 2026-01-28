import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { tweetsApi } from "../lib/api";
import TweetCard from "../components/TweetCard";

export default function TweetPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["tweet", id],
    queryFn: () => tweetsApi.get(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !data?.tweet) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900">Tweet not found</h2>
        <p className="mt-2 text-gray-600">
          This tweet may have been deleted.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block text-primary-600 hover:underline"
        >
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="sticky top-14 z-10 flex items-center gap-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm p-4">
        <Link
          to="/"
          className="rounded-full p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Tweet</h1>
      </div>

      {/* Tweet */}
      <TweetCard tweet={data.tweet} />
    </div>
  );
}
