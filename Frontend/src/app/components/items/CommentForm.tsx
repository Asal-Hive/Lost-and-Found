import { useState } from "react";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/textarea";
import { Send, X } from "lucide-react";

interface CommentFormProps {
  itemId: number;
  parentId?: number | null;
  initialContent?: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  submitLabel?: string;
}

export function CommentForm({
  itemId,
  parentId = null,
  initialContent = "",
  onSubmit,
  onCancel,
  placeholder = "نظر خود را بنویسید...",
  submitLabel = "ارسال",
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("لطفاً نظر خود را وارد کنید");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(content.trim());
      setContent("");
      if (onCancel) {
        onCancel();
      }
    } catch (err: any) {
      setError(err.message || "خطا در ارسال نظر");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
          {error}
        </div>
      )}
      
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="resize-none"
        disabled={loading}
      />
      
      <div className="flex items-center gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="w-4 h-4 ml-2" />
            لغو
          </Button>
        )}
        <Button type="submit" disabled={loading || !content.trim()}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
              در حال ارسال...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 ml-2" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

