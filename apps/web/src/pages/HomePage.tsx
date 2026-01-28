import { useInfiniteQuery } from "@tanstack/react-query";
import { timelineApi } from "../lib/api";
import { useAuthStore } from "../stores/auth";
import ComposeTweet from "../components/ComposeTweet";
import TweetList from "../components/TweetList";

export default function HomePage() {
  const { isAuthenticated, token } = useAuthStore();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["timeline", isAuthenticated ? "home" : "public"],
    queryFn: async ({ pageParam }) => {
      if (isAuthenticated && token) {
        return timelineApi.getHome(token, pageParam);
      }
      return timelineApi.getPublic(pageParam);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="sticky top-14 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm p-4">
        <h1 className="text-xl font-bold">
          {isAuthenticated ? "Home" : "Explore"}
        </h1>
      </div>

      {/* Compose (only for authenticated users) */}
      {isAuthenticated && <ComposeTweet />}

      {/* Tweet List */}
      <TweetList
        tweets={tweets}
        isLoading={isLoading}
        hasMore={hasNextPage}
        onLoadMore={() => fetchNextPage()}
        isLoadingMore={isFetchingNextPage}
      />
    </div>
  );
}
