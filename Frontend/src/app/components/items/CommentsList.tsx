import { useEffect, useState } from "react";
import { Comment as CommentType, commentsApi } from "../../../services/commentsApi";
import { useAuth } from "../../auth/AuthProvider";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import { Button } from "../ui/Button";
import { MessageCircle, Loader2 } from "lucide-react";

interface CommentsListProps {
  itemId: number;
}

export function CommentsList({ itemId }: CommentsListProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");

  useEffect(() => {
    loadComments();
  }, [itemId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await commentsApi.getItemComments(itemId);
      setComments(data);
    } catch (err) {
      console.error("Error loading comments:", err);
      setError("خطا در بارگذاری نظرات");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async (content: string, parentId?: number | null) => {
    if (!user) {
      alert("لطفاً ابتدا وارد شوید");
      return;
    }

    const authTokensStr = localStorage.getItem("auth_tokens") || sessionStorage.getItem("auth_tokens");
    if (!authTokensStr) {
      alert("لطفاً دوباره وارد شوید");
      return;
    }

    let token = "";
    try {
      const authTokens = JSON.parse(authTokensStr);
      token = authTokens.access || authTokens.token || "";
    } catch (e) {
      console.error("Error parsing auth tokens:", e);
      alert("خطا در خواندن اطلاعات احراز هویت. لطفاً دوباره وارد شوید.");
      return;
    }
    
    if (!token) {
      alert("لطفاً دوباره وارد شوید");
      return;
    }

    await commentsApi.createComment(
      {
        item: itemId,
        parent: parentId || null,
        content,
      },
      token
    );

    await loadComments();
    setReplyingTo(null);
  };

  const handleEditComment = async (commentId: number, content: string) => {
    if (!user) return;

    const authTokensStr = localStorage.getItem("auth_tokens") || sessionStorage.getItem("auth_tokens");
    if (!authTokensStr) {
      alert("لطفاً دوباره وارد شوید");
      return;
    }

    let token = "";
    try {
      const authTokens = JSON.parse(authTokensStr);
      token = authTokens.access || authTokens.token || "";
    } catch (e) {
      console.error("Error parsing auth tokens:", e);
      alert("خطا در خواندن اطلاعات احراز هویت. لطفاً دوباره وارد شوید.");
      return;
    }
    
    if (!token) {
      alert("لطفاً دوباره وارد شوید");
      return;
    }

    await commentsApi.updateComment(commentId, content, token);
    await loadComments();
    setEditingId(null);
    setEditingContent("");
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!user) return;

    const authTokensStr = localStorage.getItem("auth_tokens") || sessionStorage.getItem("auth_tokens");
    if (!authTokensStr) {
      alert("لطفاً دوباره وارد شوید");
      return;
    }

    let token = "";
    try {
      const authTokens = JSON.parse(authTokensStr);
      token = authTokens.access || authTokens.token || "";
    } catch (e) {
      console.error("Error parsing auth tokens:", e);
      alert("خطا در خواندن اطلاعات احراز هویت. لطفاً دوباره وارد شوید.");
      return;
    }
    
    if (!token) {
      alert("لطفاً دوباره وارد شوید");
      return;
    }

    await commentsApi.deleteComment(commentId, token);
    await loadComments();
  };

  const handleReportComment = async (commentId: number) => {
    const reason = prompt(
      "لطفاً دلیل گزارش را انتخاب کنید:\n1 - محتوای نامناسب\n2 - اسپم\n3 - آزار و اذیت\n4 - سایر"
    );

    if (!reason) return;

    const reasonMap: Record<string, "inappropriate" | "spam" | "harassment" | "other"> = {
      "1": "inappropriate",
      "2": "spam",
      "3": "harassment",
      "4": "other",
    };

    const mappedReason = reasonMap[reason] || "other";

    if (!user) {
      alert("لطفاً ابتدا وارد شوید");
      return;
    }

    const authTokensStr = localStorage.getItem("auth_tokens") || sessionStorage.getItem("auth_tokens");
    if (!authTokensStr) {
      alert("لطفاً دوباره وارد شوید");
      return;
    }

    let token = "";
    try {
      const authTokens = JSON.parse(authTokensStr);
      token = authTokens.access || authTokens.token || "";
    } catch (e) {
      console.error("Error parsing auth tokens:", e);
      alert("خطا در خواندن اطلاعات احراز هویت. لطفاً دوباره وارد شوید.");
      return;
    }
    
    if (!token) {
      alert("لطفاً دوباره وارد شوید");
      return;
    }

    try {
      await commentsApi.reportComment(commentId, { reason: mappedReason }, token);
      alert("نظر با موفقیت گزارش شد. در صورت دریافت ۵ گزارش، نظر به طور خودکار حذف می‌شود.");
    } catch (err: any) {
      console.error("Error reporting comment:", err);
      const errorMessage = err.message || "خطا در گزارش نظر";
      if (errorMessage.includes("توکن") || errorMessage.includes("token") || errorMessage.includes("authenticated")) {
        alert("توکن شما منقضی شده است. لطفاً دوباره وارد شوید.");
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleReply = (commentId: number) => {
    setReplyingTo(commentId);
    setEditingId(null);
  };

  const handleEdit = (commentId: number, content: string) => {
    setEditingId(commentId);
    setEditingContent(content);
    setReplyingTo(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          نظرات ({comments.length})
        </h3>
      </div>

      {/* New Comment Form */}
      {user && !replyingTo && !editingId && (
        <div className="bg-gray-50 rounded-lg p-4">
          <CommentForm
            itemId={itemId}
            onSubmit={(content) => handleCreateComment(content)}
            placeholder="نظر خود را بنویسید..."
            submitLabel="ارسال نظر"
          />
        </div>
      )}

      {/* Edit Comment Form */}
      {editingId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <CommentForm
            itemId={itemId}
            parentId={null}
            initialContent={editingContent}
            onSubmit={(content) => handleEditComment(editingId, content)}
            onCancel={() => {
              setEditingId(null);
              setEditingContent("");
            }}
            placeholder="نظر خود را ویرایش کنید..."
            submitLabel="ذخیره تغییرات"
          />
        </div>
      )}

      {/* Reply Form */}
      {replyingTo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="mb-2 text-sm text-gray-600">
            در حال پاسخ به نظر
          </div>
          <CommentForm
            itemId={itemId}
            parentId={replyingTo}
            onSubmit={(content) => handleCreateComment(content, replyingTo)}
            onCancel={() => setReplyingTo(null)}
            placeholder="پاسخ خود را بنویسید..."
            submitLabel="ارسال پاسخ"
          />
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">در حال بارگذاری نظرات...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>هنوز نظری ثبت نشده است. اولین نظر را شما بنویسید!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <CommentItem
                comment={comment}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDeleteComment}
                onReport={handleReportComment}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

