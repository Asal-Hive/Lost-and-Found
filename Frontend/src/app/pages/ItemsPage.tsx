import { useEffect, useState } from "react";
import { itemsApi, Item, CATEGORY_LABELS } from "../../services/itemsApi";
import { useAuth } from "../auth/AuthProvider";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/Button";
import { Search, MapPin, Calendar, Plus, X, Filter } from "lucide-react";
import { ItemDetailModal } from "../components/items/ItemDetailModal";
import { CreateItemModal } from "../components/items/CreateItemModal";

export default function ItemsPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [showMyItems, setShowMyItems] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadItems();
    }, searchQuery ? 500 : 0); // 500ms delay for search, immediate for other filters
    
    return () => clearTimeout(timeoutId);
  }, [statusFilter, searchQuery, categoryFilter, locationFilter, showMyItems]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (showMyItems && isAuthenticated) {
        // Get user's items
        const authTokensStr = localStorage.getItem('auth_tokens') || sessionStorage.getItem('auth_tokens');
        if (authTokensStr) {
          const authTokens = JSON.parse(authTokensStr);
          const token = authTokens.access || '';
          data = await itemsApi.getMyItems(token);
          // Apply filters to my items (client-side filtering for my items)
          if (statusFilter !== 'all') {
            data = data.filter(item => item.status === statusFilter);
          }
          // Apply search filter
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(item => 
              item.title.toLowerCase().includes(query) ||
              item.description.toLowerCase().includes(query) ||
              item.location_name.toLowerCase().includes(query)
            );
          }
          // Apply category filter
          if (categoryFilter) {
            data = data.filter(item => 
              item.categories && item.categories.includes(categoryFilter)
            );
          }
          // Apply location filter
          if (locationFilter) {
            const location = locationFilter.toLowerCase();
            data = data.filter(item => 
              item.location_name.toLowerCase().includes(location)
            );
          }
        } else {
          data = [];
        }
      } else {
        // Get all items with filters
        data = await itemsApi.getItems({
          status: statusFilter === 'all' ? undefined : statusFilter,
          search: searchQuery || undefined,
          category: categoryFilter || undefined,
          location: locationFilter || undefined,
        });
      }
      
      setItems(data);
    } catch (err) {
      console.error('Error loading items:', err);
      setError('خطا در بارگذاری آیتم‌ها. لطفا دوباره تلاش کنید.');
      
    } finally {
      setLoading(false);
    }
  };

  // No need for client-side filtering anymore - server handles it
  const filteredItems = items;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const handleItemClick = (itemId: number) => {
    console.log('Item clicked:', itemId);
    setSelectedItemId(itemId);
    setIsModalOpen(true);
    console.log('Modal should open now');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItemId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6" dir="rtl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">لیست اشیا</h2>
          <p className="text-gray-600">
            مشاهده و جستجوی اشیای گمشده و پیدا شده
          </p>
        </div>
        <div className="relative group">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!isAuthenticated}
          >
            <Plus className="w-5 h-5" />
            ثبت آیتم جدید
          </Button>
          {!isAuthenticated && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              برای ثبت آیتم باید وارد شوید
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
            }`}
          >
            همه
          </button>
          <button
            onClick={() => setStatusFilter('lost')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'lost'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-red-400'
            }`}
          >
            گمشده
          </button>
          <button
            onClick={() => setStatusFilter('found')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'found'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-green-400'
            }`}
          >
            پیدا شده
          </button>
          
          {/* My Items Button - Only show when authenticated */}
          {isAuthenticated && (
            <>
              <div className="border-r border-gray-300 h-8 mx-2"></div>
              <button
                onClick={() => setShowMyItems(!showMyItems)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  showMyItems
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-400'
                }`}
              >
                آیتم‌های من
              </button>
            </>
          )}
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="جستجو در عنوان، توضیحات و مکان..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 py-3"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Filter className="w-4 h-4" />
              دسته‌بندی:
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">همه دسته‌بندی‌ها</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            {categoryFilter && (
              <button
                onClick={() => setCategoryFilter('')}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                حذف فیلتر
              </button>
            )}
          </div>

          {/* Location Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              مکان:
            </span>
            <Input
              type="text"
              placeholder="جستجو بر اساس مکان..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="flex-1 max-w-xs py-2"
            />
            {locationFilter && (
              <button
                onClick={() => setLocationFilter('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Items Grid */}
      {!loading && !error && (
        <>
          <div className="mb-4 text-sm text-gray-600">
            {filteredItems.length} مورد یافت شد
          </div>
          
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-600 text-lg">
                موردی یافت نشد
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-400"
                  onClick={() => handleItemClick(item.id)}
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', item.image);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-6xl">
                        {item.status === 'lost' ? '❓' : '✅'}
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge
                        className={`${
                          item.status === 'lost'
                            ? 'bg-red-600 text-white'
                            : 'bg-green-600 text-white'
                        } shadow-md`}
                      >
                        {item.status === 'lost' ? 'گمشده' : 'پیدا شده'}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.categories.slice(0, 3).map((cat) => (
                        <Badge
                          key={cat}
                          variant="secondary"
                          className="text-xs"
                        >
                          {CATEGORY_LABELS[cat] || cat}
                        </Badge>
                      ))}
                      {item.categories.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.categories.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Location & Date */}
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{item.location_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Item Detail Modal */}
      <ItemDetailModal
        itemId={selectedItemId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Create Item Modal */}
      <CreateItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadItems}
      />
    </div>
  );
}

