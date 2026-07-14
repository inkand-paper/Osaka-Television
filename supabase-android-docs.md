# OSAKA GROUP — Supabase Android Integration Guide

This document provides a comprehensive guide for integrating the OSAKA GROUP Android application with the Supabase backend. It includes API credentials, database schema definitions, image storage URL structures, and step-by-step implementation code for Android (Kotlin) using both the **Supabase Kotlin SDK** and a standard **HTTP REST API (Retrofit)**.

---

## 1. Supabase Project Credentials

Use these credentials to authenticate and communicate with the Supabase API client.

| Parameter | Type | Value |
| :--- | :--- | :--- |
| **Supabase URL** | Endpoint | `https://dhijfufoefirkecwsvla.supabase.co` |
| **Supabase Anon Key** | API Key / Auth | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaWpmdWZvZWZpcmtlY3dzdmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDAwODUsImV4cCI6MjA5MDYxNjA4NX0.jgAiDCieCFJbh8coQ-yWr7LR96Lzk-N6SJ69w7fLszM` |

> [!IMPORTANT]
> The **Anon Key** is safe to embed in public client applications (Android/iOS/Web). It respects Row Level Security (RLS) policies configured in your Postgres database. Do not use the Service Role Key in customer-facing clients.

---

## 2. Remote Database Schema Reference

Below are the 4 database tables queried by the OSAKA client interfaces. Ensure your Android models match these structures.

### A. `products`
Stores customer-facing product listings (TVs, Fans, Cookers).

* **Query Rule:** Fetch rows where `is_active = true` and order by `category` ascending.

| Column Name | PostgreSQL Type | Kotlin / Java Type | Nullability | Description / Examples |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | `String` | **Non-null** | Unique Product identifier (typically UUIDv4/v7) |
| `name` | `text` | `String` | **Non-null** | Full display name (e.g. `"Google TV"`, `"Smart Frameless - Double Glass"`) |
| `category` | `text` | `String` | **Non-null** | Sizing categories (e.g., `"24 inch"`, `"32 inch"`, `"Cooker"`) |
| `size` | `text` | `String` | **Non-null** | Screen size / Dimensions text (e.g., `"24\""`, `"32\""`, `"16\""`) |
| `price` | `numeric` | `Double` / `Long` | **Non-null** | Actual selling price in BDT (৳) |
| `description` | `text` | `String?` | *Nullable* | Detailed description, spec highlights, or features list |
| `image_url` | `text` | `String?` | *Nullable* | Public CDN link hosting the main product photo |
| `is_active` | `boolean` | `Boolean` | **Non-null** | Visibility flag. `false` hides the item from the catalog |
| `original_price` | `numeric` | `Double?` | *Nullable* | Before-discount price (used to render stale strike-through pricing) |
| `discount_percentage` | `text` | `String?` | *Nullable* | Promo badge text (e.g., `"15% OFF"`, `"NEW"`, `"HOT"`) |
| `created_at` | `timestamptz` | `String?` | *Nullable* | Auto-generated timestamp for sorting new arrivals |

---

### B. `product_types`
Defines variant/type tags specifically mapping to TVs (e.g. "Smart Frameless Voice").

| Column Name | PostgreSQL Type | Kotlin / Java Type | Nullability | Description / Examples |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | `String` | **Non-null** | Primary Key |
| `name` | `text` | `String` | **Non-null** | Type identifier (e.g., `"Basic Frameless"`, `"Gold Series"`) |
| `created_at` | `timestamptz` | `String` | *Nullable* | Creation timestamp |

---

### C. `hero_slides`
Stores homepage promotional banners featured in the head slider.

* **Query Rule:** Fetch rows where `is_active = true` and order by `display_order` ascending.

| Column Name | PostgreSQL Type | Kotlin / Java Type | Nullability | Description / Examples |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | `String` | **Non-null** | Primary Key |
| `title` | `text` | `String` | **Non-null** | Large banner heading (e.g. `"Experience Android TV"`) |
| `description` | `text` | `String?` | *Nullable* | Smaller subtitle describing the promotion / deal |
| `image_url` | `text` | `String` | **Non-null** | Public CDN link for high-resolution background slide image |
| `display_order` | `integer` | `Int` | **Non-null** | Carousel slot index (`1`, `2`, `3`...). Lower numbers render first |
| `is_active` | `boolean` | `Boolean` | **Non-null** | Active toggle status |
| `created_at` | `timestamptz` | `String` | *Nullable* | Creation timestamp |

---

### D. `gallery`
Stores showroom, factory, and official corporate showroom photographs for the media lightboxes.

* **Query Rule:** Fetch rows where `is_active = true` and order by `display_order` ascending.

| Column Name | PostgreSQL Type | Kotlin / Java Type | Nullability | Description / Examples |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | `String` | **Non-null** | Primary Key |
| `caption` | `text` | `String?` | *Nullable* | Text description overlay (e.g. `"Osaka Official Showroom"`) |
| `image_url` | `text` | `String` | **Non-null** | Public CDN link hosted on Supabase Storage |
| `display_order` | `integer` | `Int` | **Non-null** | Grid ranking index |
| `is_active` | `boolean` | `Boolean` | **Non-null** | Active toggle status |
| `created_at` | `timestamptz` | `String` | *Nullable* | Creation timestamp |

---

## 3. Storage Buckets and CDN Guidelines

Media uploads are structured inside independent storage buckets. Public images can be loaded directly from the Supabase Storage CDN using these absolute URL prefixes:

1. **Product Images (`product-images` bucket):**
   `https://dhijfufoefirkecwsvla.supabase.co/storage/v1/object/public/product-images/<filename>`
