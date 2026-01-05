const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface Item {
  id: number;
  title: string;
  description: string;
  image?: string;
  status: 'lost' | 'found';
  categories: string[];
  latitude: number;
  longitude: number;
  location_name: string;
  owner_email: string;
  created_at: string;
  is_active: boolean;
}

export interface ItemDetail extends Item {
  owner: number;
  updated_at: string;
  report_count: number;
}

export interface CreateItemData {
  title: string;
  description: string;
  image?: File;
  status: 'lost' | 'found';
  categories: string[];
  latitude: number;
  longitude: number;
  location_name: string;
}

export const CATEGORY_LABELS: Record<string, string> = {
  bag: 'کیف',
  clothes: 'لباس',
  electronics: 'وسایل الکترونیکی',
  bank_card: 'کارت بانکی',
  student_id: 'کارت دانشجویی',
  keys: 'کلید',
  book: 'کتاب',
  wallet: 'کیف پول',
  phone: 'گوشی',
  accessories: 'لوازم جانبی',
  other: 'سایر',
};

export const itemsApi = {
  async getItems(params?: {
    status?: 'lost' | 'found';
    search?: string;
  }): Promise<Item[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    
    const url = `${API_BASE_URL}/items/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch items');
    }
    
    return response.json();
  },

  async getItem(id: number): Promise<ItemDetail> {
    const response = await fetch(`${API_BASE_URL}/items/${id}/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch item');
    }
    
    return response.json();
  },

  async createItem(data: CreateItemData, token: string): Promise<ItemDetail> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('status', data.status);
    formData.append('categories', JSON.stringify(data.categories));
    formData.append('latitude', data.latitude.toString());
    formData.append('longitude', data.longitude.toString());
    formData.append('location_name', data.location_name);
    
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await fetch(`${API_BASE_URL}/items/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create item');
    }

    return response.json();
  },

  async updateItem(id: number, data: Partial<CreateItemData>, token: string): Promise<ItemDetail> {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.status) formData.append('status', data.status);
    if (data.categories) formData.append('categories', JSON.stringify(data.categories));
    if (data.latitude) formData.append('latitude', data.latitude.toString());
    if (data.longitude) formData.append('longitude', data.longitude.toString());
    if (data.location_name) formData.append('location_name', data.location_name);
    if (data.image) formData.append('image', data.image);

    const response = await fetch(`${API_BASE_URL}/items/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update item');
    }

    return response.json();
  },

  async deleteItem(id: number, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/items/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete item');
    }
  },

  async getMyItems(token: string): Promise<Item[]> {
    const response = await fetch(`${API_BASE_URL}/items/my_items/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch my items');
    }

    return response.json();
  },
};
