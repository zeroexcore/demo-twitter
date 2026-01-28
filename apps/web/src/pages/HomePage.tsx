import { useInfiniteQuery } from "@tanstack/react-query";
import { timelineApi } from "../lib/api";
import { useAuthStore } from "../stores/auth";
import ComposeTweet from "../components/ComposeTweet";
import TweetList from "../components/TweetList";

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["timeline", "public"],
    queryFn: async ({ pageParam }) => {
      return timelineApi.getPublic(pageParam);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
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
