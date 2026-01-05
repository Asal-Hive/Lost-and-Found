import { useEffect, useState } from "react";
import { itemsApi, ItemDetail, CATEGORY_LABELS } from "../../../services/itemsApi";
import { useAuth } from "../../auth/AuthProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { EditItemModal } from "./EditItemModal";
import { Badge } from "../ui/badge";
import { Button } from "../ui/Button";
import { MapPin, Calendar, User, X } from "lucide-react";

interface ItemDetailModalProps {
  itemId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemDetailModal({ itemId, isOpen, onClose }: ItemDetailModalProps) {
  const { user } = useAuth();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  console.log('ItemDetailModal render:', { itemId, isOpen });

  useEffect(() => {
    console.log('useEffect triggered:', { itemId, isOpen });
    if (itemId && isOpen) {
      loadItem();
    }
  }, [itemId, isOpen]);

  const loadItem = async () => {
    if (!itemId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await itemsApi.getItem(itemId);
      setItem(data);
    } catch (err) {
      setError('خطا در بارگذاری جزئیات آیتم');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleDelete = async () => {
    if (!item || !confirm('آیا مطمئن هستید می‌خواهید این آیتم را حذف کنید؟')) return;

    try {
      setDeleting(true);
      const authTokensStr = localStorage.getItem('auth_tokens') || sessionStorage.getItem('auth_tokens');
      if (!authTokensStr) {
        alert('لطفا دوباره وارد شوید');
        return;
      }
      const authTokens = JSON.parse(authTokensStr);
      const token = authTokens.access || '';

      await itemsApi.deleteItem(item.id, token);
      alert('آیتم با موفقیت حذف شد');
      onClose();
      // Reload the items list
      window.location.reload();
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('خطا در حذف آیتم');
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = user && item && user.email === item.owner_email;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        {item && !loading && (
          <div className="space-y-6">
            {/* Header */}
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bold mb-2">
                    {item.title}
                  </DialogTitle>
                  <Badge
                    className={`${
                      item.status === 'lost'
                        ? 'bg-red-600 text-white'
                        : 'bg-green-600 text-white'
                    }`}
                  >
                    {item.status === 'lost' ? 'گمشده' : 'پیدا شده'}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            {/* Image */}
            {item.image && (
              <div className="relative w-full h-96 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-semibold text-lg mb-2">توضیحات</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-lg mb-2">دسته‌بندی‌ها</h3>
              <div className="flex flex-wrap gap-2">
                {item.categories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-sm">
                    {CATEGORY_LABELS[cat] || cat}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="font-semibold text-lg mb-2">مکان</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>{item.location_name}</span>
                </div>
                {item.latitude && item.longitude && (
                  <div className="text-sm text-gray-500">
                    مختصات: {typeof item.latitude === 'number' ? item.latitude.toFixed(6) : item.latitude}, {typeof item.longitude === 'number' ? item.longitude.toFixed(6) : item.longitude}
                  </div>
                )}
              </div>
            </div>

            {/* Owner Info */}
            <div>
              <h3 className="font-semibold text-lg mb-2">اطلاعات ثبت‌کننده</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>{item.owner_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>ثبت شده در: {formatDate(item.created_at)}</span>
                </div>
                {item.updated_at !== item.created_at && (
                  <div className="text-sm text-gray-500">
                    آخرین بروزرسانی: {formatDate(item.updated_at)}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={deleting}
              >
                بستن
              </Button>
              {isOwner ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? 'در حال حذف...' : 'حذف آیتم'}
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setIsEditModalOpen(true)}
                    disabled={deleting}
                  >
                    ویرایش
                  </Button>
                </>
              ) : (
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    alert('قابلیت تماس با صاحب آیتم به زودی اضافه می‌شود');
                  }}
                >
                  تماس با صاحب
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>

      {/* Edit Item Modal */}
      {item && (
        <EditItemModal
          item={item}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            loadItem(); // Reload the item details
          }}
        />
      )}
    </Dialog>
  );
}
