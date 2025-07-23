// Global types for the application

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  date_of_birth?: string
  gender?: "male" | "female" | "other"
  created_at: string
  updated_at: string
}

export interface Book {
  id: string
  title: string
  author: string
  description: string
  category: string
  isbn: string
  publication_year: number
  pages: number
  cover_url: string
  total_copies: number
  available_copies: number
  rating: number
  featured?: boolean
  created_at: string
  updated_at: string
}

export interface Borrowing {
  id: string
  user_id: string
  book_id: string
  borrowed_at: string
  due_date: string
  returned_at?: string
  status: "active" | "returned" | "overdue"
  created_at: string
  updated_at: string
  book?: {
    title: string
    author: string
    cover_url: string
  }
}

export interface Review {
  id: string
  user_id: string
  book_id: string
  rating: number
  comment?: string
  created_at: string
  updated_at: string
  user?: {
    first_name: string
    last_name: string
  }
}

export interface Favorite {
  id: string
  user_id: string
  book_id: string
  created_at: string
}

export interface ReadingProgress {
  id: string
  user_id: string
  book_id: string
  progress_percentage: number
  last_read_at: string
  created_at: string
  updated_at: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form types
export interface RegisterFormData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  gender?: "male" | "female" | "other"
}

export interface LoginFormData {
  email: string
  password: string
}

// Search and filter types
export interface BookFilters {
  search?: string
  category?: string
  sortBy?: "title" | "author" | "year" | "rating"
  page?: number
  limit?: number
}

// Component prop types
export interface BookCardProps {
  book: Book
  showActions?: boolean
  onBorrow?: (bookId: string) => void
  onFavorite?: (bookId: string) => void
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}
