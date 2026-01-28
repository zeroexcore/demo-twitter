import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, X } from "lucide-react";
import { tweetsApi, cdnApi } from "../lib/api";
import { useAuthStore } from "../stores/auth";
import { cn } from "../lib/utils";

interface PendingImage {
  file: File;
  preview: string;
}

export default function ComposeTweet() {
  const [content, setContent] = useState("");
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: { content: string; images: string[] }) => {
      return tweetsApi.create(data.content, token!, data.images);
    },
    onSuccess: () => {
      setContent("");
      setPendingImages([]);
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      queryClient.invalidateQueries({ queryKey: ["tweets"] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > 280) return;

    setIsUploading(true);

    try {
      // Upload all images first
      const imageUrls: string[] = [];
      for (const pending of pendingImages) {
        const result = await cdnApi.upload(pending.file);
        imageUrls.push(result.url);
      }

      // Then create tweet with image URLs
      mutation.mutate({ content: content.trim(), images: imageUrls });
    } catch (error) {
      console.error("Failed to upload images:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 4 - pendingImages.length;
    const toAdd = files.slice(0, remaining);

    const newPending: PendingImage[] = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPendingImages((prev) => [...prev, ...newPending]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setPendingImages((prev) => {
      const updated = [...prev];
      // Revoke object URL to prevent memory leak
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const remainingChars = 280 - content.length;
  const canAddMoreImages = pendingImages.length < 4;
  const isSubmitting = isUploading || mutation.isPending;

  // Generate avatar URL using DiceBear
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.username || "user")}&backgroundColor=3b82f6&textColor=ffffff`;

  return (
    <form
      onSubmit={handleSubmit}
      className="border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={avatarUrl}
            alt={user?.displayName || "User"}
            className="h-10 w-10 rounded-full bg-gray-200 object-cover dark:bg-gray-700"
          />
        </div>

        {/* Input */}
        <div className="min-w-0 flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            rows={3}
            className={cn(
              "w-full resize-none border-0 bg-transparent text-lg text-gray-900 dark:text-gray-100",
              "placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-0"
            )}
          />

          {/* Image Previews */}
          {pendingImages.length > 0 && (
            <div
              className={cn(
                "mt-2 grid gap-2",
                pendingImages.length === 1 && "grid-cols-1",
                pendingImages.length === 2 && "grid-cols-2",
                pendingImages.length >= 3 && "grid-cols-2"
              )}
            >
              {pendingImages.map((pending, index) => (
                <div key={index} className="relative">
                  <img
                    src={pending.preview}
                    alt={`Preview ${index + 1}`}
                    className={cn(
                      "w-full rounded-lg object-cover",
                      pendingImages.length === 1 ? "max-h-80" : "h-32"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 dark:border-gray-800">
            <div className="flex items-center gap-2">
              {/* Image Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!canAddMoreImages || isSubmitting}
                className={cn(
                  "rounded-full p-2 text-primary-600 transition-colors hover:bg-primary-100",
                  "dark:text-primary-400 dark:hover:bg-primary-900/20",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                title={canAddMoreImages ? "Add image" : "Maximum 4 images"}
              >
                <ImagePlus className="h-5 w-5" />
              </button>

              <span
                className={cn(
                  "text-sm",
                  remainingChars < 0
                    ? "text-red-500"
                    : remainingChars < 20
                      ? "text-yellow-500"
                      : "text-gray-500 dark:text-gray-400"
                )}
              >
                {remainingChars}
              </span>
            </div>

            <button
              type="submit"
              disabled={!content.trim() || content.length > 280 || isSubmitting}
              className={cn(
                "rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white",
                "hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {isUploading
                ? "Uploading..."
                : mutation.isPending
                  ? "Posting..."
                  : "Tweet"}
            </button>
          </div>
        </div>
      </div>

      {mutation.isError && (
        <p className="mt-2 text-sm text-red-500">
          Failed to post tweet. Please try again.
        </p>
      )}
    </form>
  );
}