2. **Hero Banner Slides (`hero-images` bucket):**
   `https://dhijfufoefirkecwsvla.supabase.co/storage/v1/object/public/hero-images/<filename>`
3. **Showroom Gallery Photo (`gallery-images` bucket):**
   `https://dhijfufoefirkecwsvla.supabase.co/storage/v1/object/public/gallery-images/<filename>`

---

## 4. Integration Option A: Supabase Kotlin SDK

Supabase provides a official multiplatform Kotlin SDK that handles object mappings, queries, and authentication with type-safe operations.

### Step 1: Install Dependencies
In your module-level `build.gradle.kts` file, import the Supabase Postgrest library along with serialization dependencies:

```kotlin
plugins {
    kotlin("plugin.serialization") version "1.9.0" // Matches your Kotlin version
}

dependencies {
    // Supabase Multiplatform SDK
    implementation("io.github.jan-tennert.supabase:postgrest-kt:2.5.0")
    implementation("io.github.jan-tennert.supabase:realtime-kt:2.5.0") // Optional: for live changes
    
    // Ktor Http Client (required engine for Supabase SDK calls)
    implementation("io.ktor:ktor-client-android:2.3.11")
    
    // Kotlin Serialization JSON
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
}
```

### Step 2: Define Data Classes (Models)

Create type-safe models decorated with `@Serializable`. These map exactly to database rows returned by Postgrest.

```kotlin
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ProductDto(
    val id: String,
    val name: String,
    val category: String,
    val size: String,
    val price: Double,
    val description: String? = null,
    @SerialName("image_url") val imageUrl: String? = null,
    @SerialName("is_active") val isActive: Boolean,
    @SerialName("original_price") val originalPrice: Double? = null,
    @SerialName("discount_percentage") val discountPercentage: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class HeroSlideDto(
    val id: String,
    val title: String,
    val description: String? = null,
    @SerialName("image_url") val imageUrl: String,
    @SerialName("display_order") val displayOrder: Int,
    @SerialName("is_active") val isActive: Boolean
)

@Serializable
data class GalleryItemDto(
    val id: String,
    val caption: String? = null,
    @SerialName("image_url") val imageUrl: String,
    @SerialName("display_order") val displayOrder: Int,
    @SerialName("is_active") val isActive: Boolean
)
```

### Step 3: Initialize and Query data

Setup a singleton Supabase connection helper class. 

```kotlin
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object SupabaseManager {
    private const val SUPABASE_URL = "https://dhijfufoefirkecwsvla.supabase.co"
    private const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaWpmdWZvZWZpcmtlY3dzdmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDAwODUsImV4cCI6MjA5MDYxNjA4NX0.jgAiDCieCFJbh8coQ-yWr7LR96Lzk-N6SJ69w7fLszM"

    val client = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY) {
        install(Postgrest)
    }

    /**
     * Fetch products that are enabled for store catalog
     */
    suspend fun getActiveProducts(): List<ProductDto> = withContext(Dispatchers.IO) {
        client.postgrest["products"]
            .select {
                filter {
                    ProductDto::isActive eq true
                }
                order(column = "category", order = Order.ASCENDING)
            }
            .decodeList<ProductDto>()
    }

    /**
     * Fetch active home promotional carousel banner slides
     */
    suspend fun getHeroSlides(): List<HeroSlideDto> = withContext(Dispatchers.IO) {
        client.postgrest["hero_slides"]
            .select {
                filter {
                    HeroSlideDto::isActive eq true
                }
                order(column = "display_order", order = Order.ASCENDING)
            }
            .decodeList<HeroSlideDto>()
    }

    /**
     * Fetch active photographs to exhibit in the showroom gallery
     */
    suspend fun getGalleryItems(): List<GalleryItemDto> = withContext(Dispatchers.IO) {
        client.postgrest["gallery"]
            .select {
                filter {
                    GalleryItemDto::isActive eq true
                }
                order(column = "display_order", order = Order.ASCENDING)
            }
            .decodeList<GalleryItemDto>()
    }
}
```

