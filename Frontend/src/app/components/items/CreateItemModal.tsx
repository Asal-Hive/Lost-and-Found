import { useState } from "react";
import { itemsApi, CreateItemData, CATEGORY_LABELS } from "../../../services/itemsApi";
import { useAuth } from "../../auth/AuthProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Upload, X } from "lucide-react";

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateItemModal({ isOpen, onClose, onSuccess }: CreateItemModalProps) {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<CreateItemData>({
    title: '',
    description: '',
    status: 'lost',
    categories: [],
    latitude: 35.7042,
    longitude: 51.3510,
    location_name: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = Object.entries(CATEGORY_LABELS);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('برای ثبت آیتم باید وارد شوید');
      return;
    }
    
    if (!formData.title || !formData.description || !formData.location_name) {
      setError('لطفا تمام فیلدهای الزامی را پر کنید');
      return;
    }
    
    if (formData.categories.length === 0) {
      setError('لطفا حداقل یک دسته‌بندی انتخاب کنید');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage or sessionStorage
      const authTokensStr = localStorage.getItem('auth_tokens') || sessionStorage.getItem('auth_tokens');
      if (!authTokensStr) {
        setError('توکن احراز هویت یافت نشد. لطفا دوباره وارد شوید');
        return;
      }
      
      const authTokens = JSON.parse(authTokensStr);
      const token = authTokens.access || '';
      
      if (!token) {
        setError('توکن احراز هویت معتبر نیست. لطفا دوباره وارد شوید');
        return;
      }
      
      const dataToSend = {
        ...formData,
        image: image || undefined,
      };
      
      await itemsApi.createItem(dataToSend, token);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        status: 'lost',
        categories: [],
        latitude: 35.7042,
        longitude: 51.3510,
        location_name: '',
      });
      setImage(null);
      setImagePreview(null);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating item:', err);
      
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setError('خطا در احراز هویت. لطفا دوباره وارد شوید');
      } else if (err.message.includes('400')) {
        setError('اطلاعات وارد شده معتبر نیست. لطفا بررسی کنید');
      } else if (err.message.includes('fetch')) {
        setError('خطا در اتصال به سرور. لطفا اتصال اینترنت خود را بررسی کنید');
      } else {
        setError('خطا در ثبت آیتم. لطفا دوباره تلاش کنید');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">ثبت آیتم جدید</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              عنوان <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: کیف مشکی"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              توضیحات <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="توضیحات کامل درباره آیتم..."
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">
              وضعیت <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'lost' })}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  formData.status === 'lost'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-red-400'
                }`}
              >
                گمشده
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'found' })}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  formData.status === 'found'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-green-400'
                }`}
              >
                پیدا شده
              </button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium mb-2">
              دسته‌بندی‌ها <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map(([key, label]) => (
                <Badge
                  key={key}
                  variant={formData.categories.includes(key) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    formData.categories.includes(key)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'hover:border-blue-400'
                  }`}
                  onClick={() => toggleCategory(key)}
                >
                  {label}
                </Badge>
              ))}
            </div>
            {formData.categories.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {formData.categories.length} دسته انتخاب شده
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">تصویر</label>
            {imagePreview ? (
              <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 left-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">برای آپلود کلیک کنید</span>
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG یا JPEG (حداکثر 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">
              مکان <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              placeholder="مثال: کتابخانه مرکزی دانشگاه شریف"
              required
            />
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">عرض جغرافیایی</label>
              <Input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                placeholder="35.7042"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">طول جغرافیایی</label>
              <Input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                placeholder="51.3510"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              لغو
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'در حال ثبت...' : 'ثبت آیتم'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