---

## 5. Integration Option B: Standard HTTP REST API (Retrofit)

If you prefer lightweight integrations without external libraries, you can interact with Supabase via its native PostgREST HTTP REST API using standard tools like Retrofit.

### Step 1: Install Dependencies
In your module-level `build.gradle.kts` file:

```kotlin
dependencies {
    // Retrofit & OkHttp
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
}
```

### Step 2: Define Data Classes (Retrofit Models)

Ensure names match the exact Postgres database columns.

```kotlin
import com.google.gson.annotations.SerializedName

data class Product(
    val id: String,
    val name: String,
    val category: String,
    val size: String,
    val price: Double,
    val description: String?,
    @SerializedName("image_url") val imageUrl: String?,
    @SerializedName("is_active") val isActive: Boolean,
    @SerializedName("original_price") val originalPrice: Double?,
    @SerializedName("discount_percentage") val discountPercentage: String?,
    @SerializedName("created_at") val createdAt: String?
)

data class HeroSlide(
    val id: String,
    val title: String,
    val description: String?,
    @SerializedName("image_url") val imageUrl: String,
    @SerializedName("display_order") val displayOrder: Int,
    @SerializedName("is_active") val isActive: Boolean
)

data class GalleryItem(
    val id: String,
    val caption: String?,
    @SerializedName("image_url") val imageUrl: String,
    @SerializedName("display_order") val displayOrder: Int,
    @SerializedName("is_active") val isActive: Boolean
)
```

### Step 3: Create Retrofit API Interface
Query filters are passed via URL queries. PostgREST uses simple operators like `eq.true` for filters, and `order` queries for sorting.

```kotlin
import retrofit2.http.GET
import retrofit2.http.Query

interface SupabaseApiService {

    // Fetch active products ordered by category
    @GET("rest/v1/products")
    suspend fun getProducts(
        @Query("is_active") activeState: String = "eq.true",
        @Query("order") sortOrder: String = "category.asc"
    ): List<Product>

    // Fetch slides ordered by display order ascendancy
    @GET("rest/v1/hero_slides")
    suspend fun getHeroSlides(
        @Query("is_active") activeState: String = "eq.true",
        @Query("order") sortOrder: String = "display_order.asc"
    ): List<HeroSlide>

    // Fetch grid gallery images
    @GET("rest/v1/gallery")
    suspend fun getGalleryItems(
        @Query("is_active") activeState: String = "eq.true",
        @Query("order") sortOrder: String = "display_order.asc"
    ): List<GalleryItem>
}
```

### Step 4: Configure OkHttpClient Network Interceptor
Supabase requires two custom headers for authorization and client matching:
1. `apikey` containing your Anon Key.
2. `Authorization` containing `Bearer <Anon Key>`.

```kotlin
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson:GsonConverterFactory

object RetrofitClient {
    private const val BASE_URL = "https://dhijfufoefirkecwsvla.supabase.co/"
    private const val ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaWpmdWZvZWZpcmtlY3dzdmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDAwODUsImV4cCI6MjA5MDYxNjA4NX0.jgAiDCieCFJbh8coQ-yWr7LR96Lzk-N6SJ69w7fLszM"

    private val authInterceptor = Interceptor { chain ->
        val originalRequest = chain.request()
        val authenticatedRequest = originalRequest.newBuilder()
            .header("apikey", ANON_KEY)
            .header("Authorization", "Bearer $ANON_KEY")
            .build()
        chain.proceed(authenticatedRequest)
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .build()

    val apiService: SupabaseApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(SupabaseApiService::class.java)
    }
}
```

---

## 6. Architecture & Implementation Best Practices

### A. Repositories and Lifecycle Coroutines
Always expose fetched data through a safe MVVM repository layer wrapped inside custom UI feedback states (Success, Error, loading).

```kotlin
sealed interface UiState<out T> {
    object Loading : UiState<Nothing>
    data class Success<T>(val data: T) : UiState<T>
    data class Error(val exception: Throwable) : UiState<Nothing>
}
```

### B. Dynamic Image Loading
Verify that your Glide, Coil, or Picasso calls reference the storage prefixes mentioned in Section 3 dynamically. 
```kotlin
// Example using Coil inside Compose
AsyncImage(
    model = product.imageUrl ?: "placeholder_url",
    contentDescription = product.name,
    modifier = Modifier.fillMaxWidth().height(200.dp)
)
```

### C. Offline Caching with Room
For premium offline-first operations:
1. Fetch latest items from Supabase.
2. Persist them locally into a **Room Database**.
3. Expose Room tables to the LiveData / Flow dashboard layer.
4. Set an expiration threshold (e.g., 2 hours cache life) to force remote refreshing.
